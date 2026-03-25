'use strict';

const router = require('express').Router();
const asyncHandler = require('../utils/asyncHandler');
const { authMiddleware } = require('../middlewares/auth.middleware');
const pool = require('../config/db');
const AppError = require('../utils/appError');

const stripe = require('../config/stripe');
const env = require('../config/env');

// POST /subscription/create — create a subscription record
router.post(
  '/create',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { plan } = req.body;
    if (!['monthly', 'yearly'].includes(plan)) {
      throw new AppError('Plan must be "monthly" or "yearly".', 400);
    }

    // Determine price dynamically or use static config
    // In a real app, you would use actual Stripe Price IDs here.
    const amount = plan === 'monthly' ? 999 : 9999; // $9.99 or $99.99

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Charity Lottery - ${plan === 'monthly' ? 'Monthly' : 'Yearly'} Plan`,
            },
            unit_amount: amount,
            recurring: { interval: plan === 'monthly' ? 'month' : 'year' },
          },
          quantity: 1,
        },
      ],
      client_reference_id: req.user.id,
      metadata: {
        userId: req.user.id,
        plan: plan,
      },
      success_url: `${env.CORS_ORIGIN}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.CORS_ORIGIN}/payment-cancelled`,
    });

    res.status(201).json({
      success: true,
      data: { checkoutUrl: session.url },
    });
  })
);

// We export the webhookHandler so app.js can mount it securely with express.raw()
const webhookHandler = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.metadata.userId;
    const plan = session.metadata.plan;

    if (userId && plan) {
      const durationDays = plan === 'monthly' ? 30 : 365;
      
      try {
        await pool.query(
          `INSERT INTO subscriptions (user_id, plan, status, start_date, end_date, stripe_subscription_id)
           VALUES ($1, $2, 'active', NOW(), NOW() + INTERVAL '${durationDays} days', $3)
           ON CONFLICT (user_id)
           DO UPDATE SET plan=$2, status='active', start_date=NOW(),
                         end_date=NOW() + INTERVAL '${durationDays} days', stripe_subscription_id=$3`,
          [userId, plan, session.subscription]
        );
        console.log(`✅ Subscription activated for User ID: ${userId} based on Stripe event.`);
      } catch (dbErr) {
        console.error('❌ DB Error while activating subscription:', dbErr.message);
      }
    }
  }

  res.json({ received: true });
};

// Also attach the webhook property to the router object so it can be extracted in app.js
router.webhookHandler = webhookHandler;

// GET /subscription/status
router.get(
  '/status',
  authMiddleware,
  asyncHandler(async (req, res) => {
    const { rows } = await pool.query(
      `SELECT status, end_date FROM subscriptions WHERE user_id = $1 ORDER BY end_date DESC LIMIT 1`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(200).json({ success: true, data: { status: 'none', expiresAt: null } });
    }

    res.status(200).json({
      success: true,
      data: { status: rows[0].status, expiresAt: rows[0].end_date },
    });
  })
);

module.exports = router;
