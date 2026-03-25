'use strict';

const router = require('express').Router();
const { signup, login, getProfile, logout, updateProfile } = require('../controllers/auth.controller');
const { signupSchema, loginSchema, validate } = require('../validators/auth.validator');
const { authMiddleware } = require('../middlewares/auth.middleware');

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);

router.get('/profile', authMiddleware, getProfile);
router.put('/profile', authMiddleware, updateProfile);
router.post('/logout', logout);

module.exports = router;
