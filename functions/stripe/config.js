const functions = require('firebase-functions');
const Stripe = require('stripe');

// Initialize Stripe - will use environment config in production
const stripe = Stripe(
  functions.config().stripe?.secret_key || 
  process.env.STRIPE_SECRET_KEY || 
  'sk_test_51RlfjBKGi7kY2GqSYfSds6HOaydp3TwlM5Kvfa09ylq5g1e7Qu3R9pxsSEW4ivEWOubR6UdlPvMD07PESGoyivqf00kEp6uAF2'
);

// Subscription pricing (you'll replace with real price IDs from Stripe Dashboard)
const SUBSCRIPTION_PRICES = {
  monthly: {
    priceId: 'price_1Rm1lLKGi7kY2GqSj70bU0aY',
    amount: 2999, // $29.99 in cents
    interval: 'month'
  },
  yearly: {
    priceId: 'price_1Rm1m7KGi7kY2GqSGkuW9y96',
    amount: 19999, // $199.99 in cents
    interval: 'year'
  }
};

// Radiance boost pricing
const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2697, description: '3 Sacred Radiance Boosts (Save 10%)' },
  5: { price: 3995, description: '5 Sacred Radiance Boosts (Save 20%)' }
};

module.exports = {
  stripe,
  SUBSCRIPTION_PRICES,
  RADIANCE_PRICING
};