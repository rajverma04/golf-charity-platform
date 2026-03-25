'use strict';

const asyncHandler = require('../utils/asyncHandler');
const authService = require('../services/auth.service');

const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in prod
    sameSite: 'strict', // Prevent CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days (matches JWT expiration)
  });
};

const signup = asyncHandler(async (req, res) => {
  const result = await authService.signup(req.body);
  setTokenCookie(res, result.token);
  res.status(201).json({ success: true, data: result });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  setTokenCookie(res, result.token);
  res.status(200).json({ success: true, data: result });
});

const getProfile = asyncHandler(async (req, res) => {
  // authMiddleware already validates token and attaches user to req
  res.status(200).json({ success: true, data: req.user });
});

const logout = asyncHandler(async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 5 * 1000), // expire almost immediately
    httpOnly: true,
  });
  res.status(200).json({ success: true, message: 'Logged out successfully' });
});

const updateProfile = asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.status(200).json({ success: true, data: user });
});

module.exports = { signup, login, getProfile, logout, updateProfile };
