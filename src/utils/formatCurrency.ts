import { CURRENCY } from '@/constants/config';

/**
 * Format a number as Kenyan Shillings currency
 * @param amount - The amount to format
 * @returns Formatted string like "KSh 1,234"
 */
export function formatCurrency(amount: number): string {
  const formatted = new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.round(amount));
  
  return `${CURRENCY.symbol} ${formatted}`;
}

/**
 * Format a number as currency with decimals for precise calculations
 * @param amount - The amount to format
 * @returns Formatted string like "KSh 1,234.50"
 */
export function formatCurrencyPrecise(amount: number): string {
  const formatted = new Intl.NumberFormat(CURRENCY.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  
  return `${CURRENCY.symbol} ${formatted}`;
}

/**
 * Parse a currency string back to a number
 * @param value - The currency string to parse
 * @returns The numeric value
 */
export function parseCurrency(value: string): number {
  const cleaned = value.replace(/[^\d.-]/g, '');
  return parseFloat(cleaned) || 0;
}
