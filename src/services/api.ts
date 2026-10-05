/**
 * API Service for communicating with the GrainMart backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `HTTP ${response.status}`,
        };
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        error: 'Network error. Please check your connection.',
      };
    }
  }

  // ============ ORDERS ============

  async createOrder(orderData: {
    items: Array<{
      productId: string;
      quantity: number;
      sellerId: string;
    }>;
    deliveryAddress: {
      county: string;
      area: string;
      details: string;
      phone: string;
    };
    paymentMethod: 'mpesa' | 'card';
  }) {
    return this.request<{ orderId: string }>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  async getMyOrders() {
    return this.request('/orders/my');
  }

  async getSellerOrders() {
    return this.request('/orders/seller');
  }

  async updateOrderStatus(orderId: string, status: string) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async confirmDelivery(orderId: string) {
    return this.request(`/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
    });
  }

  async raiseDispute(orderId: string, reason: string) {
    return this.request(`/orders/${orderId}/dispute`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ============ PRODUCTS ============

  async getProducts(params?: {
    category?: string;
    sellerId?: string;
    featured?: boolean;
    limit?: number;
  }) {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.set('category', params.category);
    if (params?.sellerId) searchParams.set('sellerId', params.sellerId);
    if (params?.featured) searchParams.set('featured', 'true');
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const query = searchParams.toString();
    return this.request(`/products${query ? `?${query}` : ''}`);
  }

  async getProduct(productId: string) {
    return this.request(`/products/${productId}`);
  }

  async createProduct(productData: {
    name: string;
    category: string;
    description: string;
    price: number;
    minOrderKg: number;
    stock: number;
    lowStockAlert: number;
    tags?: string[];
    emoji?: string;
    images?: string[];
  }) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(productId: string, updates: Partial<{
    name: string;
    category: string;
    description: string;
    price: number;
    minOrderKg: number;
    stock: number;
    lowStockAlert: number;
    tags: string[];
    emoji: string;
    images: string[];
  }>) {
    return this.request(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async updateProductStock(productId: string, stock: number) {
    return this.request(`/products/${productId}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  }

  async deleteProduct(productId: string) {
    return this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // ============ PAYMENTS ============

  async initiateMpesaPayment(data: {
    orderId: string;
    phoneNumber: string;
    amount: number;
  }) {
    return this.request<{
      checkoutRequestId: string;
      merchantRequestId: string;
      customerMessage: string;
    }>('/mpesa/stkpush', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async queryMpesaStatus(checkoutRequestId: string) {
    return this.request<{
      resultCode: string;
      resultDesc: string;
      mpesaReceiptNumber?: string;
    }>(`/mpesa/query/${checkoutRequestId}`);
  }

  async createStripePaymentIntent(data: {
    orderId: string;
    amount: number;
    email?: string;
  }) {
    return this.request<{
      clientSecret: string;
      paymentIntentId: string;
    }>('/stripe/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // ============ USERS ============

  async getMyProfile() {
    return this.request('/users/me');
  }

  async updateMyProfile(updates: {
    name?: string;
    phone?: string;
    location?: string;
    county?: string;
    avatar?: string;
  }) {
    return this.request('/users/me', {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async getWallet() {
    return this.request<{
      balance: number;
      pendingWithdrawal: number;
      isPremium: boolean;
      commissionRate: number;
      transactions: Array<{
        orderId: string;
        amount: number;
        date: string;
        type: string;
      }>;
    }>('/users/seller/wallet');
  }

  async requestWithdrawal(amount: number, phoneNumber?: string) {
    return this.request('/users/seller/withdraw', {
      method: 'POST',
      body: JSON.stringify({ amount, phoneNumber }),
    });
  }

  // ============ ANALYTICS ============

  async getSellerOverview() {
    return this.request<{
      revenue: { total: number; currency: string };
      orders: { total: number; today: number };
      products: { active: number; lowStock: number };
      rating: number;
      reviewCount: number;
      walletBalance: number;
    }>('/analytics/seller/overview');
  }

  async getSellerRevenueChart(days: number = 30) {
    return this.request<Array<{
      date: string;
      revenue: number;
    }>>(`/analytics/seller/revenue?days=${days}`);
  }

  async getTopProducts() {
    return this.request<Array<{
      id: string;
      name: string;
      totalOrders: number;
      revenue: number;
      stock: number;
      rating: number;
    }>>('/analytics/seller/products');
  }

  // ============ ADMIN ============

  async getAllUsers(role?: string) {
    const query = role ? `?role=${role}` : '';
    return this.request(`/users/admin/all${query}`);
  }

  async getPendingVerifications() {
    return this.request('/users/admin/pending-verification');
  }

  async verifyUser(userId: string, approved: boolean, reason?: string) {
    return this.request(`/users/admin/${userId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify({ approved, reason }),
    });
  }

  async suspendUser(userId: string, suspended: boolean, reason?: string) {
    return this.request(`/users/admin/${userId}/suspend`, {
      method: 'PATCH',
      body: JSON.stringify({ suspended, reason }),
    });
  }

  async getPlatformOverview() {
    return this.request<{
      gmv: number;
      commission: number;
      users: {
        total: number;
        buyers: number;
        sellers: number;
        verifiedSellers: number;
      };
      products: number;
      orders: { total: number; today: number };
    }>('/analytics/admin/overview');
  }

  async getPlatformRevenueChart(days: number = 30) {
    return this.request<Array<{
      date: string;
      gmv: number;
      commission: number;
      orders: number;
    }>>(`/analytics/admin/revenue?days=${days}`);
  }

  async getSellerReport() {
    return this.request<Array<{
      uid: string;
      name: string;
      verified: boolean;
      isPremium: boolean;
      totalSales: number;
      walletBalance: number;
      rating: number;
      commissionRate: number;
    }>>('/analytics/admin/sellers');
  }
}

// Export singleton instance
export const api = new ApiService(API_BASE_URL);

// Helper to update auth token when user signs in
export function updateApiToken(token: string | null) {
  api.setAuthToken(token);
}
