-- -----------------------------------------------------------------------------
-- charity_lottery_seed.sql
-- Generates 10 fake users with active subscriptions and the requested password hash
-- Password for all users: (the user's known plaintext)
-- Hash: $2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC
-- -----------------------------------------------------------------------------

-- 1. Insert 1 Admin and 9 Regular Users
INSERT INTO users (id, name, email, password_hash, role) VALUES
  (gen_random_uuid(), 'Admin Master', 'admin@charity.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'admin'),
  (gen_random_uuid(), 'Tiger Woods', 'tiger@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Rory McIlroy', 'rory@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Phil Mickelson', 'phil@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Dustin Johnson', 'dustin@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Jon Rahm', 'jon@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Brooks Koepka', 'brooks@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Justin Thomas', 'justin@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Collin Morikawa', 'collin@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user'),
  (gen_random_uuid(), 'Scottie Scheffler', 'scottie@golf.com', '$2b$10$AoPmzgBOfL2/q3hi1E/SdO15kaLuyUhn9PF8Rg7h9MhiVXI8fwsOC', 'user')
ON CONFLICT (email) DO NOTHING;

-- 2. Give the 9 regular players Active Subscriptions
-- Using a subselect to dynamically grab the inserted UUIDs based on email domain
INSERT INTO subscriptions (user_id, stripe_subscription_id, plan, status, start_date, end_date)
SELECT 
  id, 
  'sub_fake_' || substr(md5(random()::text), 1, 10), 
  'monthly', 
  'active', 
  CURRENT_TIMESTAMP - INTERVAL '10 days', 
  CURRENT_TIMESTAMP + INTERVAL '20 days'
FROM users WHERE email LIKE '%@golf.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Give them all 10 fake recent scores to fill the leaderboard
INSERT INTO scores (user_id, score, played_at)
SELECT u.id, floor(random() * 45 + 1), CURRENT_DATE - (floor(random() * 30) || ' days')::interval
FROM users u CROSS JOIN generate_series(1,10)
WHERE u.email LIKE '%@golf.com';

-- 4. Create charities (if the table is empty)
INSERT INTO charities (name, description, image_url)
SELECT * FROM (VALUES 
  ('Red Cross', 'Global disaster relief and humanitarian aid.', 'https://placehold.co/400x400/eeeeee/999999?text=Red+Cross'),
  ('Water.org', 'Safe water and sanitation for all.', 'https://placehold.co/400x400/eeeeee/999999?text=Water.org'),
  ('Greenpeace', 'Environmental protection and conservation.', 'https://placehold.co/400x400/eeeeee/999999?text=Greenpeace')
) AS v(name, description, image_url)
WHERE NOT EXISTS (SELECT 1 FROM charities LIMIT 1);

-- 5. Allocate charities for the users randomly
INSERT INTO user_charity (user_id, charity_id, percentage)
SELECT u.id, c.id, 10
FROM users u
JOIN (SELECT id FROM charities ORDER BY random() LIMIT 1) c ON true
WHERE u.email LIKE '%@golf.com'
ON CONFLICT (user_id) DO NOTHING;
