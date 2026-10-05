import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Share2 } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if user dismissed prompt before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    const dismissedTime = dismissed ? parseInt(dismissed) : 0;
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (Date.now() - dismissedTime < oneWeek) {
      return; // Don't show prompt within a week of dismissal
    }

    // Listen for install prompt
    const handler = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS prompt after delay if on iOS and not installed
    if (ios && !standalone) {
      setTimeout(() => setShowPrompt(true), 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  // Don't show if already installed
  if (isStandalone) return null;

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50"
        >
          <div className="bg-dark text-cream rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="relative p-4 pb-0">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors"
                aria-label="Dismiss"
              >
                <X className="w-5 h-5" />
              </button>
              
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-amber/20 rounded-xl flex items-center justify-center text-3xl">
                  🌾
                </div>
                <div>
                  <h3 className="font-display font-semibold text-lg">
                    Install GrainMart
                  </h3>
                  <p className="text-muted text-sm">
                    Get the full app experience
                  </p>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="p-4 space-y-2">
              <div className="flex items-center gap-2 text-sm text-cream/80">
                <Smartphone className="w-4 h-4 text-amber" />
                <span>Works offline</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-cream/80">
                <Download className="w-4 h-4 text-green" />
                <span>Faster loading</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-cream/80">
                <Share2 className="w-4 h-4 text-amber-light" />
                <span>Easy access from home screen</span>
              </div>
            </div>

            {/* Action */}
            <div className="p-4 pt-0">
              {isIOS ? (
                <div className="bg-white/10 rounded-xl p-3 text-sm">
                  <p className="text-cream/90 mb-2">
                    To install on iOS:
                  </p>
                  <ol className="text-cream/70 space-y-1 ml-4 list-decimal">
                    <li>Tap the Share button <Share2 className="inline w-4 h-4" /></li>
                    <li>Scroll and tap "Add to Home Screen"</li>
                    <li>Tap "Add" to confirm</li>
                  </ol>
                </div>
              ) : (
                <button
                  onClick={handleInstall}
                  className="w-full bg-gradient-to-r from-amber to-amber-light text-dark font-semibold py-3 rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  <Download className="w-5 h-5" />
                  Install Now
                </button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default InstallPrompt;
