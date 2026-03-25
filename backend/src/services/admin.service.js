'use strict';

const pool = require('../config/db');
const AppError = require('../utils/appError');

const getAllUsers = async () => {
  const { rows } = await pool.query(`
    SELECT u.id, u.name, u.email, u.role, u.created_at, 
           s.plan, s.status as sub_status, s.end_date 
    FROM users u 
    LEFT JOIN subscriptions s ON s.user_id = u.id
    ORDER BY u.created_at DESC
  `);
  return rows;
};

const getPendingWinners = async () => {
  const { rows } = await pool.query(`
    SELECT w.*, u.name as user_name, u.email as user_email, d.month as draw_date
    FROM winners w
    JOIN users u ON u.id = w.user_id
    JOIN draws d ON d.id = w.draw_id
    ORDER BY w.created_at DESC
  `);
  return rows;
};

const createCharity = async ({ name, description, image_url }) => {
  const { rows } = await pool.query(
    'INSERT INTO charities (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
    [name, description, image_url]
  );
  return rows[0];
};

const updateCharity = async (charityId, { name, description, image_url }) => {
  const { rows } = await pool.query(
    'UPDATE charities SET name=$1, description=$2, image_url=$3 WHERE id=$4 RETURNING *',
    [name, description, image_url, charityId]
  );
  if (!rows.length) throw new AppError('Charity not found', 404);
  return rows[0];
};

const deleteCharity = async (charityId) => {
  const { rows } = await pool.query('DELETE FROM charities WHERE id=$1 RETURNING *', [charityId]);
  if (!rows.length) throw new AppError('Charity not found', 404);
  return rows[0];
};

module.exports = { getAllUsers, getPendingWinners, createCharity, updateCharity, deleteCharity };
