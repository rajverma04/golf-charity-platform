'use strict';

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('../utils/appError');
const { findUserByEmail, createUser } = require('../models/user.model');

const signup = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) throw new AppError('Email already registered.', 409);

  const password_hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  const user = await createUser({ name, email, password_hash });

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  return { token, user };
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) throw new AppError('Invalid email or password.', 401);

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new AppError('Invalid email or password.', 401);

  const token = jwt.sign({ id: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  const { password_hash, ...safeUser } = user;
  return { token, user: safeUser };
};

const updateProfile = async (userId, { name, email, password }) => {
  const updates = {};
  if (name) updates.name = name;
  if (email) {
    const existing = await findUserByEmail(email);
    if (existing && existing.id !== userId) {
      throw new AppError('Email already in use.', 409);
    }
    updates.email = email;
  }
  if (password) {
    updates.password_hash = await bcrypt.hash(password, env.BCRYPT_SALT_ROUNDS);
  }

  const { updateUser } = require('../models/user.model');
  const user = await updateUser(userId, updates);
  if (!user) throw new AppError('User not found.', 404);

  return user;
};

module.exports = { signup, login, updateProfile };
