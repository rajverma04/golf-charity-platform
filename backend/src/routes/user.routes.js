'use strict';

const router = require('express').Router();
const {
  runDraw,
  publishDraw,
  getAdminDrawStatus,
  getLatestDraw,
  uploadProof,
  verifyWinner,
  getCharities,
  setUserCharity,
} = require('../controllers/user.controller');
const { getMyDashboardStats } = require('../controllers/dashboard.controller'); // Added dashboard controller import
const { authMiddleware, adminMiddleware, checkSubscription } = require('../middlewares/auth.middleware');

// ─── Public ────────────────────────────────────────────────────────────────
router.get('/draw/latest', getLatestDraw);
router.get('/charities', getCharities);

// ─── Auth required ─────────────────────────────────────────────────────────
router.use(authMiddleware);

router.get('/dashboard', checkSubscription, getMyDashboardStats); // Added GET /dashboard route
router.post('/winner/upload-proof', checkSubscription, uploadProof);
router.post('/charity', checkSubscription, setUserCharity);

// ─── Admin only ────────────────────────────────────────────────────────────
const { getAllUsers, getPendingWinners, createCharity, updateCharity, deleteCharity } = require('../controllers/admin.controller');

router.get('/admin/users', adminMiddleware, getAllUsers);
router.get('/admin/winners', adminMiddleware, getPendingWinners);
router.get('/admin/draw/status', adminMiddleware, getAdminDrawStatus); // Added route
router.post('/admin/draw/run', adminMiddleware, runDraw);
router.post('/admin/draw/publish', adminMiddleware, publishDraw);
router.post('/admin/winner/verify', adminMiddleware, verifyWinner);

router.post('/admin/charities', adminMiddleware, createCharity);
router.put('/admin/charities/:id', adminMiddleware, updateCharity);
router.delete('/admin/charities/:id', adminMiddleware, deleteCharity);

module.exports = router;
