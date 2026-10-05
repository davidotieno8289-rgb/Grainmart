import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '@/types';
import { useCart } from '@/hooks';
import { formatCurrency } from '@/utils';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();

  const handleIncrement = () => {
    if (item.quantity < item.stock) {
      updateQuantity(item.productId, item.quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (item.quantity > item.minOrderKg) {
      updateQuantity(item.productId, item.quantity - 1);
    }
  };

  const itemTotal = item.price * item.quantity;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="flex gap-3 p-3 bg-white rounded-lg border border-border"
    >
      {/* Product Image/Emoji */}
      <div className="w-16 h-16 bg-amber-pale rounded-lg flex items-center justify-center flex-shrink-0">
        {item.image ? (
          <img
            src={item.image}
            alt={item.productName}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <span className="text-2xl">{item.productEmoji}</span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-dark text-sm truncate">
          {item.productName}
        </h4>
        <p className="text-xs text-muted">
          {formatCurrency(item.price)}/kg
        </p>

        <div className="flex items-center justify-between mt-2">
          {/* Quantity Controls */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button
              onClick={handleDecrement}
              disabled={item.quantity <= item.minOrderKg}
              className="w-8 h-8 flex items-center justify-center bg-cream hover:bg-amber-pale disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-10 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <button
              onClick={handleIncrement}
              disabled={item.quantity >= item.stock}
              className="w-8 h-8 flex items-center justify-center bg-cream hover:bg-amber-pale disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Item Total */}
          <p className="font-display font-semibold text-amber">
            {formatCurrency(itemTotal)}
          </p>
        </div>

        {/* Min order warning */}
        {item.quantity < item.minOrderKg && (
          <p className="text-xs text-terra mt-1">
            Min. order: {item.minOrderKg}kg
          </p>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={() => removeFromCart(item.productId)}
        className="p-2 text-muted hover:text-terra hover:bg-terra/10 rounded-lg self-start transition-colors"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

export default CartItem;
