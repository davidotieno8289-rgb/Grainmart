import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingCart, ArrowRight, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/hooks';
import { formatCurrency } from '@/utils';
import { Button } from '@/components/ui';
import { EscrowBadge } from '@/components/shared';
import CartItem from './CartItem';

const CartPanel: React.FC = () => {
  const navigate = useNavigate();
  const { 
    items, 
    subtotal, 
    platformFee, 
    deliveryFee,
    total, 
    isOpen, 
    toggleCart, 
    clearCart,
    validateCart 
  } = useCart();

  const validation = validateCart();

  const handleCheckout = () => {
    toggleCart(false);
    navigate('/checkout');
  };

  // Group items by seller
  const itemsBySeller = items.reduce((acc, item) => {
    if (!acc[item.sellerId]) {
      acc[item.sellerId] = {
        sellerName: item.sellerName,
        items: [],
      };
    }
    acc[item.sellerId].items.push(item);
    return acc;
  }, {} as Record<string, { sellerName: string; items: typeof items }>);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/50 z-40"
            onClick={() => toggleCart(false)}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-modal z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber" />
                <h2 className="font-display font-semibold text-lg">Shopping Cart</h2>
                <span className="px-2 py-0.5 bg-amber-pale text-amber text-xs font-medium rounded-full">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <button
                onClick={() => toggleCart(false)}
                className="p-2 hover:bg-cream rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Content */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-amber-pale rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10 text-amber" />
                </div>
                <h3 className="font-display font-semibold text-lg text-dark mb-2">
                  Your cart is empty
                </h3>
                <p className="text-muted text-sm mb-6">
                  Browse our marketplace to find quality grains from verified sellers
                </p>
                <Button onClick={() => { toggleCart(false); navigate('/'); }}>
                  Start Shopping
                </Button>
              </div>
            ) : (
              <>
                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4">
                  {Object.entries(itemsBySeller).map(([sellerId, { sellerName, items: sellerItems }]) => (
                    <div key={sellerId} className="mb-6 last:mb-0">
                      <h3 className="text-sm font-medium text-muted mb-3 flex items-center gap-2">
                        <span>From:</span>
                        <span className="text-dark">{sellerName}</span>
                      </h3>
                      <div className="space-y-3">
                        {sellerItems.map((item) => (
                          <CartItem key={item.productId} item={item} />
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Clear cart button */}
                  <button
                    onClick={clearCart}
                    className="flex items-center gap-2 text-sm text-terra hover:underline mt-4"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear cart
                  </button>
                </div>

                {/* Validation Errors */}
                {!validation.isValid && (
                  <div className="px-4 py-3 bg-terra/10 border-t border-terra/20">
                    <p className="text-sm text-terra font-medium mb-1">
                      Cannot proceed to checkout:
                    </p>
                    <ul className="text-xs text-terra/80 space-y-1">
                      {validation.errors.map((error, i) => (
                        <li key={i}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Summary */}
                <div className="p-4 border-t border-border bg-cream/50">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Subtotal</span>
                      <span>{formatCurrency(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Platform fee (2%)</span>
                      <span>{formatCurrency(platformFee)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Delivery (estimated)</span>
                      <span>{formatCurrency(deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between font-display font-semibold text-lg pt-2 border-t border-border">
                      <span>Total</span>
                      <span className="text-amber">{formatCurrency(total)}</span>
                    </div>
                  </div>

                  <EscrowBadge variant="compact" />

                  <Button
                    fullWidth
                    size="lg"
                    className="mt-4"
                    onClick={handleCheckout}
                    disabled={!validation.isValid}
                    rightIcon={<ArrowRight className="w-5 h-5" />}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartPanel;
