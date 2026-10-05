import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, WifiOff } from 'lucide-react';
import { useServiceWorker } from '@/hooks/useServiceWorker';

export function UpdatePrompt() {
  const { isUpdating, isOnline, skipWaiting } = useServiceWorker();

  return (
    <AnimatePresence>
      {/* Update available prompt */}
      {isUpdating && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50"
        >
          <div className="bg-green text-white rounded-xl p-4 shadow-lg flex items-center gap-3">
            <RefreshCw className="w-5 h-5 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-sm">Update available!</p>
              <p className="text-xs text-white/80">Refresh for the latest version</p>
            </div>
            <button
              onClick={skipWaiting}
              className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              Update
            </button>
          </div>
        </motion.div>
      )}

      {/* Offline indicator */}
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -30 }}
          className="fixed top-0 left-0 right-0 z-50"
        >
          <div className="bg-terra text-white py-2 px-4 flex items-center justify-center gap-2 text-sm">
            <WifiOff className="w-4 h-4" />
            <span>You're offline. Some features may be unavailable.</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default UpdatePrompt;
