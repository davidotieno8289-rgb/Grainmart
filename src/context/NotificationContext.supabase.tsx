import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase, isDemoMode } from '@/services/supabase';
import { useAuth } from './AuthContext';
import { Notification } from '@/types';

// Notification State
interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isOpen: boolean;
  loading: boolean;
}

// Actions
type NotificationAction =
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_READ'; payload: string }
  | { type: 'MARK_ALL_READ' }
  | { type: 'TOGGLE_PANEL'; payload?: boolean }
  | { type: 'SET_LOADING'; payload: boolean };

// Initial State
const initialState: NotificationState = {
  notifications: [],
  unreadCount: 0,
  isOpen: false,
  loading: false,
};

// Reducer
function notificationReducer(state: NotificationState, action: NotificationAction): NotificationState {
  switch (action.type) {
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter(n => !n.read).length,
        loading: false,
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
        unreadCount: state.unreadCount + (action.payload.read ? 0 : 1),
      };
    case 'MARK_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'TOGGLE_PANEL':
      return { ...state, isOpen: action.payload ?? !state.isOpen };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    default:
      return state;
  }
}

// Map database row to Notification type
function mapDbNotification(row: any): Notification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body || '',
    data: row.data,
    read: row.read,
    createdAt: new Date(row.created_at),
  };
}

// Context
interface NotificationContextType extends NotificationState {
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  togglePanel: (open?: boolean) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Provider
interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { user } = useAuth();

  // Load notifications and subscribe to realtime
  useEffect(() => {
    if (!user || isDemoMode) {
      dispatch({ type: 'SET_NOTIFICATIONS', payload: [] });
      return;
    }

    const loadNotifications = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        // Get user's internal ID from auth_id
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_id', user.uid)
          .single();

        if (!userData) return;

        const userId = userData.id;

        // Fetch notifications
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;

        dispatch({
          type: 'SET_NOTIFICATIONS',
          payload: (data || []).map(mapDbNotification),
        });

        // Subscribe to realtime notifications
        const channel = supabase
          .channel('notifications')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              dispatch({
                type: 'ADD_NOTIFICATION',
                payload: mapDbNotification(payload.new),
              });

              // Show browser notification if permitted
              if (Notification.permission === 'granted') {
                new Notification(payload.new.title, {
                  body: payload.new.body,
                  icon: '/icons/icon-192x192.png',
                });
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (error) {
        console.error('Error loading notifications:', error);
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadNotifications();
  }, [user]);

  // Mark as read
  const markAsRead = async (notificationId: string) => {
    dispatch({ type: 'MARK_READ', payload: notificationId });

    if (!isDemoMode) {
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    dispatch({ type: 'MARK_ALL_READ' });

    if (!isDemoMode && user) {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_id', user.uid)
        .single();

      if (userData) {
        await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', userData.id)
          .eq('read', false);
      }
    }
  };

  // Toggle panel
  const togglePanel = (open?: boolean) => {
    dispatch({ type: 'TOGGLE_PANEL', payload: open });
  };

  const value: NotificationContextType = {
    ...state,
    markAsRead,
    markAllAsRead,
    togglePanel,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

// Hook
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
