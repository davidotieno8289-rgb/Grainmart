// Platform configuration constants
export const CONFIG = {
  MIN_ORDER_AMOUNT: 100, // KSh
  PLATFORM_FEE_PERCENT: 0.02, // 2%
  PREMIUM_FEE_PERCENT: 0.01, // 1% for premium sellers
  PREMIUM_MONTHLY_COST: 999, // KSh
  FEATURED_WEEKLY_COST: 500, // KSh
  MAX_PRICE_MULTIPLIER: 3, // Flag if price > 3x market average
  OWNER_INVITE_CODE: import.meta.env.VITE_OWNER_INVITE_CODE || 'GRAINMART-OWNER-2025',
  
  // Delivery fees
  DELIVERY: {
    standard: { name: 'Standard', days: '2-3 days', fee: 150 },
    express: { name: 'Express', days: 'Same day', fee: 350, cities: ['Nairobi'] },
    pickup: { name: 'Self Pickup', days: 'Coordinate with seller', fee: 0 },
    rider: { name: 'Rider Network', days: 'Real-time', feeRange: [200, 500] },
  },
  
  // Rate limiting
  SIGN_IN_ATTEMPTS_PER_HOUR: 5,
  
  // Dispute window
  DISPUTE_WINDOW_HOURS: 24,
  
  // Review timing
  MIN_REVIEW_TIME_MINUTES: 10,
} as const;

export const CURRENCY = {
  code: 'KES',
  symbol: 'KSh',
  locale: 'en-KE',
} as const;
