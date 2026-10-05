import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Notification } from '@/types';
import { subscribeToNotifications, subscribeToUnreadCount, markNotificationRead, markAllNotificationsRead } from '@/services/notifications';
import { useAuth } from './AuthContext';
import { isDemoMode } from '@/services/firebase';

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  isOpen: boolean;
  toggleNotifications: (open?: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  // Subscribe to notifications when user is logged in
  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }

    // Demo mode: don't subscribe to Firestore
    if (isDemoMode) {
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to notifications list
    const unsubscribeNotifications = subscribeToNotifications(user.uid, (newNotifications) => {
      setNotifications(newNotifications);
      setLoading(false);
    });

    // Subscribe to unread count
    const unsubscribeCount = subscribeToUnreadCount(user.uid, (count) => {
      setUnreadCount(count);
    });

    return () => {
      unsubscribeNotifications();
      unsubscribeCount();
    };
  }, [user]);

  const markAsRead = async (notificationId: string) => {
    if (!user) return;
    
    try {
      await markNotificationRead(user.uid, notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    
    try {
      await markAllNotificationsRead(user.uid);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const toggleNotifications = (open?: boolean) => {
    setIsOpen(open ?? !isOpen);
  };

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    isOpen,
    toggleNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
