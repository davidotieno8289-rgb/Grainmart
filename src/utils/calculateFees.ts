import { CONFIG } from '@/constants/config';
import { CartItem, DeliveryMethod } from '@/types';

interface FeeCalculation {
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
}

/**
 * Calculate platform fee based on seller premium status
 * @param subtotal - The order subtotal
 * @param isPremiumSeller - Whether the seller is premium
 * @returns The platform fee amount
 */
export function calculatePlatformFee(subtotal: number, isPremiumSeller: boolean = false): number {
  const feePercent = isPremiumSeller 
    ? CONFIG.PREMIUM_FEE_PERCENT 
    : CONFIG.PLATFORM_FEE_PERCENT;
  
  return Math.round(subtotal * feePercent);
}

/**
 * Calculate delivery fee based on method and distance
 * @param method - The delivery method
 * @param distanceKm - Optional distance in kilometers for rider network
 * @returns The delivery fee
 */
export function calculateDeliveryFee(
  method: DeliveryMethod, 
  distanceKm?: number
): number {
  switch (method) {
    case 'standard':
      return CONFIG.DELIVERY.standard.fee;
    case 'express':
      return CONFIG.DELIVERY.express.fee;
    case 'pickup':
      return CONFIG.DELIVERY.pickup.fee;
    case 'rider':
      // Calculate based on distance, with min/max bounds
      if (distanceKm) {
        const [min, max] = CONFIG.DELIVERY.rider.feeRange;
        const calculated = Math.round(min + (distanceKm * 15)); // KSh 15 per km
        return Math.min(Math.max(calculated, min), max);
      }
      return CONFIG.DELIVERY.rider.feeRange[0];
    default:
      return 0;
  }
}

/**
 * Calculate all fees for a cart
 * @param items - Cart items
 * @param deliveryMethod - Selected delivery method
 * @param isPremiumSeller - Whether seller is premium (for single-seller carts)
 * @param distanceKm - Distance for rider delivery
 * @returns Complete fee breakdown
 */
export function calculateOrderFees(
  items: CartItem[],
  deliveryMethod: DeliveryMethod,
  isPremiumSeller: boolean = false,
  distanceKm?: number
): FeeCalculation {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const platformFee = calculatePlatformFee(subtotal, isPremiumSeller);
  const deliveryFee = calculateDeliveryFee(deliveryMethod, distanceKm);
  const total = subtotal + platformFee + deliveryFee;
  
  return {
    subtotal,
    platformFee,
    deliveryFee,
    total,
  };
}

/**
 * Check if a cart meets minimum order requirements
 * @param items - Cart items
 * @returns Object with validation result and any errors
 */
export function validateCartMinimum(items: CartItem[]): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check overall cart minimum
  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  if (totalAmount < CONFIG.MIN_ORDER_AMOUNT) {
    errors.push(`Minimum order amount is KSh ${CONFIG.MIN_ORDER_AMOUNT}`);
  }
  
  // Check per-item minimums
  items.forEach(item => {
    if (item.quantity < item.minOrderKg) {
      errors.push(`${item.productName} requires minimum ${item.minOrderKg}kg`);
    }
    
    const itemTotal = item.price * item.quantity;
    if (itemTotal < CONFIG.MIN_ORDER_AMOUNT) {
      errors.push(`${item.productName} subtotal must be at least KSh ${CONFIG.MIN_ORDER_AMOUNT}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Calculate seller earnings after platform fees
 * @param saleAmount - Total sale amount
 * @param isPremium - Whether seller is premium
 * @returns Net earnings for the seller
 */
export function calculateSellerEarnings(saleAmount: number, isPremium: boolean = false): number {
  const fee = calculatePlatformFee(saleAmount, isPremium);
  return saleAmount - fee;
}
