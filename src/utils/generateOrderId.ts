/**
 * Generate a unique order ID in the format GRM-YYYYMMDD-XXXXX
 * @returns A unique order ID string
 */
export function generateOrderId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  
  // Generate a random 5-character alphanumeric string
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return `GRM-${dateStr}-${randomStr}`;
}

/**
 * Validate an order ID format
 * @param orderId - The order ID to validate
 * @returns True if the format is valid
 */
export function isValidOrderId(orderId: string): boolean {
  const pattern = /^GRM-\d{8}-[A-Z0-9]{5}$/;
  return pattern.test(orderId);
}
