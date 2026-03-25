'use strict';

const pool = require('../config/db');
const AppError = require('../utils/appError');
const { addScore, getScoresByUser } = require('../models/score.model');

const addUserScore = async (userId, { score, date }) => {
  if (score < 1 || score > 45) throw new AppError('Score must be between 1 and 45.', 400);

  const playedAt = date || new Date().toISOString().split('T')[0];
  const newScore = await addScore(userId, score, playedAt);
  return newScore;
};

const editUserScore = async (userId, scoreId, { score }) => {
  if (score < 1 || score > 45) throw new AppError('Score must be between 1 and 45.', 400);

  const { rows } = await pool.query( // Using pool requires requiring pool here! Wait, the model handles DB. Let's just write raw pool here or better yet add it to score.model.js. Actually just doing it here is fast but I need to `require` pool.
    `UPDATE scores SET score = $1 WHERE id = $2 AND user_id = $3 RETURNING *`,
    [score, scoreId, userId]
  );
  if (!rows.length) throw new AppError('Score not found or access denied.', 404);
  return rows[0];
};

const getUserScores = async (userId) => {
  return getScoresByUser(userId);
};

const getGlobalLeaderboard = async () => {
  const { rows } = await pool.query(`
    SELECT s.id, s.score, s.played_at, u.name as user_name 
    FROM scores s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.played_at DESC, s.score ASC
    LIMIT 50
  `);
  return rows;
};

module.exports = { addUserScore, editUserScore, getUserScores, getGlobalLeaderboard };
