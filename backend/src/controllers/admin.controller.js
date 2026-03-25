'use strict';

const asyncHandler = require('../utils/asyncHandler');
const adminService = require('../services/admin.service');

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers();
  res.status(200).json({ success: true, data: users });
});

const getPendingWinners = asyncHandler(async (req, res) => {
  const winners = await adminService.getPendingWinners();
  res.status(200).json({ success: true, data: winners });
});

const createCharity = asyncHandler(async (req, res) => {
  const charity = await adminService.createCharity(req.body);
  res.status(201).json({ success: true, data: charity });
});

const updateCharity = asyncHandler(async (req, res) => {
  const charity = await adminService.updateCharity(req.params.id, req.body);
  res.status(200).json({ success: true, data: charity });
});

const deleteCharity = asyncHandler(async (req, res) => {
  await adminService.deleteCharity(req.params.id);
  res.status(200).json({ success: true, message: 'Charity deleted' });
});

module.exports = { getAllUsers, getPendingWinners, createCharity, updateCharity, deleteCharity };
