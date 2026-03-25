'use strict';

const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware, adminMiddleware, checkSubscription } = require('../middlewares/auth.middleware');
const pool = require('../config/db');
const AppError = require('../utils/appError');

// POST /winner/upload-proof — Winner uploads screenshot
// In a real app we'd use Multer and Supabase Storage.
// Here we expect front-end to upload and pass the URL, or we mock it.
router.post(
  '/upload-proof',
  authMiddleware,
  checkSubscription,
  asyncHandler(async (req, res) => {
    const { drawId, fileUrl } = req.body;

    if (!drawId || !fileUrl) {
      throw new AppError('drawId and fileUrl are required.', 400); 
    }

    // Check if user is a winner
    const verifyWinner = await pool.query(
      `SELECT id FROM winners WHERE user_id = $1 AND draw_id = $2`,
      [req.user.id, drawId]
    );

    if (!verifyWinner.rows.length) {
      throw new AppError('No winning record found for this draw.', 404);
    }

    const { rows } = await pool.query(
      `UPDATE winners SET proof_url = $1, status = 'pending' WHERE id = $2 RETURNING *`,
      [fileUrl, verifyWinner.rows[0].id]
    );

    res.status(200).json({ success: true, data: rows[0], message: 'Proof uploaded for review.' });
  })
);


// POST /admin/winner/verify — Admin verifies and accepts/rejects proof
router.post(
  '/admin/winner/verify',
  authMiddleware,
  adminMiddleware,
  asyncHandler(async (req, res) => {
    const { winnerId, status } = req.body;

    if (!['approved', 'rejected', 'paid'].includes(status)) {
      throw new AppError('Status must be approved, rejected, or paid.', 400);
    }

    const { rows } = await pool.query(
      `UPDATE winners SET status = $1 WHERE id = $2 RETURNING *`,
      [status, winnerId]
    );

    if (!rows.length) {
      throw new AppError('Winner record not found.', 404);
    }

    res.status(200).json({ success: true, data: rows[0], message: `Winner status updated to ${status}.` });
  })
);

module.exports = router;
