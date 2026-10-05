import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  Timestamp,
  orderBy,
  limit 
} from 'firebase/firestore';
import { db } from './firebase';
import { Notification, NotificationType } from '@/types';

/**
 * Create a new notification for a user
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  data: Record<string, unknown> = {}
): Promise<string> {
  const notificationsRef = collection(db, 'notifications', userId, 'items');
  
  const notification = {
    type,
    title,
    body,
    read: false,
    data,
    createdAt: Timestamp.now(),
  };
  
  const docRef = await addDoc(notificationsRef, notification);
  return docRef.id;
}

/**
 * Mark a notification as read
 */
export async function markNotificationRead(
  userId: string, 
  notificationId: string
): Promise<void> {
  const notificationRef = doc(db, 'notifications', userId, 'items', notificationId);
  await updateDoc(notificationRef, { read: true });
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsRead(userId: string): Promise<void> {
  // In a production app, you'd use a batch write or cloud function
  // For now, this is a placeholder that would need to be implemented
  console.log('Mark all notifications read for user:', userId);
}

/**
 * Subscribe to user notifications (real-time)
 */
export function subscribeToNotifications(
  userId: string,
  callback: (notifications: Notification[]) => void
): () => void {
  const notificationsRef = collection(db, 'notifications', userId, 'items');
  const q = query(
    notificationsRef,
    orderBy('createdAt', 'desc'),
    limit(50)
  );
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    const notifications: Notification[] = [];
    snapshot.forEach((doc) => {
      notifications.push({ id: doc.id, ...doc.data() } as Notification);
    });
    callback(notifications);
  });
  
  return unsubscribe;
}

/**
 * Subscribe to unread notification count
 */
export function subscribeToUnreadCount(
  userId: string,
  callback: (count: number) => void
): () => void {
  const notificationsRef = collection(db, 'notifications', userId, 'items');
  const q = query(notificationsRef, where('read', '==', false));
  
  const unsubscribe = onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
  
  return unsubscribe;
}

// Notification message templates
export const NotificationMessages = {
  orderReceived: (orderId: string, buyerName: string) => ({
    title: 'New Order Received! 🎉',
    body: `${buyerName} placed order ${orderId}`,
  }),
  
  orderStatusUpdate: (orderId: string, status: string) => ({
    title: 'Order Update',
    body: `Your order ${orderId} is now ${status}`,
  }),
  
  newMessage: (senderName: string) => ({
    title: 'New Message 💬',
    body: `${senderName} sent you a message`,
  }),
  
  lowStock: (productName: string, stock: number) => ({
    title: 'Low Stock Alert ⚠️',
    body: `${productName} has only ${stock}kg remaining`,
  }),
  
  paymentConfirmed: (orderId: string, amount: string) => ({
    title: 'Payment Confirmed ✅',
    body: `Payment of ${amount} received for order ${orderId}`,
  }),
  
  paymentReleased: (amount: string) => ({
    title: 'Payment Released 💰',
    body: `${amount} has been released to your wallet`,
  }),
  
  reviewPosted: (productName: string, rating: number) => ({
    title: 'New Review ⭐',
    body: `Your ${productName} received a ${rating}-star review`,
  }),
  
  verificationApproved: () => ({
    title: 'Verification Approved ✅',
    body: 'Your seller account has been verified!',
  }),
  
  verificationRejected: (reason: string) => ({
    title: 'Verification Update',
    body: `Verification needs attention: ${reason}`,
  }),
};
