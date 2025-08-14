const Stripe = require('stripe');

// 🔧 Use configLoader instead of dotenv directly
const configLoader = require('../configLoader');

// 🔧 Get Stripe secret key from configLoader
const STRIPE_SECRET_KEY = configLoader.get('stripeSecretKey');

if (!STRIPE_SECRET_KEY) {
  throw new Error('Stripe secret key not configured. Add STRIPE_SECRET_KEY to your .env file');
}

// Initialize Stripe
const stripe = Stripe(STRIPE_SECRET_KEY);

// Updated subscription pricing with new options
const SUBSCRIPTION_PRICES = {
  // Keep existing options for backward compatibility
  monthly: {
    priceId: 'price_1RmyuoGdeC038tAHuLexwVkm',
    amount: 2999, // $29.99 in cents
    interval: 'month'
  },
  yearly: {
    priceId: 'price_1RmyvIGdeC038tAHmUyatrjz',
    amount: 19999, // $199.99 in cents
    interval: 'year'
  },
  // New subscription options
  '1month': {
    priceId: 'price_1RmyuoGdeC038tAHuLexwVkm',
    amount: 2999, // $29.99 in cents
    interval: 'month'
  },
  '3months': {
    priceId: 'price_1RqQWuGdeC038tAH8yfTcqX7',
    amount: 7497, // $74.97 in cents (3 x $24.99)
    interval: 'month',
    interval_count: 3 // Every 3 months
  },
  '6months': {
    priceId: 'price_1RqQYoGdeC038tAHd89pzW5S',
    amount: 11994, // $119.94 in cents (6 x $19.99)
    interval: 'month',
    interval_count: 6 // Every 6 months
  }
};

// Radiance boost pricing (unchanged)
const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2697, description: '3 Sacred Radiance Boosts (Save 10%)' },
  5: { price: 3995, description: '5 Sacred Radiance Boosts (Save 20%)' },
  10: { price: 7499, description: '10 Sacred Radiance Boosts (Save 30%)' },
};

// Lotus prices (unchanged)
const LOTUS_PRICES = {
  1: { amount: 499, pricePerLotus: 4.99 },   // $4.99 for 1 lotus
  3: { amount: 1347, pricePerLotus: 4.49 },  // $13.47 for 3 lotus flowers (10% off)
  5: { amount: 1995, pricePerLotus: 3.99 },  // $19.95 for 5 lotus flowers (20% off)
  10: { amount: 3999, pricePerLotus: 3.99 },  // $39.99 for 10 lotus flowers (30% off)
};

module.exports = {
  stripe,
  SUBSCRIPTION_PRICES,
  RADIANCE_PRICING,
  LOTUS_PRICES
};