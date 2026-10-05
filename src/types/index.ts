import { Timestamp, GeoPoint } from 'firebase/firestore';

// User Types
export type UserRole = 'buyer' | 'seller' | 'owner';
export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected';

export interface User {
  uid: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  location: string;
  county: string;
  coordinates?: GeoPoint;
  verified: boolean;
  verificationStatus: VerificationStatus;
  idDocuments?: string[];
  joinedAt: Timestamp;
  lastActive: Timestamp;
  walletBalance: number;
  rating: number;
  totalSales: number;
  isPremium: boolean;
  premiumUntil?: Timestamp;
}

// Product Types
export type ProductStatus = 'active' | 'paused' | 'out_of_stock' | 'under_review';

export type Category = 
  | 'Maize' 
  | 'Sorghum' 
  | 'Millet' 
  | 'Wheat' 
  | 'Legumes' 
  | 'Oil Seeds' 
  | 'Rice' 
  | 'Barley';

export interface Product {
  id: string;
  name: string;
  category: Category;
  emoji: string;
  description: string;
  tags: string[];
  price: number;
  minOrderKg: number;
  stock: number;
  lowStockAlert: number;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
  sellerVerified?: boolean;
  coordinates?: GeoPoint;
  images: string[];
  featured: boolean;
  featuredUntil?: Timestamp;
  rating: number;
  reviewCount: number;
  totalOrders: number;
  status: ProductStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Order Types
export type PaymentMethod = 'mpesa' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'escrowed' | 'released' | 'refunded';
export type EscrowStatus = 'held' | 'released' | 'disputed';
export type OrderStatus = 'placed' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';
export type DisputeStatus = 'none' | 'open' | 'under_review' | 'resolved';
export type DeliveryMethod = 'standard' | 'express' | 'pickup' | 'rider';

export interface OrderItem {
  productId: string;
  productName: string;
  productEmoji: string;
  sellerId: string;
  sellerName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface TrackingStep {
  status: OrderStatus;
  timestamp: Timestamp;
  description: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  items: OrderItem[];
  deliveryAddress: string;
  deliveryCoordinates?: GeoPoint;
  deliveryMethod: DeliveryMethod;
  deliveryFee: number;
  subtotal: number;
  platformFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  mpesaRef?: string;
  escrowStatus: EscrowStatus;
  orderStatus: OrderStatus;
  disputeStatus: DisputeStatus;
  trackingSteps: TrackingStep[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveredAt?: Timestamp;
}

// Message Types
export interface Conversation {
  id: string;
  participants: string[];
  productId?: string;
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: Record<string, number>;
}

export interface Message {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: Timestamp;
  read: boolean;
}

// Review Types
export interface Review {
  id: string;
  productId: string;
  orderId: string;
  reviewerId: string;
  reviewerName: string;
  sellerId: string;
  rating: number;
  text: string;
  photos?: string[];
  sellerResponse?: string;
  verified: boolean;
  createdAt: Timestamp;
  flagged: boolean;
}

// Notification Types
export type NotificationType = 
  | 'order_received'
  | 'order_status'
  | 'message'
  | 'low_stock'
  | 'payment_confirmed'
  | 'payment_released'
  | 'review_posted'
  | 'verification_status';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  data: Record<string, unknown>;
  createdAt: Timestamp;
}

// Cart Types
export interface CartItem {
  productId: string;
  productName: string;
  productEmoji: string;
  sellerId: string;
  sellerName: string;
  price: number;
  quantity: number;
  stock: number;
  minOrderKg: number;
  image?: string;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  total: number;
}

// Filter Types
export interface ProductFilters {
  category?: Category | 'All';
  priceMin?: number;
  priceMax?: number;
  locationRadius?: number;
  sellerType?: 'all' | 'verified' | 'top';
  listingType?: 'all' | 'featured' | 'flash';
  minRating?: number;
  inStockOnly?: boolean;
  sort?: 'featured' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'orders';
  search?: string;
}

// Dashboard Analytics Types
export interface DashboardStats {
  revenue: number;
  revenueChange: number;
  orders: number;
  ordersToday: number;
  listings: number;
  lowStockCount: number;
  rating: number;
  reviewCount: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
}

export interface ProductSalesData {
  name: string;
  sales: number;
  revenue: number;
}

// Auth Form Types
export interface SignInFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface SignUpFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface PhoneAuthFormData {
  phone: string;
  otp: string;
}

// Checkout Types
export interface DeliveryDetails {
  address: string;
  coordinates?: { lat: number; lng: number };
  datePreference?: string;
  instructions?: string;
  contactNumber: string;
}

export interface CheckoutState {
  step: number;
  delivery: DeliveryDetails | null;
  deliveryMethod: DeliveryMethod | null;
  paymentMethod: PaymentMethod | null;
}

// Seller Verification Types
export interface VerificationData {
  idFront: File | null;
  idBack: File | null;
  businessPhoto: File | null;
  location: string;
  coordinates?: { lat: number; lng: number };
}

// Admin Types
export interface PlatformStats {
  totalGmv: number;
  activeSellers: number;
  activeBuyers: number;
  ordersToday: number;
  totalRevenue: number;
  pendingVerifications: number;
  activeDisputes: number;
}

export interface CommissionRecord {
  sellerId: string;
  sellerName: string;
  totalSales: number;
  commission: number;
  isPremium: boolean;
}
