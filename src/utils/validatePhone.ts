/**
 * Kenyan phone number validation and formatting
 * Supports formats: 07XX, 01XX, +254XX, 254XX
 */

// Regex pattern for Kenyan phone numbers
const KENYAN_PHONE_REGEX = /^(?:254|\+254|0)([17]\d{8})$/;

/**
 * Validate a Kenyan phone number
 * @param phone - The phone number to validate
 * @returns True if the phone number is valid
 */
export function isValidKenyanPhone(phone: string): boolean {
  const cleaned = phone.replace(/\s+/g, '');
  return KENYAN_PHONE_REGEX.test(cleaned);
}

/**
 * Format a phone number to the international format (254XXXXXXXXX)
 * @param phone - The phone number to format
 * @returns The formatted phone number or null if invalid
 */
export function formatPhoneToInternational(phone: string): string | null {
  const cleaned = phone.replace(/\s+/g, '');
  const match = cleaned.match(KENYAN_PHONE_REGEX);
  
  if (!match) return null;
  
  return `254${match[1]}`;
}

/**
 * Format a phone number for display (07XX XXX XXX)
 * @param phone - The phone number to format
 * @returns The formatted phone number for display
 */
export function formatPhoneForDisplay(phone: string): string {
  const cleaned = phone.replace(/\s+/g, '');
  const match = cleaned.match(KENYAN_PHONE_REGEX);
  
  if (!match) return phone;
  
  const number = match[1];
  const prefix = number.startsWith('7') ? '07' : '01';
  const formatted = `${prefix}${number.slice(0, 2)} ${number.slice(2, 5)} ${number.slice(5)}`;
  
  return formatted;
}

/**
 * Mask a phone number for privacy (07XX XXX X23)
 * @param phone - The phone number to mask
 * @returns The masked phone number
 */
export function maskPhone(phone: string): string {
  const formatted = formatPhoneForDisplay(phone);
  if (formatted === phone) return phone;
  
  // Mask middle digits
  const parts = formatted.split(' ');
  if (parts.length === 3) {
    return `${parts[0]}XX XXX X${parts[2].slice(-2)}`;
  }
  
  return formatted;
}
