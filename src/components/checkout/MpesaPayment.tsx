import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  Copy, 
  Check, 
  Upload, 
  Camera, 
  X, 
  AlertCircle,
  CheckCircle,
  Clock,
  Shield
} from 'lucide-react';
import toast from 'react-hot-toast';

// GrainMart's M-Pesa Paybill Details
const MPESA_PAYBILL = {
  businessNumber: '247247', // Example paybill - replace with actual
  businessName: 'GRAINMART LTD',
  accountFormat: 'GRM-{orderId}', // Order ID used as account number
};

interface MpesaPaymentProps {
  orderId: string;
  amount: number;
  onPaymentSubmit: (proofImage: File, mpesaCode: string) => Promise<void>;
  onCancel: () => void;
}

type PaymentStep = 'instructions' | 'upload' | 'submitted';

export default function MpesaPayment({
  orderId,
  amount,
  onPaymentSubmit,
  onCancel,
}: MpesaPaymentProps) {
  const [step, setStep] = useState<PaymentStep>('instructions');
  const [proofImage, setProofImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mpesaCode, setMpesaCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const accountNumber = `GRM-${orderId}`;

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success(`${field} copied!`);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }
      setProofImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }, []);

  const handleSubmit = async () => {
    if (!proofImage) {
      toast.error('Please upload payment screenshot');
      return;
    }
    if (!mpesaCode.match(/^[A-Z0-9]{10}$/)) {
      toast.error('Enter a valid M-Pesa transaction code (10 characters)');
      return;
    }

    setIsSubmitting(true);
    try {
      await onPaymentSubmit(proofImage, mpesaCode);
      setStep('submitted');
    } catch (error) {
      toast.error('Failed to submit payment proof');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatAmount = (amt: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amt);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-dark/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-green text-white p-5 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold">M-Pesa Payment</h2>
                <p className="text-white/80 text-sm">Pay via Lipa Na M-Pesa</p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Payment Instructions */}
          {step === 'instructions' && (
            <motion.div
              key="instructions"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5"
            >
              {/* Amount Display */}
              <div className="bg-amber-pale rounded-xl p-4 mb-6 text-center">
                <p className="text-sm text-muted mb-1">Amount to Pay</p>
                <p className="font-display text-3xl font-bold text-amber">
                  {formatAmount(amount)}
                </p>
              </div>

              {/* M-Pesa Instructions */}
              <div className="space-y-4 mb-6">
                <h3 className="font-semibold text-dark flex items-center gap-2">
                  <span className="w-6 h-6 bg-green text-white rounded-full flex items-center justify-center text-sm">1</span>
                  Open M-Pesa on your phone
                </h3>
                
                <h3 className="font-semibold text-dark flex items-center gap-2">
                  <span className="w-6 h-6 bg-green text-white rounded-full flex items-center justify-center text-sm">2</span>
                  Select Lipa Na M-Pesa → Pay Bill
                </h3>
                
                <h3 className="font-semibold text-dark flex items-center gap-2">
                  <span className="w-6 h-6 bg-green text-white rounded-full flex items-center justify-center text-sm">3</span>
                  Enter these details:
                </h3>

                {/* Paybill Details */}
                <div className="bg-cream rounded-xl p-4 space-y-3">
                  {/* Business Number */}
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">Business Number</p>
                      <p className="font-mono text-lg font-bold text-dark">{MPESA_PAYBILL.businessNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(MPESA_PAYBILL.businessNumber, 'Business Number')}
                      className="p-2 bg-white rounded-lg hover:bg-amber-pale transition-colors"
                    >
                      {copiedField === 'Business Number' ? (
                        <Check className="w-5 h-5 text-green" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted" />
                      )}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">Account Number</p>
                      <p className="font-mono text-lg font-bold text-amber">{accountNumber}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(accountNumber, 'Account Number')}
                      className="p-2 bg-white rounded-lg hover:bg-amber-pale transition-colors"
                    >
                      {copiedField === 'Account Number' ? (
                        <Check className="w-5 h-5 text-green" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted" />
                      )}
                    </button>
                  </div>

                  {/* Amount */}
                  <div className="flex items-center justify-between border-t border-border pt-3">
                    <div>
                      <p className="text-xs text-muted uppercase tracking-wide">Amount</p>
                      <p className="font-mono text-lg font-bold text-dark">{amount}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(amount.toString(), 'Amount')}
                      className="p-2 bg-white rounded-lg hover:bg-amber-pale transition-colors"
                    >
                      {copiedField === 'Amount' ? (
                        <Check className="w-5 h-5 text-green" />
                      ) : (
                        <Copy className="w-5 h-5 text-muted" />
                      )}
                    </button>
                  </div>
                </div>

                <h3 className="font-semibold text-dark flex items-center gap-2">
                  <span className="w-6 h-6 bg-green text-white rounded-full flex items-center justify-center text-sm">4</span>
                  Enter your M-Pesa PIN & confirm
                </h3>
              </div>

              {/* Warning */}
              <div className="flex items-start gap-3 p-4 bg-amber-pale rounded-xl mb-6">
                <AlertCircle className="w-5 h-5 text-amber flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-dark mb-1">Important</p>
                  <p className="text-muted">
                    Use exactly <span className="font-mono font-bold text-amber">{accountNumber}</span> as your account number. 
                    This links your payment to your order.
                  </p>
                </div>
              </div>

              {/* Next Button */}
              <button
                onClick={() => setStep('upload')}
                className="w-full py-4 bg-green text-white rounded-xl font-semibold hover:bg-green-light transition-colors"
              >
                I've Made the Payment →
              </button>
            </motion.div>
          )}

          {/* Step 2: Upload Proof */}
          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-5"
            >
              <div className="text-center mb-6">
                <h3 className="font-display text-xl font-semibold text-dark mb-2">
                  Upload Payment Proof
                </h3>
                <p className="text-muted text-sm">
                  Screenshot your M-Pesa confirmation message
                </p>
              </div>

              {/* Image Upload */}
              <div className="mb-6">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Payment proof"
                      className="w-full rounded-xl border-2 border-green"
                    />
                    <button
                      onClick={() => {
                        setProofImage(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-2 right-2 p-2 bg-terra text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-amber hover:bg-amber-pale/50 transition-colors">
                      <div className="w-16 h-16 bg-cream rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="w-8 h-8 text-muted" />
                      </div>
                      <p className="font-medium text-dark mb-1">
                        Tap to upload screenshot
                      </p>
                      <p className="text-sm text-muted">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* M-Pesa Code Input */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-dark mb-2">
                  M-Pesa Transaction Code
                </label>
                <input
                  type="text"
                  value={mpesaCode}
                  onChange={(e) => setMpesaCode(e.target.value.toUpperCase())}
                  placeholder="e.g., QJK2ABCD1X"
                  maxLength={10}
                  className="w-full px-4 py-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-green focus:border-transparent font-mono text-lg tracking-wider uppercase"
                />
                <p className="mt-2 text-xs text-muted">
                  Find this in your M-Pesa confirmation SMS
                </p>
              </div>

              {/* Example SMS */}
              <div className="bg-cream rounded-xl p-4 mb-6">
                <p className="text-xs text-muted mb-2">Example M-Pesa message:</p>
                <p className="text-sm text-dark font-mono">
                  <span className="text-amber font-bold">QJK2ABCD1X</span> Confirmed. Ksh2,500.00 
                  sent to GRAINMART LTD for account {accountNumber}...
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('instructions')}
                  className="flex-1 py-3 border border-border rounded-xl font-medium text-muted hover:bg-cream transition-colors"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!proofImage || !mpesaCode || isSubmitting}
                  className="flex-1 py-3 bg-green text-white rounded-xl font-semibold hover:bg-green-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      Submit Proof
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Submitted */}
          {step === 'submitted' && (
            <motion.div
              key="submitted"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 text-center"
            >
              <div className="w-20 h-20 bg-green-pale rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green" />
              </div>
              
              <h3 className="font-display text-2xl font-bold text-dark mb-2">
                Payment Submitted!
              </h3>
              <p className="text-muted mb-6">
                Your payment proof has been sent to the seller for verification.
              </p>

              {/* Status Timeline */}
              <div className="bg-cream rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-green rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-dark">Payment proof uploaded</p>
                    <p className="text-xs text-muted">Just now</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-amber rounded-full flex items-center justify-center animate-pulse">
                    <Clock className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-dark">Awaiting seller confirmation</p>
                    <p className="text-xs text-muted">Usually within 1-2 hours</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-50">
                  <div className="w-8 h-8 bg-border rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-muted" />
                  </div>
                  <div>
                    <p className="font-medium text-muted">Funds held in escrow</p>
                    <p className="text-xs text-muted">Released after delivery</p>
                  </div>
                </div>
              </div>

              {/* Escrow Info */}
              <div className="flex items-start gap-3 p-4 bg-green-pale rounded-xl mb-6 text-left">
                <Shield className="w-5 h-5 text-green flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-dark mb-1">Your payment is protected</p>
                  <p className="text-muted">
                    Once confirmed, your money is held safely until you receive your order. 
                    Release funds only after checking your delivery.
                  </p>
                </div>
              </div>

              <button
                onClick={onCancel}
                className="w-full py-4 bg-dark text-white rounded-xl font-semibold hover:bg-brown transition-colors"
              >
                Track My Order
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
