'use strict';

const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../middlewares/auth.middleware');
const pool = require('../config/db');
const AppError = require('../utils/appError');

// GET /charities — list all available charities
router.get(
  '/charities',
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM charities ORDER BY name ASC');
    res.status(200).json({ success: true, data: rows });
  })
);

// POST /user/charity — user selects a charity and percentage
router.post(
  '/user/charity',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { charityId, percentage } = req.body;

    if (!charityId || !percentage) {
      throw new AppError('Charity ID and percentage are required.', 400);
    }
    if (percentage < 10 || percentage > 100) {
      throw new AppError('Percentage must be between 10 and 100.', 400);
    }

    // Verify charity exists
    const charityCheck = await pool.query('SELECT id FROM charities WHERE id = $1', [charityId]);
    if (!charityCheck.rows.length) {
      throw new AppError('Invalid charity ID.', 404);
    }

    const { rows } = await pool.query(
      `INSERT INTO user_charity (user_id, charity_id, percentage)
       VALUES ($1, $2, $3)
       ON CONFLICT (user_id) DO UPDATE SET charity_id = $2, percentage = $3
       RETURNING *`,
      [req.user.id, charityId, percentage]
    );

    res.status(200).json({ success: true, data: rows[0], message: 'Charity preference updated.' });
  })
);

module.exports = router;
