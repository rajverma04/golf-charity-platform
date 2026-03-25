'use strict';

const router = require('express').Router();
const { 
  getAllUsers, 
  getPendingWinners, 
  createCharity, 
  updateCharity, 
  deleteCharity 
} = require('../controllers/admin.controller');
const { authMiddleware, adminMiddleware } = require('../middlewares/auth.middleware');

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/users', getAllUsers);
router.get('/winners', getPendingWinners);
router.post('/charities', createCharity);
router.put('/charities/:id', updateCharity);
router.delete('/charities/:id', deleteCharity);

module.exports = router;
