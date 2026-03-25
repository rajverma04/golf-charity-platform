'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/appError');
const pool = require('../config/db');

const authMiddleware = async (req, res, next) => {
  try {
    let token;
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      return next(new AppError('No token provided. Please log in.', 401));
    }

    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Attach user from DB
    const { rows } = await pool.query(
      'SELECT id, name, email, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!rows.length) {
      return next(new AppError('User no longer exists.', 401));
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token.', 401));
  }
};

const adminMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new AppError('Access denied. Admins only.', 403));
  }
  next();
};

const checkSubscription = async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `SELECT id FROM subscriptions
       WHERE user_id = $1 AND status = 'active' AND end_date > NOW()
       LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return next(new AppError('Active subscription required.', 403));
    }
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authMiddleware, adminMiddleware, checkSubscription };
