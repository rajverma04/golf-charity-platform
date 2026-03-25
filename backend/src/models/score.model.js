'use strict';

const pool = require('../config/db');

const MAX_SCORES = 5;

const addScore = async (userId, score, playedAt) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert new score
    const { rows } = await client.query(
      `INSERT INTO scores (user_id, score, played_at)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [userId, score, playedAt]
    );

    // Delete oldest scores beyond limit
    await client.query(
      `DELETE FROM scores
       WHERE user_id = $1
         AND id NOT IN (
           SELECT id FROM scores
           WHERE user_id = $1
           ORDER BY played_at DESC, created_at DESC
           LIMIT $2
         )`,
      [userId, MAX_SCORES]
    );

    await client.query('COMMIT');
    return rows[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getScoresByUser = async (userId) => {
  const { rows } = await pool.query(
    `SELECT id, score, played_at, created_at
     FROM scores
     WHERE user_id = $1
     ORDER BY played_at DESC
     LIMIT $2`,
    [userId, MAX_SCORES]
  );
  return rows;
};

module.exports = { addScore, getScoresByUser };
