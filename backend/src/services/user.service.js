'use strict';

const pool = require('../config/db');
const AppError = require('../utils/appError');

// ─── Draw engine ─────────────────────────────────────────────────────────────

/**
 * Generate 5 random numbers 1–45
 */
const randomDraw = () => {
  const nums = new Set();
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return [...nums].sort((a, b) => a - b);
};

/**
 * Algorithm draw: weighted by average score
 */
const algorithmDraw = async () => {
  // Pick 5 numbers biased toward avg of all user scores
  const { rows } = await pool.query('SELECT AVG(score) as avg FROM scores');
  const avg = Math.round(rows[0].avg || 22);

  const nums = new Set();
  nums.add(Math.min(45, Math.max(1, avg)));
  while (nums.size < 5) nums.add(Math.floor(Math.random() * 45) + 1);
  return [...nums].sort((a, b) => a - b);
};

const ensureFinanceSchema = async () => {
  await pool.query(`ALTER TABLE draws ADD COLUMN IF NOT EXISTS total_pool DECIMAL(12,2) DEFAULT 0;`);
  await pool.query(`ALTER TABLE draws ADD COLUMN IF NOT EXISTS rollover DECIMAL(12,2) DEFAULT 0;`);
  await pool.query(`ALTER TABLE draws ADD COLUMN IF NOT EXISTS simulated_winners JSONB DEFAULT '{}';`);
  await pool.query(`ALTER TABLE draws ADD COLUMN IF NOT EXISTS payouts JSONB DEFAULT '{}';`);
};

const runDraw = async ({ type }) => {
  if (!['random', 'algorithm'].includes(type)) throw new AppError('Invalid draw type.', 400);

  await ensureFinanceSchema();

  const numbers = type === 'random' ? randomDraw() : await algorithmDraw();

  // 1. Calculate the Monthly Prize Pool
  const { rows: subRows } = await pool.query(`SELECT COUNT(*) as count FROM subscriptions WHERE status = 'active'`);
  const activeSubs = parseInt(subRows[0].count) || 0;
  const totalPool = activeSubs * 10.0; // Assume $10 per sub goes to the charity/prize pot

  // 2. Calculate Rollover from previous published draw
  let rollover = 0.0;
  const { rows: prevDraws } = await pool.query(
    `SELECT total_pool, rollover, payouts FROM draws WHERE status = 'published' ORDER BY created_at DESC LIMIT 1`
  );
  if (prevDraws.length > 0) {
    const prev = prevDraws[0];
    const prevPayouts = prev.payouts || {};
    // If nobody won the Match-5 tier last time, the 40% pool + its rollover carries forward!
    const hadMatch5 = prevPayouts['5'] && prevPayouts['5'].count > 0;
    if (!hadMatch5) {
      rollover = (Number(prev.total_pool) * 0.40) + Number(prev.rollover);
    }
  }

  // 3. Scan for Simulated Winners
  const matchCounts = { 3: [], 4: [], 5: [] };
  const { rows: users } = await pool.query(`SELECT user_id FROM subscriptions WHERE status = 'active'`);
  
  for (const user of users) {
    const { rows: scores } = await pool.query(`SELECT score FROM scores WHERE user_id = $1`, [user.user_id]);
    const userNums = scores.map(s => s.score);
    const matched = userNums.filter(n => numbers.includes(n)).length;
    
    if (matched >= 3 && matched <= 5) {
      matchCounts[matched].push(user.user_id);
    }
  }

  // 4. Calculate Payout Blocks
  const payouts = {
    '5': { count: matchCounts[5].length, each: matchCounts[5].length > 0 ? ((totalPool * 0.40) + rollover) / matchCounts[5].length : 0 },
    '4': { count: matchCounts[4].length, each: matchCounts[4].length > 0 ? (totalPool * 0.35) / matchCounts[4].length : 0 },
    '3': { count: matchCounts[3].length, each: matchCounts[3].length > 0 ? (totalPool * 0.25) / matchCounts[3].length : 0 }
  };

  const { rows } = await pool.query(
    `INSERT INTO draws (month, type, numbers, status, total_pool, rollover, simulated_winners, payouts)
     VALUES (DATE_TRUNC('month', NOW()), $1, $2::jsonb, 'draft', $3, $4, $5::jsonb, $6::jsonb)
     RETURNING *`,
    [type, JSON.stringify(numbers), totalPool, rollover, JSON.stringify(matchCounts), JSON.stringify(payouts)]
  );

  return { draw: rows[0], numbers, insights: { totalPool, rollover, payouts } };
};

const publishDraw = async (drawId) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    let targetId = drawId;
    if (!targetId) {
       const { rows: latestDraft } = await client.query(`SELECT id FROM draws WHERE status = 'draft' ORDER BY created_at DESC LIMIT 1`);
       if (latestDraft.length) targetId = latestDraft[0].id;
    }

    if (!targetId) throw new AppError('No draft draw found to publish.', 404);

    const { rows: draws } = await client.query(
      `UPDATE draws SET status = 'published' WHERE id = $1 AND status = 'draft' RETURNING *`,
      [targetId]
    );
    if (!draws.length) throw new AppError('Draw not found or already published.', 404);

    const draw = draws[0];
    const matchCounts = draw.simulated_winners || { 3: [], 4: [], 5: [] };
    const payouts = draw.payouts || {};

    // Wipe any existing pending winners strictly for this draw (idempotency)
    await client.query(`DELETE FROM winners WHERE draw_id = $1`, [drawId]);

    // Insert new winners with exact cash amounts!
    for (const type of ['3', '4', '5']) {
      const uids = matchCounts[type] || [];
      const prizeEach = payouts[type]?.each || 0;
      
      for (const uid of uids) {
        await client.query(
          `INSERT INTO winners (user_id, draw_id, match_type, prize_amount, status)
           VALUES ($1, $2, $3, $4, 'pending')`,
          [uid, drawId, type, prizeEach]
        );
      }
    }

    await client.query('COMMIT');
    return draw;
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
};

const getLatestDraw = async () => {
  const { rows: draws } = await pool.query(
    `SELECT * FROM draws WHERE status = 'published' ORDER BY created_at DESC LIMIT 1`
  );
  if (!draws.length) return null;

  const draw = draws[0];
  const { rows: winners } = await pool.query(
    `SELECT w.*, u.name FROM winners w JOIN users u ON u.id = w.user_id
     WHERE w.draw_id = $1`,
    [draw.id]
  );

  return { ...draw, winners };
};

const getAdminDrawStatus = async () => {
  const { rows } = await pool.query(
    `SELECT * FROM draws ORDER BY created_at DESC LIMIT 1`
  );
  return rows[0] || null;
};

// ─── Winner management ────────────────────────────────────────────────────────

const PRIZE_SPLIT = { 5: 0.4, 4: 0.35, 3: 0.25 };

const uploadProof = async (userId, { drawId, file }) => {
  if (!file) throw new AppError('Proof file URL is required.', 400);

  const { rows: drawRows } = await pool.query(
    `SELECT * FROM draws WHERE id = $1 AND status = 'published'`,
    [drawId]
  );
  if (!drawRows.length) throw new AppError('Published draw not found.', 404);

  const { rows } = await pool.query(
    `UPDATE winners 
     SET proof_url = $1, status = 'pending' 
     WHERE user_id = $2 AND draw_id = $3
     RETURNING *`,
    [file, userId, drawId]
  );

  if (!rows.length) {
    throw new AppError('No eligible winning record found for this draw.', 400);
  }

  return rows[0];
};

const verifyWinner = async ({ winnerId, status }) => {
  if (!['approved', 'rejected', 'paid'].includes(status)) {
    throw new AppError('Invalid status.', 400);
  }

  const { rows } = await pool.query(
    `UPDATE winners SET status = $1 WHERE id = $2 RETURNING *`,
    [status, winnerId]
  );
  if (!rows.length) throw new AppError('Winner not found.', 404);
  return rows[0];
};

// ─── Charity ──────────────────────────────────────────────────────────────────

const getCharities = async () => {
  const { rows } = await pool.query('SELECT * FROM charities ORDER BY name');
  return rows;
};

const setUserCharity = async (userId, { charityId, percentage }) => {
  if (percentage < 10) throw new AppError('Minimum percentage is 10%.', 400);

  // Upsert
  const { rows } = await pool.query(
    `INSERT INTO user_charity (user_id, charity_id, percentage)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id) DO UPDATE SET charity_id = $2, percentage = $3
     RETURNING *`,
    [userId, charityId, percentage]
  );
  return rows[0];
};

module.exports = {
  runDraw,
  publishDraw,
  getLatestDraw,
  getAdminDrawStatus,
  uploadProof,
  verifyWinner,
  getCharities,
  setUserCharity,
};
