-- ============================================================
-- Charity Lottery Backend — Database Migration
-- Run this in Supabase SQL editor or psql
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT        NOT NULL,
  email         TEXT        UNIQUE NOT NULL,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id                     UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan                   TEXT        NOT NULL CHECK (plan IN ('monthly','yearly')),
  status                 TEXT        NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive','cancelled')),
  start_date             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date               TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT,
  UNIQUE (user_id)
);

-- ─── SCORES ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS scores (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  score      INT         NOT NULL CHECK (score BETWEEN 1 AND 45),
  played_at  DATE        NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── DRAWS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS draws (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  month      DATE        NOT NULL,
  type       TEXT        NOT NULL CHECK (type IN ('random','algorithm')),
  numbers    JSONB       NOT NULL DEFAULT '[]',
  status     TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── WINNERS ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS winners (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  draw_id      UUID        NOT NULL REFERENCES draws(id) ON DELETE CASCADE,
  match_type   TEXT        NOT NULL CHECK (match_type IN ('3','4','5')),
  prize_amount DECIMAL(12,2),
  proof_url    TEXT,
  status       TEXT        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','paid')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── CHARITIES ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS charities (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  description TEXT,
  image_url   TEXT
);

-- ─── USER_CHARITY ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_charity (
  id          UUID    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  charity_id  UUID    NOT NULL REFERENCES charities(id) ON DELETE CASCADE,
  percentage  DECIMAL CHECK (percentage >= 10),
  UNIQUE (user_id)
);

-- ─── SEED: sample charities ───────────────────────────────────────────────────
INSERT INTO charities (name, description, image_url) VALUES
  ('Red Cross', 'Humanitarian aid worldwide', 'https://example.com/redcross.png'),
  ('UNICEF', 'Children''s welfare globally', 'https://example.com/unicef.png'),
  ('WWF', 'Wildlife & environment conservation', 'https://example.com/wwf.png')
ON CONFLICT DO NOTHING;
