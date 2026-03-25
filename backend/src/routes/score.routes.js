'use strict';

const express = require('express');
const { addScore, getScores, editScore, getGlobalLeaderboard } = require('../controllers/score.controller');
const { authMiddleware, checkSubscription } = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', checkSubscription, addScore);
router.get('/', checkSubscription, getScores);
router.get('/leaderboard', getGlobalLeaderboard);
router.put('/:id', checkSubscription, editScore);

module.exports = router;
