'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');

const env = require('./config/env');
const errorMiddleware = require('./middlewares/error.middleware');

// Routes
const authRoutes = require('./routes/auth.routes');
const scoreRoutes = require('./routes/score.routes');
const userRoutes = require('./routes/user.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const charityRoutes = require('./routes/charity.routes');
const drawRoutes = require('./routes/draw.routes');
const winnerRoutes = require('./routes/winner.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// ─── Security Middlewares ──────────────────────────────────────────────────
// Helmet disabled during development (causes 403 in Postman due to crossOriginResourcePolicy)
if (env.NODE_ENV === 'production') {
  app.use(helmet());
}
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true // Crucial for cookies
}));

// ─── Stripe Webhook (Must be before express.json!) ──────────────────────────
// We mount this specific route here because Stripe needs the raw request body to verify signatures.
app.use('/subscription/webhook', express.raw({ type: 'application/json' }), subscriptionRoutes.webhookHandler);

// ─── Body & Cookie parsers ──────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logger ────────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running 🚀' });
});

// ─── API Routes ────────────────────────────────────────────────────────────
app.use('/auth', authRoutes);
app.use('/scores', scoreRoutes);
app.use('/subscription', subscriptionRoutes);
app.use(charityRoutes);
app.use(drawRoutes);
app.use('/winner', winnerRoutes);
app.use('/admin', adminRoutes);
app.use('/', userRoutes);

// ─── 404 handler ──────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use(errorMiddleware);

module.exports = app;
