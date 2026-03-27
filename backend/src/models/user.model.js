'use strict';

const pool = require('../config/db');

const findUserByEmail = async (email) => {
  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
};

const findUserById = async (id) => {
  const { rows } = await pool.query(
    'SELECT id, name, email, role, created_at FROM users WHERE id = $1',
    [id]
  );
  return rows[0] || null;
};

const createUser = async ({ name, email, password_hash, role = 'user' }) => {
  const { rows } = await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, role, created_at`,
    [name, email, password_hash, role]
  );
  return rows[0];
};

const updateUser = async (id, ObjectUpdates) => {
  const fields = Object.keys(ObjectUpdates);
  if (fields.length === 0) return null;

  const setClause = fields.map((field, i) => `${field} = $${i + 2}`).join(', ');
  const values = [id, ...Object.values(ObjectUpdates)];

  const { rows } = await pool.query(
    `UPDATE users SET ${setClause} WHERE id = $1 RETURNING id, name, email, role, created_at`,
    values
  );
  return rows[0];
};

module.exports = { findUserByEmail, findUserById, createUser, updateUser };
