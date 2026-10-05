import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase, isDemoMode } from '@/services/supabase';
import { useAuth } from './AuthContext';
import { CartItem, Product } from '@/types';
import toast from 'react-hot-toast';

// Cart State
interface CartState {
  items: CartItem[];
  isOpen: boolean;
  loading: boolean;
}

// Cart Actions
type CartAction =
  | { type: 'SET_ITEMS'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: CartState = {
  items: [],
  isOpen: false,
  loading: false,
};

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS':
      return { ...state, items: action.payload, loading: false };
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.productId === action.payload.productId);
      if (existing) {
        return {
          ...state,
          items: state.items.map(item =>
            item.productId === action.payload.productId
              ? { ...item, quantity: item.quantity + action.payload.quantity }
              : item
          ),
        };
      }
      return { ...state, items: [...state.items, action.payload] };
    }
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.productId === action.payload.productId
            ? { ...item, quantity: action.payload.quantity }
            : item
        ),
      };
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.productId !== action.payload),
      };
    case 'CLEAR_CART':
      return { ...state, items: [] };
    case 'TOGGLE_CART':
      return { ...state, isOpen: action.payload ?? !state.isOpen };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// Context
interface CartContextType extends CartState {
  addToCart: (product: Product, quantity: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleCart: (open?: boolean) => void;
  subtotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider
interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { user } = useAuth();

  // Load cart from localStorage or Supabase
  useEffect(() => {
    const loadCart = async () => {
      // Always try localStorage first for quick loading
      const localCart = localStorage.getItem('grainmart-cart');
      if (localCart) {
        try {
          dispatch({ type: 'SET_ITEMS', payload: JSON.parse(localCart) });
        } catch (e) {
          console.error('Failed to parse local cart:', e);
        }
      }

      // If user is logged in and not in demo mode, sync with server
      if (user && !isDemoMode) {
        // Could implement server-side cart sync here
        // For now, we use localStorage
      }
    };

    loadCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('grainmart-cart', JSON.stringify(state.items));
  }, [state.items]);

  // Add to cart
  const addToCart = (product: Product, quantity: number) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    if (quantity < product.minOrderKg) {
      toast.error(`Minimum order is ${product.minOrderKg}kg`);
      return;
    }

    if (quantity > product.stock) {
      toast.error(`Only ${product.stock}kg available`);
      return;
    }

    const cartItem: CartItem = {
      productId: product.id,
      sellerId: product.sellerId,
      name: product.name,
      emoji: product.emoji,
      price: product.price,
      quantity,
      minOrderKg: product.minOrderKg,
      maxStock: product.stock,
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    toast.success(`Added ${quantity}kg of ${product.name} to cart`);
  };

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    const item = state.items.find(i => i.productId === productId);
    if (!item) return;

    if (quantity < item.minOrderKg) {
      toast.error(`Minimum order is ${item.minOrderKg}kg`);
      return;
    }

    if (quantity > item.maxStock) {
      toast.error(`Only ${item.maxStock}kg available`);
      return;
    }

    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  // Remove from cart
  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    toast.success('Item removed from cart');
  };

  // Clear cart
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  // Toggle cart panel
  const toggleCart = (open?: boolean) => {
    dispatch({ type: 'TOGGLE_CART', payload: open });
  };

  // Calculate subtotal
  const subtotal = state.items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Item count
  const itemCount = state.items.length;

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    toggleCart,
    subtotal,
    itemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Hook
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

export default CartContext;
