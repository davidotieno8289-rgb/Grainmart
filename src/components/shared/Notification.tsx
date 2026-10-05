import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Package, MessageSquare, AlertCircle, CheckCircle } from 'lucide-react';
import { useNotifications } from '@/context';
import { Notification as NotificationType } from '@/types';
import { formatDistanceToNow } from 'date-fns';

const NotificationPanel: React.FC = () => {
  const { notifications, isOpen, toggleNotifications, markAsRead, markAllAsRead, loading } = useNotifications();

  const getIcon = (type: NotificationType['type']) => {
    switch (type) {
      case 'order_received':
      case 'order_status':
        return <Package className="w-5 h-5 text-amber" />;
      case 'message':
        return <MessageSquare className="w-5 h-5 text-green" />;
      case 'low_stock':
        return <AlertCircle className="w-5 h-5 text-terra" />;
      case 'payment_confirmed':
      case 'payment_released':
        return <CheckCircle className="w-5 h-5 text-green" />;
      default:
        return <Bell className="w-5 h-5 text-muted" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark/30 z-40"
            onClick={() => toggleNotifications(false)}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white shadow-modal z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber" />
                <h2 className="font-display font-semibold text-lg">Notifications</h2>
              </div>
              <div className="flex items-center gap-2">
                {notifications.some(n => !n.read) && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-amber hover:underline"
                  >
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => toggleNotifications(false)}
                  className="p-2 hover:bg-cream rounded-lg transition-colors"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="overflow-y-auto h-[calc(100%-64px)]">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="w-8 h-8 border-2 border-amber border-t-transparent rounded-full animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <Bell className="w-12 h-12 text-border mb-4" />
                  <p className="text-muted">No notifications yet</p>
                  <p className="text-sm text-muted/70 mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`p-4 hover:bg-cream/50 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-amber-pale/30' : ''
                      }`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 p-2 bg-cream rounded-lg">
                          {getIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted mt-0.5 line-clamp-2">
                            {notification.body}
                          </p>
                          <p className="text-xs text-muted/70 mt-1">
                            {formatDistanceToNow(notification.createdAt.toDate(), { addSuffix: true })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-amber rounded-full flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
