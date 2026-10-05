// Manual M-Pesa Payment & Escrow Service
// Works without API integration - buyers pay manually and upload proof

import { supabase, isDemoMode, Database } from './supabase';

// GrainMart Paybill Details
export const MPESA_PAYBILL = {
  businessNumber: '247247', // Replace with actual paybill number
  businessName: 'GRAINMART LTD',
  accountFormat: 'GRM-{orderId}',
};

// Order statuses
export type PaymentStatus = 'pending_proof' | 'proof_submitted' | 'confirmed' | 'escrowed' | 'released' | 'refunded';
export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
export type EscrowStatus = 'none' | 'held' | 'released' | 'disputed' | 'refunded';

export interface PaymentProof {
  orderId: string;
  mpesaCode: string;
  proofImageUrl: string;
  submittedAt: Date;
}

export interface OrderData {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  items: Array<{
    productId: string;
    productName: string;
    sellerId: string;
    sellerName: string;
    quantity: number;
    price: number;
  }>;
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  escrowStatus: EscrowStatus;
  mpesaCode?: string;
  proofImageUrl?: string;
  deliveryAddress: string;
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
  deliveredAt?: Date;
}

// Generate order ID
export function generateOrderId(): string {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GRM-${dateStr}-${random}`;
}

// Create a new order
export async function createOrder(orderData: Omit<OrderData, 'id' | 'paymentStatus' | 'orderStatus' | 'escrowStatus' | 'createdAt' | 'updatedAt'>): Promise<OrderData> {
  const orderId = generateOrderId();
  const now = new Date();
  
  const order: OrderData = {
    ...orderData,
    id: orderId,
    paymentStatus: 'pending_proof',
    orderStatus: 'placed',
    escrowStatus: 'none',
    createdAt: now,
    updatedAt: now,
  };

  if (isDemoMode) {
    // Store in localStorage for demo
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    orders.push(order);
    localStorage.setItem('grainmart_orders', JSON.stringify(orders));
    return order;
  }

  const { data, error } = await supabase
    .from('orders')
    .insert({
      id: orderId,
      buyer_id: orderData.buyerId,
      items: orderData.items,
      subtotal: orderData.subtotal,
      platform_fee: orderData.platformFee,
      delivery_fee: orderData.deliveryFee,
      total: orderData.total,
      payment_status: 'pending_proof',
      order_status: 'placed',
      escrow_status: 'none',
      delivery_address: orderData.deliveryAddress,
    })
    .select()
    .single();

  if (error) throw error;
  return order;
}

// Submit payment proof (buyer)
export async function submitPaymentProof(
  orderId: string, 
  mpesaCode: string, 
  proofImage: File
): Promise<void> {
  const now = new Date();

  if (isDemoMode) {
    // Demo mode - update localStorage
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    const orderIndex = orders.findIndex((o: OrderData) => o.id === orderId);
    
    if (orderIndex === -1) throw new Error('Order not found');
    
    // Convert image to base64 for demo
    const reader = new FileReader();
    const proofUrl = await new Promise<string>((resolve) => {
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(proofImage);
    });
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      mpesaCode,
      proofImageUrl: proofUrl,
      paymentStatus: 'proof_submitted',
      updatedAt: now,
    };
    
    localStorage.setItem('grainmart_orders', JSON.stringify(orders));
    
    // Create pending payment notification for seller
    const pendingPayments = JSON.parse(localStorage.getItem('grainmart_pending_payments') || '[]');
    pendingPayments.push({
      orderId,
      mpesaCode,
      proofImageUrl: proofUrl,
      submittedAt: now,
      status: 'pending',
    });
    localStorage.setItem('grainmart_pending_payments', JSON.stringify(pendingPayments));
    
    return;
  }

  // Upload proof image to Supabase Storage
  const fileName = `payment-proofs/${orderId}-${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from('orders')
    .upload(fileName, proofImage);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('orders')
    .getPublicUrl(fileName);

  // Update order with proof
  const { error } = await supabase
    .from('orders')
    .update({
      mpesa_ref: mpesaCode,
      proof_image_url: urlData.publicUrl,
      payment_status: 'proof_submitted',
      updated_at: now.toISOString(),
    })
    .eq('id', orderId);

  if (error) throw error;

  // Create notification for seller
  await createSellerNotification(orderId, 'payment_submitted');
}

// Confirm payment (seller)
export async function confirmPayment(orderId: string, sellerId: string): Promise<void> {
  const now = new Date();

  if (isDemoMode) {
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    const orderIndex = orders.findIndex((o: OrderData) => o.id === orderId);
    
    if (orderIndex === -1) throw new Error('Order not found');
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      paymentStatus: 'escrowed',
      escrowStatus: 'held',
      orderStatus: 'confirmed',
      paidAt: now,
      updatedAt: now,
    };
    
    localStorage.setItem('grainmart_orders', JSON.stringify(orders));
    
    // Update pending payments
    const pendingPayments = JSON.parse(localStorage.getItem('grainmart_pending_payments') || '[]');
    const updatedPending = pendingPayments.map((p: any) => 
      p.orderId === orderId ? { ...p, status: 'confirmed' } : p
    );
    localStorage.setItem('grainmart_pending_payments', JSON.stringify(updatedPending));
    
    // Add to escrow balance
    updateSellerEscrow(sellerId, orders[orderIndex].total, 'add');
    
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'escrowed',
      escrow_status: 'held',
      order_status: 'confirmed',
      paid_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', orderId);

  if (error) throw error;

  await createBuyerNotification(orderId, 'payment_confirmed');
}

// Reject payment (seller)
export async function rejectPayment(orderId: string, reason: string): Promise<void> {
  const now = new Date();

  if (isDemoMode) {
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    const orderIndex = orders.findIndex((o: OrderData) => o.id === orderId);
    
    if (orderIndex === -1) throw new Error('Order not found');
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      paymentStatus: 'pending_proof',
      rejectionReason: reason,
      updatedAt: now,
    };
    
    localStorage.setItem('grainmart_orders', JSON.stringify(orders));
    
    // Remove from pending payments
    const pendingPayments = JSON.parse(localStorage.getItem('grainmart_pending_payments') || '[]');
    const filtered = pendingPayments.filter((p: any) => p.orderId !== orderId);
    localStorage.setItem('grainmart_pending_payments', JSON.stringify(filtered));
    
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'pending_proof',
      proof_image_url: null,
      mpesa_ref: null,
      rejection_reason: reason,
      updated_at: now.toISOString(),
    })
    .eq('id', orderId);

  if (error) throw error;

  await createBuyerNotification(orderId, 'payment_rejected', { reason });
}

// Confirm delivery (buyer) - releases escrow to seller
export async function confirmDelivery(orderId: string): Promise<void> {
  const now = new Date();

  if (isDemoMode) {
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    const orderIndex = orders.findIndex((o: OrderData) => o.id === orderId);
    
    if (orderIndex === -1) throw new Error('Order not found');
    
    const order = orders[orderIndex];
    const sellerId = order.items[0]?.sellerId;
    
    orders[orderIndex] = {
      ...order,
      paymentStatus: 'released',
      escrowStatus: 'released',
      orderStatus: 'delivered',
      deliveredAt: now,
      updatedAt: now,
    };
    
    localStorage.setItem('grainmart_orders', JSON.stringify(orders));
    
    // Release escrow to seller wallet
    if (sellerId) {
      const platformFee = order.platformFee || order.total * 0.02;
      const sellerAmount = order.total - platformFee;
      
      updateSellerEscrow(sellerId, order.total, 'release');
      updateSellerWallet(sellerId, sellerAmount, 'credit');
    }
    
    return;
  }

  // Get order details
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single();

  if (fetchError) throw fetchError;

  // Update order status
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'released',
      escrow_status: 'released',
      order_status: 'delivered',
      delivered_at: now.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq('id', orderId);

  if (error) throw error;

  // Credit seller wallet
  const platformFee = order.platform_fee || order.total * 0.02;
  const sellerAmount = order.total - platformFee;
  const sellerId = order.items[0]?.seller_id;

  if (sellerId) {
    await supabase.rpc('credit_seller_wallet', {
      p_seller_id: sellerId,
      p_amount: sellerAmount,
      p_order_id: orderId,
    });
  }

  await createSellerNotification(orderId, 'payment_released');
}

// Update order status (seller)
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
  const now = new Date();

  if (isDemoMode) {
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    const orderIndex = orders.findIndex((o: OrderData) => o.id === orderId);
    
    if (orderIndex === -1) throw new Error('Order not found');
    
    orders[orderIndex] = {
      ...orders[orderIndex],
      orderStatus: status,
      updatedAt: now,
    };
    
    localStorage.setItem('grainmart_orders', JSON.stringify(orders));
    return;
  }

  const { error } = await supabase
    .from('orders')
    .update({
      order_status: status,
      updated_at: now.toISOString(),
    })
    .eq('id', orderId);

  if (error) throw error;

  await createBuyerNotification(orderId, 'order_status_updated', { status });
}

// Get orders for buyer
export async function getBuyerOrders(buyerId: string): Promise<OrderData[]> {
  if (isDemoMode) {
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    return orders.filter((o: OrderData) => o.buyerId === buyerId);
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('buyer_id', buyerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get pending payments for seller
export async function getSellerPendingPayments(sellerId: string): Promise<any[]> {
  if (isDemoMode) {
    const pending = JSON.parse(localStorage.getItem('grainmart_pending_payments') || '[]');
    const orders = JSON.parse(localStorage.getItem('grainmart_orders') || '[]');
    
    return pending
      .filter((p: any) => p.status === 'pending')
      .map((p: any) => {
        const order = orders.find((o: OrderData) => o.id === p.orderId);
        return {
          ...p,
          buyerName: order?.buyerName || 'Unknown',
          buyerPhone: order?.buyerPhone || '',
          amount: order?.total || 0,
          items: order?.items || [],
        };
      });
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .contains('items', [{ seller_id: sellerId }])
    .eq('payment_status', 'proof_submitted')
    .order('updated_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

// Get seller wallet and escrow balances
export async function getSellerBalances(sellerId: string): Promise<{ wallet: number; escrow: number }> {
  if (isDemoMode) {
    const wallets = JSON.parse(localStorage.getItem('grainmart_wallets') || '{}');
    const escrows = JSON.parse(localStorage.getItem('grainmart_escrows') || '{}');
    
    return {
      wallet: wallets[sellerId] || 0,
      escrow: escrows[sellerId] || 0,
    };
  }

  const { data, error } = await supabase
    .from('users')
    .select('wallet_balance, escrow_balance')
    .eq('id', sellerId)
    .single();

  if (error) throw error;
  return {
    wallet: data?.wallet_balance || 0,
    escrow: data?.escrow_balance || 0,
  };
}

// Helper functions for demo mode
function updateSellerEscrow(sellerId: string, amount: number, action: 'add' | 'release'): void {
  const escrows = JSON.parse(localStorage.getItem('grainmart_escrows') || '{}');
  const current = escrows[sellerId] || 0;
  
  if (action === 'add') {
    escrows[sellerId] = current + amount;
  } else {
    escrows[sellerId] = Math.max(0, current - amount);
  }
  
  localStorage.setItem('grainmart_escrows', JSON.stringify(escrows));
}

function updateSellerWallet(sellerId: string, amount: number, action: 'credit' | 'debit'): void {
  const wallets = JSON.parse(localStorage.getItem('grainmart_wallets') || '{}');
  const current = wallets[sellerId] || 0;
  
  if (action === 'credit') {
    wallets[sellerId] = current + amount;
  } else {
    wallets[sellerId] = Math.max(0, current - amount);
  }
  
  localStorage.setItem('grainmart_wallets', JSON.stringify(wallets));
}

async function createSellerNotification(orderId: string, type: string, data: any = {}): Promise<void> {
  // In production, this would create a notification in Supabase
  // For demo, we'll use localStorage
  if (isDemoMode) {
    const notifications = JSON.parse(localStorage.getItem('grainmart_notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      type,
      orderId,
      data,
      createdAt: new Date(),
      read: false,
    });
    localStorage.setItem('grainmart_notifications', JSON.stringify(notifications));
  }
}

async function createBuyerNotification(orderId: string, type: string, data: any = {}): Promise<void> {
  if (isDemoMode) {
    const notifications = JSON.parse(localStorage.getItem('grainmart_notifications') || '[]');
    notifications.push({
      id: Date.now().toString(),
      type,
      orderId,
      data,
      createdAt: new Date(),
      read: false,
    });
    localStorage.setItem('grainmart_notifications', JSON.stringify(notifications));
  }
}

export default {
  MPESA_PAYBILL,
  generateOrderId,
  createOrder,
  submitPaymentProof,
  confirmPayment,
  rejectPayment,
  confirmDelivery,
  updateOrderStatus,
  getBuyerOrders,
  getSellerPendingPayments,
  getSellerBalances,
};
