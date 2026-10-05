import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Image as ImageIcon,
  Phone,
  AlertTriangle,
  Eye,
  ChevronDown,
  ChevronUp,
  Shield,
  Wallet,
  Package,
  ExternalLink,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

interface PaymentProof {
  orderId: string;
  buyerName: string;
  buyerPhone: string;
  amount: number;
  mpesaCode: string;
  proofImageUrl: string;
  submittedAt: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface PendingPayment extends PaymentProof {
  status: 'pending' | 'confirming' | 'confirmed' | 'rejected';
}

interface SellerPaymentConfirmationProps {
  payments: PendingPayment[];
  onConfirm: (orderId: string) => Promise<void>;
  onReject: (orderId: string, reason: string) => Promise<void>;
  walletBalance: number;
  escrowBalance: number;
}

// Demo data for testing
const DEMO_PAYMENTS: PendingPayment[] = [
  {
    orderId: 'GRM-20260403-001',
    buyerName: 'John Kamau',
    buyerPhone: '+254712345678',
    amount: 4500,
    mpesaCode: 'QJK2ABCD1X',
    proofImageUrl: '/demo/mpesa-screenshot-1.png',
    submittedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    status: 'pending',
    items: [
      { name: 'Premium Yellow Maize', quantity: 50, price: 70 },
      { name: 'Red Sorghum', quantity: 20, price: 75 },
    ],
  },
  {
    orderId: 'GRM-20260403-002',
    buyerName: 'Mary Wanjiku',
    buyerPhone: '+254723456789',
    amount: 2800,
    mpesaCode: 'PLM3WXYZ9K',
    proofImageUrl: '/demo/mpesa-screenshot-2.png',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'pending',
    items: [
      { name: 'Finger Millet', quantity: 40, price: 70 },
    ],
  },
];

export default function SellerPaymentConfirmation({
  payments = DEMO_PAYMENTS,
  onConfirm,
  onReject,
  walletBalance = 45000,
  escrowBalance = 12500,
}: SellerPaymentConfirmationProps) {
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [imageModalUrl, setImageModalUrl] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [processingOrder, setProcessingOrder] = useState<string | null>(null);

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const confirmedPayments = payments.filter(p => p.status === 'confirmed');

  const handleConfirm = async (orderId: string) => {
    setProcessingOrder(orderId);
    try {
      await onConfirm(orderId);
      toast.success('Payment confirmed! Order is now active.');
    } catch (error) {
      toast.error('Failed to confirm payment');
    } finally {
      setProcessingOrder(null);
    }
  };

  const handleReject = async (orderId: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason for rejection');
      return;
    }
    setProcessingOrder(orderId);
    try {
      await onReject(orderId, rejectReason);
      toast.success('Payment rejected. Buyer will be notified.');
      setRejectingOrder(null);
      setRejectReason('');
    } catch (error) {
      toast.error('Failed to reject payment');
    } finally {
      setProcessingOrder(null);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-pale rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green" />
            </div>
            <div>
              <p className="text-sm text-muted">Available Balance</p>
              <p className="font-display text-2xl font-bold text-green">
                {formatAmount(walletBalance)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Funds released from completed orders
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl border border-border p-5"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-pale rounded-xl flex items-center justify-center">
              <Shield className="w-6 h-6 text-amber" />
            </div>
            <div>
              <p className="text-sm text-muted">In Escrow</p>
              <p className="font-display text-2xl font-bold text-amber">
                {formatAmount(escrowBalance)}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted">
            Held until buyers confirm delivery
          </p>
        </motion.div>
      </div>

      {/* Pending Payments */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-semibold text-dark flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber" />
            Pending Confirmations
            {pendingPayments.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-amber text-white text-sm rounded-full">
                {pendingPayments.length}
              </span>
            )}
          </h2>
        </div>

        {pendingPayments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-border p-8 text-center"
          >
            <div className="w-16 h-16 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green" />
            </div>
            <h3 className="font-semibold text-dark mb-2">All caught up!</h3>
            <p className="text-muted text-sm">No pending payment confirmations</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {pendingPayments.map((payment, index) => (
              <motion.div
                key={payment.orderId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl border border-border overflow-hidden"
              >
                {/* Payment Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-cream transition-colors"
                  onClick={() => setExpandedPayment(
                    expandedPayment === payment.orderId ? null : payment.orderId
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-pale rounded-xl flex items-center justify-center">
                        <Phone className="w-6 h-6 text-amber" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-dark">{payment.buyerName}</h3>
                          <span className="px-2 py-0.5 bg-amber-pale text-amber text-xs rounded-full">
                            Pending
                          </span>
                        </div>
                        <p className="text-sm text-muted">
                          Order {payment.orderId} • {formatDistanceToNow(payment.submittedAt, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-display text-xl font-bold text-amber">
                          {formatAmount(payment.amount)}
                        </p>
                        <p className="text-xs text-muted font-mono">{payment.mpesaCode}</p>
                      </div>
                      {expandedPayment === payment.orderId ? (
                        <ChevronUp className="w-5 h-5 text-muted" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-muted" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                <AnimatePresence>
                  {expandedPayment === payment.orderId && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-border pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          {/* Order Items */}
                          <div>
                            <h4 className="text-sm font-medium text-muted mb-2">Order Items</h4>
                            <div className="space-y-2">
                              {payment.items.map((item, i) => (
                                <div key={i} className="flex justify-between text-sm">
                                  <span className="text-dark">
                                    {item.name} × {item.quantity}kg
                                  </span>
                                  <span className="text-muted">
                                    {formatAmount(item.quantity * item.price)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Proof */}
                          <div>
                            <h4 className="text-sm font-medium text-muted mb-2">Payment Proof</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setImageModalUrl(payment.proofImageUrl);
                              }}
                              className="flex items-center gap-2 px-3 py-2 bg-cream rounded-lg hover:bg-amber-pale transition-colors text-sm"
                            >
                              <ImageIcon className="w-4 h-4 text-amber" />
                              <span>View Screenshot</span>
                              <ExternalLink className="w-3 h-3 text-muted" />
                            </button>
                            <p className="mt-2 text-xs text-muted">
                              Buyer's phone: {payment.buyerPhone}
                            </p>
                          </div>
                        </div>

                        {/* Verification Checklist */}
                        <div className="bg-cream rounded-lg p-3 mb-4">
                          <h4 className="text-sm font-medium text-dark mb-2">✅ Verify before confirming:</h4>
                          <ul className="text-sm text-muted space-y-1">
                            <li>• M-Pesa code matches: <span className="font-mono text-amber">{payment.mpesaCode}</span></li>
                            <li>• Amount matches: <span className="font-bold text-dark">{formatAmount(payment.amount)}</span></li>
                            <li>• Account shows: <span className="font-mono text-amber">{payment.orderId}</span></li>
                            <li>• Payment received in your M-Pesa till</li>
                          </ul>
                        </div>

                        {/* Reject Form */}
                        {rejectingOrder === payment.orderId ? (
                          <div className="space-y-3 mb-4">
                            <textarea
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Why are you rejecting this payment? (e.g., Amount mismatch, Invalid screenshot, Payment not received)"
                              className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-terra focus:border-transparent text-sm resize-none"
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setRejectingOrder(null);
                                  setRejectReason('');
                                }}
                                className="flex-1 py-2 border border-border rounded-lg text-muted hover:bg-cream transition-colors text-sm"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleReject(payment.orderId)}
                                disabled={processingOrder === payment.orderId}
                                className="flex-1 py-2 bg-terra text-white rounded-lg hover:bg-red-600 transition-colors text-sm disabled:opacity-50"
                              >
                                {processingOrder === payment.orderId ? 'Rejecting...' : 'Confirm Rejection'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setRejectingOrder(payment.orderId);
                              }}
                              className="flex-1 py-3 border border-terra text-terra rounded-xl font-medium hover:bg-terra hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                              <XCircle className="w-5 h-5" />
                              Reject
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleConfirm(payment.orderId);
                              }}
                              disabled={processingOrder === payment.orderId}
                              className="flex-1 py-3 bg-green text-white rounded-xl font-medium hover:bg-green-light transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                              {processingOrder === payment.orderId ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <CheckCircle className="w-5 h-5" />
                              )}
                              Confirm Payment
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Confirmations */}
      {confirmedPayments.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-semibold text-dark mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green" />
            Recently Confirmed
          </h2>
          <div className="bg-white rounded-xl border border-border divide-y divide-border">
            {confirmedPayments.slice(0, 5).map((payment) => (
              <div key={payment.orderId} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-pale rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-green" />
                  </div>
                  <div>
                    <p className="font-medium text-dark">{payment.buyerName}</p>
                    <p className="text-sm text-muted">{payment.orderId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green">{formatAmount(payment.amount)}</p>
                  <p className="text-xs text-muted">In escrow</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {imageModalUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/80 z-50 flex items-center justify-center p-4"
            onClick={() => setImageModalUrl(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-lg w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setImageModalUrl(null)}
                className="absolute -top-12 right-0 p-2 text-white hover:bg-white/10 rounded-lg"
              >
                <XCircle className="w-6 h-6" />
              </button>
              <div className="bg-white rounded-xl p-2">
                <img
                  src={imageModalUrl}
                  alt="Payment proof"
                  className="w-full rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="600" fill="%23F0F0F0"><rect width="100%" height="100%"/><text x="50%" y="50%" text-anchor="middle" fill="%23999" font-size="16">Payment Screenshot</text></svg>';
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
