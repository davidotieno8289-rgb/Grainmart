import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, isDemoMode } from '@/services/firebase';
import { CartItem, DeliveryMethod } from '@/types';
import { calculateOrderFees, validateCartMinimum } from '@/utils';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

// Cart State
interface CartState {
  items: CartItem[];
  subtotal: number;
  platformFee: number;
  deliveryFee: number;
  deliveryMethod: DeliveryMethod;
  total: number;
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
  | { type: 'SET_DELIVERY_METHOD'; payload: DeliveryMethod }
  | { type: 'TOGGLE_CART'; payload?: boolean }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'RECALCULATE' };

// Initial State
const initialState: CartState = {
  items: [],
  subtotal: 0,
  platformFee: 0,
  deliveryFee: 150,
  deliveryMethod: 'standard',
  total: 0,
  isOpen: false,
  loading: false,
};

// Calculate totals
function calculateTotals(items: CartItem[], deliveryMethod: DeliveryMethod): Partial<CartState> {
  const fees = calculateOrderFees(items, deliveryMethod);
  return {
    subtotal: fees.subtotal,
    platformFee: fees.platformFee,
    deliveryFee: fees.deliveryFee,
    total: fees.total,
  };
}

// Reducer
function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'SET_ITEMS': {
      const totals = calculateTotals(action.payload, state.deliveryMethod);
      return { ...state, items: action.payload, ...totals, loading: false };
    }
    
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        item => item.productId === action.payload.productId
      );
      
      let newItems: CartItem[];
      if (existingIndex >= 0) {
        newItems = state.items.map((item, index) =>
          index === existingIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
      } else {
        newItems = [...state.items, action.payload];
      }
      
      const totals = calculateTotals(newItems, state.deliveryMethod);
      return { ...state, items: newItems, ...totals };
    }
    
    case 'UPDATE_QUANTITY': {
      const newItems = state.items.map(item =>
        item.productId === action.payload.productId
          ? { ...item, quantity: action.payload.quantity }
          : item
      ).filter(item => item.quantity > 0);
      
      const totals = calculateTotals(newItems, state.deliveryMethod);
      return { ...state, items: newItems, ...totals };
    }
    
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.productId !== action.payload);
      const totals = calculateTotals(newItems, state.deliveryMethod);
      return { ...state, items: newItems, ...totals };
    }
    
    case 'CLEAR_CART': {
      return { ...initialState };
    }
    
    case 'SET_DELIVERY_METHOD': {
      const totals = calculateTotals(state.items, action.payload);
      return { ...state, deliveryMethod: action.payload, ...totals };
    }
    
    case 'TOGGLE_CART': {
      return { ...state, isOpen: action.payload ?? !state.isOpen };
    }
    
    case 'SET_LOADING': {
      return { ...state, loading: action.payload };
    }
    
    case 'RECALCULATE': {
      const totals = calculateTotals(state.items, state.deliveryMethod);
      return { ...state, ...totals };
    }
    
    default:
      return state;
  }
}

// Context
interface CartContextType extends CartState {
  addToCart: (item: CartItem) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  setDeliveryMethod: (method: DeliveryMethod) => void;
  toggleCart: (open?: boolean) => void;
  setCartOpen: (open: boolean) => void;
  validateCart: () => { isValid: boolean; errors: string[] };
  saveCart: () => Promise<void>;
  loadCart: () => Promise<void>;
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

  // Load cart from localStorage or Firestore on mount
  useEffect(() => {
    const loadSavedCart = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Try loading from Firestore if user is logged in (not in demo mode)
      if (user && !isDemoMode) {
        try {
          const cartRef = doc(db, 'carts', user.uid);
          const cartSnap = await getDoc(cartRef);
          
          if (cartSnap.exists()) {
            const data = cartSnap.data();
            dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
        } catch (error) {
          console.error('Error loading cart from Firestore:', error);
        }
      }
      
      // Fallback to localStorage
      const savedCart = localStorage.getItem('grainmart_cart');
      if (savedCart) {
        try {
          const items = JSON.parse(savedCart);
          dispatch({ type: 'SET_ITEMS', payload: items });
        } catch (error) {
          console.error('Error parsing saved cart:', error);
        }
      }
      
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    loadSavedCart();
  }, [user]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (state.items.length > 0) {
      localStorage.setItem('grainmart_cart', JSON.stringify(state.items));
    } else {
      localStorage.removeItem('grainmart_cart');
    }
  }, [state.items]);

  const addToCart = (item: CartItem) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }
    
    dispatch({ type: 'ADD_ITEM', payload: item });
    toast.success(`${item.productName} added to cart`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    const item = state.items.find(i => i.productId === productId);
    if (item && quantity < item.minOrderKg && quantity > 0) {
      toast.error(`Minimum order is ${item.minOrderKg}kg`);
      return;
    }
    
    if (item && quantity > item.stock) {
      toast.error(`Only ${item.stock}kg available`);
      return;
    }
    
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
  };

  const removeFromCart = (productId: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: productId });
    toast.success('Item removed from cart');
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    localStorage.removeItem('grainmart_cart');
  };

  const setDeliveryMethod = (method: DeliveryMethod) => {
    dispatch({ type: 'SET_DELIVERY_METHOD', payload: method });
  };

  const toggleCart = (open?: boolean) => {
    dispatch({ type: 'TOGGLE_CART', payload: open });
  };

  const setCartOpen = (open: boolean) => {
    dispatch({ type: 'TOGGLE_CART', payload: open });
  };

  const validateCart = () => {
    return validateCartMinimum(state.items);
  };

  const saveCart = async () => {
    if (!user || isDemoMode) {
      // In demo mode, just save to localStorage
      localStorage.setItem('grainmart_cart', JSON.stringify(state.items));
      toast.success('Cart saved locally');
      return;
    }
    
    try {
      const cartRef = doc(db, 'carts', user.uid);
      await setDoc(cartRef, {
        items: state.items,
        updatedAt: new Date(),
      });
      toast.success('Cart saved');
    } catch (error) {
      console.error('Error saving cart:', error);
      toast.error('Failed to save cart');
    }
  };

  const loadCart = async () => {
    if (!user || isDemoMode) return;
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const cartRef = doc(db, 'carts', user.uid);
      const cartSnap = await getDoc(cartRef);
      
      if (cartSnap.exists()) {
        const data = cartSnap.data();
        dispatch({ type: 'SET_ITEMS', payload: data.items || [] });
      }
    } catch (error) {
      console.error('Error loading cart:', error);
    }
    dispatch({ type: 'SET_LOADING', payload: false });
  };

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  const value: CartContextType = {
    ...state,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    setDeliveryMethod,
    toggleCart,
    setCartOpen,
    validateCart,
    saveCart,
    loadCart,
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
