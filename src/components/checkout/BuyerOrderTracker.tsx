import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Shield,
  AlertCircle,
  ChevronRight,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  sellerId: string;
  sellerName: string;
}

interface BuyerOrder {
  id: string;
  items: OrderItem[];
  total: number;
  paymentStatus: 'pending_proof' | 'proof_submitted' | 'confirmed' | 'escrowed' | 'released';
  orderStatus: 'placed' | 'confirmed' | 'preparing' | 'dispatched' | 'delivered';
  deliveryAddress: string;
  createdAt: Date;
  estimatedDelivery?: Date;
  mpesaCode?: string;
  proofImageUrl?: string;
}

interface BuyerOrderTrackerProps {
  order: BuyerOrder;
  onConfirmDelivery: (orderId: string) => Promise<void>;
  onRateOrder: (orderId: string, rating: number, review: string) => Promise<void>;
  onContactSeller: (sellerId: string) => void;
  onReportIssue: (orderId: string) => void;
}

// Demo order for testing
const DEMO_ORDER: BuyerOrder = {
  id: 'GRM-20260403-001',
  items: [
    { name: 'Premium Yellow Maize', quantity: 50, price: 70, sellerId: 'seller-1', sellerName: 'Kamau Farms' },
    { name: 'Red Sorghum', quantity: 20, price: 75, sellerId: 'seller-1', sellerName: 'Kamau Farms' },
  ],
  total: 5050,
  paymentStatus: 'escrowed',
  orderStatus: 'dispatched',
  deliveryAddress: 'Westlands, Nairobi, Kenya',
  createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  estimatedDelivery: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
  mpesaCode: 'QJK2ABCD1X',
};

const ORDER_STEPS = [
  { status: 'placed', label: 'Order Placed', icon: Package },
  { status: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { status: 'preparing', label: 'Preparing', icon: Package },
  { status: 'dispatched', label: 'Dispatched', icon: Truck },
  { status: 'delivered', label: 'Delivered', icon: CheckCircle },
];

export default function BuyerOrderTracker({
  order = DEMO_ORDER,
  onConfirmDelivery,
  onRateOrder,
  onContactSeller,
  onReportIssue,
}: BuyerOrderTrackerProps) {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [isRating, setIsRating] = useState(false);
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  const currentStepIndex = ORDER_STEPS.findIndex(s => s.status === order.orderStatus);
  const isDelivered = order.orderStatus === 'delivered';
  const canConfirmDelivery = order.orderStatus === 'dispatched' && order.paymentStatus === 'escrowed';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleConfirmDelivery = async () => {
    setIsConfirming(true);
    try {
      await onConfirmDelivery(order.id);
      setDeliveryConfirmed(true);
      toast.success('Delivery confirmed! Payment released to seller.');
      setTimeout(() => setShowRatingModal(true), 1000);
    } catch (error) {
      toast.error('Failed to confirm delivery');
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSubmitRating = async () => {
    setIsRating(true);
    try {
      await onRateOrder(order.id, rating, review);
      toast.success('Thank you for your review!');
      setShowRatingModal(false);
    } catch (error) {
      toast.error('Failed to submit review');
    } finally {
      setIsRating(false);
    }
  };

  const getPaymentStatusBadge = () => {
    switch (order.paymentStatus) {
      case 'pending_proof':
        return { color: 'bg-amber-pale text-amber', text: 'Awaiting Payment' };
      case 'proof_submitted':
        return { color: 'bg-amber-pale text-amber', text: 'Verifying Payment' };
      case 'confirmed':
      case 'escrowed':
        return { color: 'bg-green-pale text-green', text: 'Payment Secured' };
      case 'released':
        return { color: 'bg-green text-white', text: 'Payment Complete' };
      default:
        return { color: 'bg-muted text-white', text: 'Unknown' };
    }
  };

  const paymentBadge = getPaymentStatusBadge();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-border overflow-hidden"
    >
      {/* Header */}
      <div className="bg-dark text-white p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white/60 text-sm">Order ID</p>
            <p className="font-mono text-lg font-bold">{order.id}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentBadge.color}`}>
            {paymentBadge.text}
          </span>
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          <Clock className="w-4 h-4" />
          <span>Ordered {formatDistanceToNow(order.createdAt, { addSuffix: true })}</span>
        </div>
      </div>

      {/* Order Progress */}
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-dark mb-4">Order Status</h3>
        <div className="flex items-center justify-between relative">
          {/* Progress Line */}
          <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
          <div 
            className="absolute top-5 left-0 h-0.5 bg-green transition-all duration-500"
            style={{ width: `${(currentStepIndex / (ORDER_STEPS.length - 1)) * 100}%` }}
          />
          
          {/* Steps */}
          {ORDER_STEPS.map((step, index) => {
            const isCompleted = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;
            
            return (
              <div key={step.status} className="relative z-10 flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                    isCompleted 
                      ? 'bg-green text-white' 
                      : 'bg-white border-2 border-border text-muted'
                  } ${isCurrent ? 'ring-4 ring-green/20' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`mt-2 text-xs text-center ${isCompleted ? 'text-green font-medium' : 'text-muted'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
        
        {/* Estimated Delivery */}
        {order.estimatedDelivery && !isDelivered && (
          <div className="mt-4 p-3 bg-cream rounded-lg flex items-center gap-3">
            <Truck className="w-5 h-5 text-amber" />
            <div>
              <p className="text-sm text-muted">Estimated Delivery</p>
              <p className="font-medium text-dark">
                {order.estimatedDelivery.toLocaleDateString('en-KE', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Order Items */}
      <div className="p-5 border-b border-border">
        <h3 className="font-semibold text-dark mb-3">Order Items</h3>
        <div className="space-y-3">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-pale rounded-lg flex items-center justify-center">
                  🌾
                </div>
                <div>
                  <p className="font-medium text-dark">{item.name}</p>
                  <p className="text-sm text-muted">{item.quantity}kg × {formatAmount(item.price)}</p>
                </div>
              </div>
              <p className="font-semibold text-dark">{formatAmount(item.quantity * item.price)}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t border-border flex justify-between">
          <span className="font-semibold text-dark">Total</span>
          <span className="font-display text-xl font-bold text-amber">{formatAmount(order.total)}</span>
        </div>
      </div>

      {/* Delivery Address */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-3">
          <MapPin className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted">Delivery Address</p>
            <p className="font-medium text-dark">{order.deliveryAddress}</p>
          </div>
        </div>
      </div>

      {/* Escrow Protection */}
      <div className="p-5 border-b border-border">
        <div className="flex items-start gap-3 p-4 bg-green-pale rounded-xl">
          <Shield className="w-6 h-6 text-green flex-shrink-0" />
          <div>
            <p className="font-medium text-dark mb-1">Payment Protected</p>
            <p className="text-sm text-muted">
              {order.paymentStatus === 'escrowed' 
                ? 'Your payment is held securely. Only release it after checking your delivery.'
                : order.paymentStatus === 'released'
                ? 'Payment has been released to the seller.'
                : 'Payment will be held in escrow once confirmed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-5 space-y-3">
        {/* Confirm Delivery Button */}
        {canConfirmDelivery && !deliveryConfirmed && (
          <button
            onClick={handleConfirmDelivery}
            disabled={isConfirming}
            className="w-full py-4 bg-green text-white rounded-xl font-semibold hover:bg-green-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isConfirming ? (
              <>
                <span className="animate-spin">⏳</span>
                Confirming...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                I've Received My Order
              </>
            )}
          </button>
        )}

        {/* Already Confirmed */}
        {(isDelivered || deliveryConfirmed) && (
          <div className="flex items-center justify-center gap-2 py-4 bg-green-pale text-green rounded-xl font-medium">
            <CheckCircle className="w-5 h-5" />
            Order Complete
          </div>
        )}

        {/* Contact & Report */}
        <div className="flex gap-3">
          <button
            onClick={() => onContactSeller(order.items[0]?.sellerId)}
            className="flex-1 py-3 border border-border rounded-xl font-medium text-dark hover:bg-cream transition-colors flex items-center justify-center gap-2"
          >
            <MessageSquare className="w-5 h-5 text-amber" />
            Contact Seller
          </button>
          <button
            onClick={() => onReportIssue(order.id)}
            className="flex-1 py-3 border border-terra text-terra rounded-xl font-medium hover:bg-terra hover:text-white transition-colors flex items-center justify-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            Report Issue
          </button>
        </div>
      </div>

      {/* Rating Modal */}
      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-amber-pale rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-amber" />
                </div>
                <h3 className="font-display text-xl font-bold text-dark mb-2">
                  Rate Your Experience
                </h3>
                <p className="text-muted text-sm">
                  How was your order from {order.items[0]?.sellerName}?
                </p>
              </div>

              {/* Star Rating */}
              <div className="flex justify-center gap-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1 transition-transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= rating 
                          ? 'text-amber fill-amber' 
                          : 'text-border'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {/* Review Text */}
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Tell us about your experience (optional)"
                className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent resize-none mb-4"
                rows={3}
              />

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="flex-1 py-3 border border-border rounded-xl font-medium text-muted hover:bg-cream transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={isRating}
                  className="flex-1 py-3 bg-amber text-white rounded-xl font-semibold hover:bg-amber-light transition-colors disabled:opacity-50"
                >
                  {isRating ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
