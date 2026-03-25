'use strict';

const asyncHandler = require('../utils/asyncHandler');
const userService = require('../services/user.service');

// ─── Admin: Draw ─────────────────────────────────────────────────────────────

const runDraw = asyncHandler(async (req, res) => {
  const result = await userService.runDraw(req.body);
  res.status(200).json({ success: true, data: result });
});

const publishDraw = asyncHandler(async (req, res) => {
  const { drawId } = req.body || {};
  const draw = await userService.publishDraw(drawId);
  res.status(200).json({ success: true, data: draw });
});

const getLatestDraw = asyncHandler(async (req, res) => {
  const draw = await userService.getLatestDraw();
  res.status(200).json({ success: true, data: draw });
});

const getAdminDrawStatus = asyncHandler(async (req, res) => {
  const draw = await userService.getAdminDrawStatus();
  res.status(200).json({ success: true, data: draw });
});

// ─── Winner ───────────────────────────────────────────────────────────────────

const uploadProof = asyncHandler(async (req, res) => {
  const result = await userService.uploadProof(req.user.id, req.body);
  res.status(201).json({ success: true, data: result });
});

const verifyWinner = asyncHandler(async (req, res) => {
  const result = await userService.verifyWinner(req.body);
  res.status(200).json({ success: true, data: result });
});

// ─── Charity ──────────────────────────────────────────────────────────────────

const getCharities = asyncHandler(async (req, res) => {
  const charities = await userService.getCharities();
  res.status(200).json({ success: true, data: charities });
});

const setUserCharity = asyncHandler(async (req, res) => {
  const result = await userService.setUserCharity(req.user.id, req.body);
  res.status(200).json({ success: true, data: result });
});

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
