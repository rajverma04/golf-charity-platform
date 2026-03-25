'use strict';

const router = require('express').Router();
const { authMiddleware, adminMiddleware, checkSubscription } = require('../middlewares/auth.middleware');
const {
  runDraw,
  publishDraw,
  getLatestDraw
} = require('../controllers/user.controller');

// POST /admin/draw/run — Admin runs a new draft draw
router.post('/admin/draw/run', authMiddleware, adminMiddleware, runDraw);

// POST /admin/draw/publish — Admin publishes a draw
router.post('/admin/draw/publish', authMiddleware, adminMiddleware, publishDraw);

// GET /draw/latest — Any active subscriber gets the latest published draw
router.get('/draw/latest', authMiddleware, checkSubscription, getLatestDraw);

module.exports = router;
