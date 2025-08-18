// Shared pricing configuration - single source of truth for all pricing
// This file is imported by both functions and React Native components

export const SUBSCRIPTION_PRICES = {
  monthly: {
    priceId: 'price_1RmyuoGdeC038tAHuLexwVkm',
    amount: 2997, // $29.97 in cents
    interval: 'month'
  },
  yearly: {
    priceId: 'price_1RmyvIGdeC038tAHmUyatrjz',
    amount: 14382, // $143.82 in cents (60% off annual)
    interval: 'year'
  },
  '1month': {
    priceId: 'price_1RmyuoGdeC038tAHuLexwVkm',
    amount: 2997, // $29.97 in cents
    interval: 'month'
  },
  '3months': {
    priceId: 'price_1RqQWuGdeC038tAH8yfTcqX7',
    amount: 6748, // $67.48 in cents (25% off 3-month)
    interval: 'month',
    interval_count: 3
  },
  '6months': {
    priceId: 'price_1RqQYoGdeC038tAHd89pzW5S',
    amount: 10782, // $107.82 in cents (40% off 6-month)
    interval: 'month',
    interval_count: 6
  }
};

export const RADIANCE_PRICING = {
  1: { price: 999, description: '1 Sacred Radiance Boost' },
  3: { price: 2397, description: '3 Sacred Radiance Boosts (Save 20%)' },
  5: { price: 3747, description: '5 Sacred Radiance Boosts (Save 25%)' },
  10: { price: 6999, description: '10 Sacred Radiance Boosts (Save 30%)' },
};

export const LOTUS_PRICES = {
  1: { amount: 399, pricePerLotus: 3.99 },   // $3.99 for 1 lotus (match Hinge)
  3: { amount: 899, pricePerLotus: 2.99 },   // $8.99 for 3 lotus flowers (25% off)
  5: { amount: 1497, pricePerLotus: 2.99 },  // $14.97 for 5 lotus flowers (25% off)
  10: { amount: 2394, pricePerLotus: 2.39 }, // $23.94 for 10 lotus flowers (40% off)
};

// Helper functions to convert cents to dollars
export const centsToDollars = (cents: number): number => cents / 100;

// Helper functions to get formatted prices
export const getSubscriptionPrice = (plan: keyof typeof SUBSCRIPTION_PRICES): number => {
  return centsToDollars(SUBSCRIPTION_PRICES[plan].amount);
};

export const getRadiancePrice = (count: keyof typeof RADIANCE_PRICING): number => {
  return centsToDollars(RADIANCE_PRICING[count].price);
};

export const getLotusPrice = (count: keyof typeof LOTUS_PRICES): number => {
  return LOTUS_PRICES[count].pricePerLotus;
};

export const getLotusTotalPrice = (count: keyof typeof LOTUS_PRICES): number => {
  return LOTUS_PRICES[count].amount / 100;
};
