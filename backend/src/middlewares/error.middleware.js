'use strict';

const env = require('../config/env');

const errorMiddleware = (err, req, res, next) => {
  let { statusCode = 500, message } = err;

  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', err);
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired. Please log in again.';
  }

  // Handle Postgres unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'A record with this value already exists.';
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorMiddleware;
