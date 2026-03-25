'use strict';

const asyncHandler = require('../utils/asyncHandler');
const scoreService = require('../services/score.service');

const addScore = asyncHandler(async (req, res) => {
  const result = await scoreService.addUserScore(req.user.id, req.body);
  res.status(201).json({ success: true, message: 'Score added', data: result });
});

const getScores = asyncHandler(async (req, res) => {
  const scores = await scoreService.getUserScores(req.user.id);
  res.status(200).json({ success: true, data: scores });
});

const editScore = asyncHandler(async (req, res) => {
  const result = await scoreService.editUserScore(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, message: 'Score updated', data: result });
});

const getGlobalLeaderboard = asyncHandler(async (req, res) => {
  const scores = await scoreService.getGlobalLeaderboard();
  res.status(200).json({ success: true, data: scores });
});

module.exports = { addScore, getScores, editScore, getGlobalLeaderboard };
