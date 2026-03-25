'use strict';
require('dotenv').config();

const pool = require('../config/db');

const runMigrations = async () => {
  try {
    console.log('🔄 Running database migrations...');

    // 1. Draws Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS draws (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        month DATE NOT NULL,
        type VARCHAR(50) CHECK (type IN ('random', 'algorithm')) NOT NULL,
        numbers INT[] NOT NULL,
        status VARCHAR(50) CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ "draws" table ready.');

    // 2. Winners Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS winners (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        draw_id UUID REFERENCES draws(id) ON DELETE CASCADE,
        match_type VARCHAR(10) CHECK (match_type IN ('3', '4', '5')) NOT NULL,
        prize_amount DECIMAL(10, 2) DEFAULT 0.00,
        proof_url TEXT,
        status VARCHAR(50) CHECK (status IN ('pending', 'approved', 'rejected', 'paid')) DEFAULT 'pending'
      );
    `);
    console.log('✅ "winners" table ready.');

    // 3. Charities Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS charities (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ "charities" table ready.');

    // 4. User Charity Selection Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_charity (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
        charity_id UUID REFERENCES charities(id) ON DELETE CASCADE,
        percentage DECIMAL(5, 2) CHECK (percentage >= 10 AND percentage <= 100),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ "user_charity" table ready.');

    console.log('🎉 All migrations completed successfully.');
  } catch (err) {
    console.error('❌ Migration failed:', err);
  } finally {
    await pool.end();
  }
};

runMigrations();
