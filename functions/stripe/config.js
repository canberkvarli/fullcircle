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

// Import shared pricing configuration
const { SUBSCRIPTION_PRICES, RADIANCE_PRICING, LOTUS_PRICES } = require('../pricingConfig');

module.exports = {
  stripe,
  SUBSCRIPTION_PRICES,
  RADIANCE_PRICING,
  LOTUS_PRICES
};