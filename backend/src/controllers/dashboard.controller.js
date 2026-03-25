'use strict';

const pool = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');

const getMyDashboardStats = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // 1. Get exact Subscription status & Stripe Renewal Date
  const { rows: subs } = await pool.query(
    'SELECT plan, status, end_date FROM subscriptions WHERE user_id = $1 LIMIT 1',
    [userId]
  );
  const subscription = subs.length ? subs[0] : null;

  // 2. Get User's Total Money Won & Payment states
  const { rows: winnings } = await pool.query(
    'SELECT w.id, w.prize_amount, w.status, w.match_type, d.month as draw_date FROM winners w JOIN draws d ON d.id = w.draw_id WHERE w.user_id = $1 ORDER BY w.created_at DESC',
    [userId]
  );
  
  const totalMoneyWon = winnings.reduce((acc, curr) => acc + (curr.status === 'paid' ? Number(curr.prize_amount) : 0), 0);
  const pendingMoney = winnings.reduce((acc, curr) => acc + (curr.status === 'pending' ? Number(curr.prize_amount) : 0), 0);

  // 3. Get Charity Contribution metrics
  const { rows: charityRows } = await pool.query(
    'SELECT c.name, uc.percentage FROM user_charity uc JOIN charities c ON c.id = uc.charity_id WHERE uc.user_id = $1 LIMIT 1',
    [userId]
  );
  const charity = charityRows.length ? charityRows[0] : null;

  res.status(200).json({
    success: true,
    data: {
      subscription,
      winningsLedger: winnings,
      financials: { totalMoneyWon, pendingMoney },
      charity
    }
  });
});

module.exports = { getMyDashboardStats };
