const functions = require('firebase-functions');
const Stripe = require('stripe');

// Get Stripe secret key from Firebase Functions config
const STRIPE_SECRET_KEY = functions.config().stripe?.secret_key;

if (!STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key not configured. Run: firebase functions:config:set stripe.secret_key="your_key"');
}

// Initialize Stripe
const stripe = Stripe(STRIPE_SECRET_KEY);

// Subscription pricing (update these with your actual Stripe price IDs)
const SUBSCRIPTION_PRICES = {
  monthly: {
    priceId: 'price_1RmyuoGdeC038tAHuLexwVkm',
    amount: 2999, // $29.99 in cents
    interval: 'month'
  },
  yearly: {
    priceId: 'price_1RmyvIGdeC038tAHmUyatrjz',
    amount: 19999, // $199.99 in cents
    interval: 'year'
  }
};

// Radiance boost pricing
const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2697, description: '3 Sacred Radiance Boosts (Save 10%)' },
  5: { price: 3995, description: '5 Sacred Radiance Boosts (Save 20%)' },
  10: { price: 7499, description: '10 Sacred Radiance Boosts (Save 30%)' },
};

const ORB_PRICES = {
  1: { amount: 499, pricePerOrb: 4.99 },   // $4.99 for 1 orb
  3: { amount: 1347, pricePerOrb: 4.49 },  // $13.47 for 3 orbs (10% off)
  5: { amount: 1995, pricePerOrb: 3.99 },  // $19.95 for 5 orbs (20% off)
  10: { amount: 3999, pricePerOrb: 3.99 },  // $39.99 for 10 orbs (30% off)
};

module.exports = {
  stripe,
  SUBSCRIPTION_PRICES,
  RADIANCE_PRICING,
  ORB_PRICES
};