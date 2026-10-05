/**
 * M-Pesa Daraja API Simulation
 * In production, this would integrate with the actual Safaricom Daraja API
 */

interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}

interface STKPushResponse {
  success: boolean;
  checkoutRequestId: string;
  merchantRequestId: string;
  responseCode: string;
  responseDescription: string;
  customerMessage: string;
}

interface PaymentStatus {
  resultCode: string;
  resultDesc: string;
  mpesaReceiptNumber?: string;
  transactionDate?: string;
  phoneNumber?: string;
  amount?: number;
}

// Simulated delay for realistic UX
const simulateApiDelay = (ms: number = 2000) => 
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Initiate STK Push (Lipa Na M-Pesa Online)
 * This is a simulation - in production, call the actual Daraja API
 */
export async function initiateSTKPush(request: STKPushRequest): Promise<STKPushResponse> {
  await simulateApiDelay(1500);
  
  // Simulate successful STK push initiation
  const checkoutRequestId = `ws_CO_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const merchantRequestId = `${Math.random().toString(36).substr(2, 15)}`;
  
  return {
    success: true,
    checkoutRequestId,
    merchantRequestId,
    responseCode: '0',
    responseDescription: 'Success. Request accepted for processing',
    customerMessage: `Success. Request accepted for processing. Check your phone (${request.phoneNumber}) for the M-Pesa prompt.`,
  };
}

/**
 * Query STK Push Transaction Status
 * This is a simulation - in production, call the actual Daraja API
 */
export async function querySTKPushStatus(checkoutRequestId: string): Promise<PaymentStatus> {
  await simulateApiDelay(2000);
  
  // Simulate a successful payment (in production, this would query the actual status)
  // 80% success rate for simulation
  const isSuccess = Math.random() > 0.2;
  
  if (isSuccess) {
    return {
      resultCode: '0',
      resultDesc: 'The service request is processed successfully.',
      mpesaReceiptNumber: `Q${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
      transactionDate: new Date().toISOString(),
      phoneNumber: '254XXXXXXXXX',
      amount: 0, // Would be the actual amount from the response
    };
  } else {
    // Simulate user cancelled or timeout
    return {
      resultCode: '1032',
      resultDesc: 'Request cancelled by user',
    };
  }
}

/**
 * Format phone number for M-Pesa API (requires 254XXXXXXXXX format)
 */
export function formatPhoneForMpesa(phone: string): string {
  let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9]/g, '');
  
  if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  } else if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  return cleaned;
}

/**
 * Validate M-Pesa phone number
 */
export function isValidMpesaPhone(phone: string): boolean {
  const formatted = formatPhoneForMpesa(phone);
  // Must start with 254, followed by 7 or 1, then 8 more digits
  return /^254[71]\d{8}$/.test(formatted);
}

/**
 * Simulate M-Pesa withdrawal (B2C)
 * In production, this would use the Daraja B2C API
 */
export async function initiateWithdrawal(
  phoneNumber: string,
  amount: number,
  remarks: string
): Promise<{ success: boolean; transactionId: string; message: string }> {
  await simulateApiDelay(3000);
  
  const transactionId = `B2C_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  
  return {
    success: true,
    transactionId,
    message: `Withdrawal of KSh ${amount.toLocaleString()} sent to ${phoneNumber}`,
  };
}
