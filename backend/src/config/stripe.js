'use strict';

const Stripe = require('stripe');
const env = require('./env');

const stripe = Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Keep API version consistent
});

module.exports = stripe;
