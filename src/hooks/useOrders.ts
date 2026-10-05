import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '@/services/firebase';
import { Order, OrderStatus, TrackingStep } from '@/types';
import { generateOrderId } from '@/utils';
import { createNotification, NotificationMessages } from '@/services/notifications';
import toast from 'react-hot-toast';

interface UseOrdersOptions {
  userId?: string;
  sellerId?: string;
  status?: OrderStatus;
  limit?: number;
  realtime?: boolean;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useOrders(options: UseOrdersOptions = {}): UseOrdersReturn {
  const { userId, sellerId, status, limit: resultLimit = 50, realtime = false } = options;
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const buildQuery = useCallback(() => {
    const constraints = [];
    
    if (userId) {
      constraints.push(where('buyerId', '==', userId));
    }
    
    if (sellerId) {
      constraints.push(where('items', 'array-contains-any', [{ sellerId }]));
    }
    
    if (status) {
      constraints.push(where('orderStatus', '==', status));
    }
    
    constraints.push(orderBy('createdAt', 'desc'));
    constraints.push(limit(resultLimit));
    
    return query(collection(db, 'orders'), ...constraints);
  }, [userId, sellerId, status, resultLimit]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const q = buildQuery();
      const snapshot = await getDocs(q);
      const fetchedOrders: Order[] = [];
      
      snapshot.forEach((doc) => {
        fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
      });
      
      setOrders(fetchedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [buildQuery]);

  useEffect(() => {
    if (realtime && (userId || sellerId)) {
      const q = buildQuery();
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders: Order[] = [];
        snapshot.forEach((doc) => {
          fetchedOrders.push({ id: doc.id, ...doc.data() } as Order);
        });
        setOrders(fetchedOrders);
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      fetchOrders();
    }
  }, [buildQuery, realtime, userId, sellerId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { orders, loading, error, refresh: fetchOrders };
}

// Single order hook
export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const orderRef = doc(db, 'orders', orderId);
    const unsubscribe = onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        setOrder({ id: doc.id, ...doc.data() } as Order);
      } else {
        setError('Order not found');
      }
      setLoading(false);
    }, (err) => {
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
}

// Create order hook
export function useCreateOrder() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'trackingSteps'>): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      const orderId = generateOrderId();
      const now = Timestamp.now();
      
      const initialTracking: TrackingStep = {
        status: 'placed',
        timestamp: now,
        description: 'Order placed successfully',
      };
      
      const order = {
        ...orderData,
        id: orderId,
        trackingSteps: [initialTracking],
        createdAt: now,
        updatedAt: now,
      };
      
      await addDoc(collection(db, 'orders'), order);
      
      // Notify sellers
      const sellerIds = [...new Set(orderData.items.map(item => item.sellerId))];
      for (const sellerId of sellerIds) {
        const { title, body } = NotificationMessages.orderReceived(orderId, orderData.buyerName);
        await createNotification(sellerId, 'order_received', title, body, { orderId });
      }
      
      toast.success('Order placed successfully!');
      return { success: true, orderId };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order';
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return { createOrder, loading, error };
}

// Update order status hook
export function useUpdateOrderStatus() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (
    orderId: string, 
    newStatus: OrderStatus, 
    description: string,
    buyerId?: string
  ): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Find the order document
      const ordersRef = collection(db, 'orders');
      const q = query(ordersRef, where('id', '==', orderId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        toast.error('Order not found');
        return false;
      }
      
      const orderDoc = snapshot.docs[0];
      const currentOrder = orderDoc.data() as Order;
      
      const newStep: TrackingStep = {
        status: newStatus,
        timestamp: Timestamp.now(),
        description,
      };
      
      await updateDoc(orderDoc.ref, {
        orderStatus: newStatus,
        trackingSteps: [...currentOrder.trackingSteps, newStep],
        updatedAt: Timestamp.now(),
        ...(newStatus === 'delivered' && { deliveredAt: Timestamp.now() }),
      });
      
      // Notify buyer
      if (buyerId) {
        const { title, body } = NotificationMessages.orderStatusUpdate(orderId, newStatus);
        await createNotification(buyerId, 'order_status', title, body, { orderId, status: newStatus });
      }
      
      toast.success(`Order status updated to ${newStatus}`);
      return true;
    } catch (err) {
      toast.error('Failed to update order status');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateStatus, loading };
}
