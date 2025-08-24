// Shared pricing configuration - single source of truth for all pricing
// This file is imported by both functions and React Native components

const SUBSCRIPTION_PRICES = {
  yearly: {
    priceId: 'price_1RxZd8GdeC038tAHzeGZHPbi',
    amount: 14382, // $143.82 in cents (60% off annual)
    interval: 'year'
  },
  '1month': {
    priceId: 'price_1RxZajGdeC038tAHFTD65Kmx',
    amount: 2997, // $29.97 in cents
    interval: 'month'
  },
  '3months': {
    priceId: 'price_1RxZbsGdeC038tAHKrtyAw6R',
    amount: 6748, // $67.48 in cents (25% off 3-month)
    interval: 'month',
    interval_count: 3
  },
  '6months': {
    priceId: 'price_1RxZcaGdeC038tAHOsxnep9m',
    amount: 10782, // $107.82 in cents (40% off 6-month)
    interval: 'month',
    interval_count: 6
  }
};

const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2397, description: '3 Sacred Radiance Boosts (Save 20%)' },
  5: { price: 3747, description: '5 Sacred Radiance Boosts (Save 25%)' },
  10: { price: 6999, description: '10 Sacred Radiance Boosts (Save 30%)' },
};

const LOTUS_PRICES = {
  1: { amount: 399, pricePerLotus: 3.99 },   // $3.99 for 1 lotus (match Hinge)
  3: { amount: 899, pricePerLotus: 2.99 },   // $8.99 for 3 lotus flowers (25% off)
  5: { amount: 1497, pricePerLotus: 2.99 },  // $14.97 for 5 lotus flowers (25% off)
  10: { amount: 2394, pricePerLotus: 2.39 }, // $23.94 for 10 lotus flowers (40% off)
};

// Helper functions to convert cents to dollars
const centsToDollars = (cents) => cents / 100;

// Helper functions to get formatted prices
const getSubscriptionPrice = (plan) => {
  return centsToDollars(SUBSCRIPTION_PRICES[plan].amount);
};

const getRadiancePrice = (count) => {
  return centsToDollars(RADIANCE_PRICING[count].price);
};

const getLotusPrice = (count) => {
  return LOTUS_PRICES[count].pricePerLotus;
};

const getLotusTotalPrice = (count) => {
  return LOTUS_PRICES[count].amount / 100;
};

module.exports = {
  SUBSCRIPTION_PRICES,
  RADIANCE_PRICING,
  LOTUS_PRICES,
  centsToDollars,
  getSubscriptionPrice,
  getRadiancePrice,
  getLotusPrice,
  getLotusTotalPrice
};
