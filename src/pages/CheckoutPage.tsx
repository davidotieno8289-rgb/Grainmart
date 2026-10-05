import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Truck,
  Clock,
  CreditCard,
  Phone,
  ChevronRight,
  ChevronLeft,
  Shield,
  Package,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { MpesaPayment } from '@/components/checkout';
import { LocationPicker } from '@/components/shared/MapIndex';
import { createOrder, submitPaymentProof, generateOrderId } from '@/services/orders';

type CheckoutStep = 'delivery' | 'payment' | 'confirm';
type PaymentMethod = 'mpesa' | 'card';

interface DeliveryDetails {
  address: string;
  coordinates?: { lat: number; lng: number };
  contactNumber: string;
  instructions?: string;
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const cart = useCart();
  const { clearCart, setCartOpen } = cart;
  const { user } = useAuth();
  
  const [step, setStep] = useState<CheckoutStep>('delivery');
  const [deliveryDetails, setDeliveryDetails] = useState<DeliveryDetails>({
    address: '',
    contactNumber: user?.phone || '',
    instructions: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mpesa');
  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  useEffect(() => {
    // Close cart panel when checkout opens
    setCartOpen(false);
    
    // Redirect if cart is empty
    if (cart.items.length === 0) {
      navigate('/');
      toast.error('Your cart is empty');
    }
  }, [cart.items.length, navigate, setCartOpen]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleLocationSelect = (lat: number, lng: number, address?: string) => {
    setDeliveryDetails(prev => ({
      ...prev,
      address: address || `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
      coordinates: { lat, lng },
    }));
  };

  const handleDeliverySubmit = () => {
    if (!deliveryDetails.address) {
      toast.error('Please select a delivery location');
      return;
    }
    if (!deliveryDetails.contactNumber) {
      toast.error('Please enter a contact number');
      return;
    }
    setStep('payment');
  };

  const handlePaymentSelect = async () => {
    if (paymentMethod === 'mpesa') {
      setIsCreatingOrder(true);
      try {
        // Create order first
        const newOrderId = generateOrderId();
        setOrderId(newOrderId);
        
        await createOrder({
          buyerId: user?.uid || 'guest',
          buyerName: user?.name || 'Guest User',
          buyerPhone: deliveryDetails.contactNumber,
          items: cart.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            quantity: item.quantity,
            price: item.price,
          })),
          subtotal: cart.subtotal,
          platformFee: cart.platformFee,
          deliveryFee: cart.deliveryFee,
          total: cart.total,
          deliveryAddress: deliveryDetails.address,
        });
        
        setShowMpesaModal(true);
      } catch (error) {
        toast.error('Failed to create order');
        console.error(error);
      } finally {
        setIsCreatingOrder(false);
      }
    } else {
      // Card payment - would integrate with Stripe
      toast.error('Card payments coming soon! Please use M-Pesa.');
    }
  };

  const handleMpesaPaymentSubmit = async (proofImage: File, mpesaCode: string) => {
    try {
      await submitPaymentProof(orderId, mpesaCode, proofImage);
      setShowMpesaModal(false);
      clearCart();
      toast.success('Payment proof submitted!');
      navigate(`/orders/${orderId}`);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const steps = [
    { id: 'delivery', label: 'Delivery', icon: MapPin },
    { id: 'payment', label: 'Payment', icon: CreditCard },
    { id: 'confirm', label: 'Confirm', icon: CheckCircle },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === step);

  return (
    <div className="page-container bg-cream min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl font-bold text-dark mb-2">Checkout</h1>
          <p className="text-muted">Complete your order</p>
        </motion.div>

        {/* Step Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-green transition-all duration-500"
              style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((s, index) => {
              const isCompleted = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = s.icon;
              
              return (
                <div key={s.id} className="relative z-10 flex flex-col items-center">
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isCompleted 
                        ? 'bg-green text-white' 
                        : isCurrent
                        ? 'bg-amber text-white'
                        : 'bg-white border-2 border-border text-muted'
                    }`}
                  >
                    {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  <p className={`mt-2 text-sm ${isCurrent ? 'text-amber font-medium' : isCompleted ? 'text-green' : 'text-muted'}`}>
                    {s.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Delivery Step */}
              {step === 'delivery' && (
                <motion.div
                  key="delivery"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-border p-6"
                >
                  <h2 className="font-display text-xl font-semibold text-dark mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-amber" />
                    Delivery Details
                  </h2>

                  {/* Location Picker */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-dark mb-2">
                      Delivery Location
                    </label>
                    <LocationPicker
                      onLocationSelect={handleLocationSelect}
                      height="300px"
                      className="mb-2"
                    />
                    {deliveryDetails.address && (
                      <p className="text-sm text-green flex items-center gap-1 mt-2">
                        <CheckCircle className="w-4 h-4" />
                        {deliveryDetails.address}
                      </p>
                    )}
                  </div>

                  {/* Contact Number */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-dark mb-2">
                      Contact Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                      <input
                        type="tel"
                        value={deliveryDetails.contactNumber}
                        onChange={(e) => setDeliveryDetails(prev => ({ ...prev, contactNumber: e.target.value }))}
                        placeholder="0712 345 678"
                        className="w-full pl-12 pr-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Delivery Instructions */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-dark mb-2">
                      Delivery Instructions (Optional)
                    </label>
                    <textarea
                      value={deliveryDetails.instructions}
                      onChange={(e) => setDeliveryDetails(prev => ({ ...prev, instructions: e.target.value }))}
                      placeholder="E.g., Call when arriving, leave at gate..."
                      className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Delivery Options */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-dark mb-3">
                      Delivery Speed
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:border-amber transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          defaultChecked
                          className="w-5 h-5 text-amber"
                        />
                        <Truck className="w-6 h-6 text-muted" />
                        <div className="flex-1">
                          <p className="font-medium text-dark">Standard Delivery</p>
                          <p className="text-sm text-muted">3-5 business days</p>
                        </div>
                        <p className="font-semibold text-dark">{formatAmount(150)}</p>
                      </label>
                      <label className="flex items-center gap-4 p-4 border border-border rounded-xl cursor-pointer hover:border-amber transition-colors">
                        <input
                          type="radio"
                          name="delivery"
                          className="w-5 h-5 text-amber"
                        />
                        <Clock className="w-6 h-6 text-amber" />
                        <div className="flex-1">
                          <p className="font-medium text-dark">Express Delivery</p>
                          <p className="text-sm text-muted">1-2 business days</p>
                        </div>
                        <p className="font-semibold text-amber">{formatAmount(350)}</p>
                      </label>
                    </div>
                  </div>

                  <button
                    onClick={handleDeliverySubmit}
                    className="w-full py-4 bg-amber text-white rounded-xl font-semibold hover:bg-amber-light transition-colors flex items-center justify-center gap-2"
                  >
                    Continue to Payment
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </motion.div>
              )}

              {/* Payment Step */}
              {step === 'payment' && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-2xl border border-border p-6"
                >
                  <h2 className="font-display text-xl font-semibold text-dark mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber" />
                    Payment Method
                  </h2>

                  {/* Escrow Notice */}
                  <div className="flex items-start gap-3 p-4 bg-green-pale rounded-xl mb-6">
                    <Shield className="w-6 h-6 text-green flex-shrink-0" />
                    <div>
                      <p className="font-medium text-dark mb-1">Secure Escrow Payment</p>
                      <p className="text-sm text-muted">
                        Your payment is held securely until you confirm delivery. 
                        Only release funds after checking your order.
                      </p>
                    </div>
                  </div>

                  {/* Payment Options */}
                  <div className="space-y-3 mb-6">
                    <label 
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                        paymentMethod === 'mpesa' ? 'border-green bg-green-pale' : 'border-border hover:border-amber'
                      }`}
                      onClick={() => setPaymentMethod('mpesa')}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'mpesa'}
                        onChange={() => setPaymentMethod('mpesa')}
                        className="w-5 h-5 text-green"
                      />
                      <div className="w-12 h-12 bg-green rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark">M-Pesa</p>
                        <p className="text-sm text-muted">Pay via Lipa Na M-Pesa Paybill</p>
                      </div>
                      <span className="px-3 py-1 bg-green text-white text-xs font-medium rounded-full">
                        Recommended
                      </span>
                    </label>

                    <label 
                      className={`flex items-center gap-4 p-4 border-2 rounded-xl cursor-pointer transition-colors opacity-60 ${
                        paymentMethod === 'card' ? 'border-amber bg-amber-pale' : 'border-border'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="w-5 h-5 text-amber"
                        disabled
                      />
                      <div className="w-12 h-12 bg-dark rounded-xl flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-dark">Card Payment</p>
                        <p className="text-sm text-muted">Visa, Mastercard</p>
                      </div>
                      <span className="px-3 py-1 bg-muted text-white text-xs font-medium rounded-full">
                        Coming Soon
                      </span>
                    </label>
                  </div>

                  {/* M-Pesa Info */}
                  {paymentMethod === 'mpesa' && (
                    <div className="bg-cream rounded-xl p-4 mb-6">
                      <h4 className="font-medium text-dark mb-2">How it works:</h4>
                      <ol className="text-sm text-muted space-y-1 list-decimal list-inside">
                        <li>Click "Pay with M-Pesa" to see payment details</li>
                        <li>Pay manually via M-Pesa app on your phone</li>
                        <li>Upload your M-Pesa confirmation screenshot</li>
                        <li>Seller verifies and confirms your payment</li>
                        <li>Your money is held safely until delivery</li>
                      </ol>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('delivery')}
                      className="flex-1 py-4 border border-border rounded-xl font-medium text-muted hover:bg-cream transition-colors flex items-center justify-center gap-2"
                    >
                      <ChevronLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handlePaymentSelect}
                      disabled={isCreatingOrder}
                      className="flex-1 py-4 bg-green text-white rounded-xl font-semibold hover:bg-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isCreatingOrder ? (
                        <>
                          <span className="animate-spin">⏳</span>
                          Creating Order...
                        </>
                      ) : (
                        <>
                          Pay with M-Pesa
                          <ChevronRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl border border-border p-6 sticky top-24"
            >
              <h3 className="font-display text-lg font-semibold text-dark mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-amber" />
                Order Summary
              </h3>

              {/* Items */}
              <div className="space-y-3 mb-4">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-pale rounded-lg flex items-center justify-center text-lg">
                      {item.productEmoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-dark text-sm truncate">{item.productName}</p>
                      <p className="text-xs text-muted">{item.quantity}kg × {formatAmount(item.price)}</p>
                    </div>
                    <p className="font-semibold text-dark text-sm">
                      {formatAmount(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Subtotal</span>
                  <span className="text-dark">{formatAmount(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Delivery Fee</span>
                  <span className="text-dark">{formatAmount(cart.deliveryFee)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Platform Fee (2%)</span>
                  <span className="text-dark">{formatAmount(cart.platformFee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-border">
                  <span className="font-semibold text-dark">Total</span>
                  <span className="font-display text-xl font-bold text-amber">
                    {formatAmount(cart.total)}
                  </span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 text-sm text-green">
                  <Shield className="w-4 h-4" />
                  <span>Escrow Protected</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* M-Pesa Payment Modal */}
      <AnimatePresence>
        {showMpesaModal && (
          <MpesaPayment
            orderId={orderId}
            amount={cart.total}
            onPaymentSubmit={handleMpesaPaymentSubmit}
            onCancel={() => setShowMpesaModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
