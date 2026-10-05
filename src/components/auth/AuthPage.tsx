import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import GoogleSignIn from './GoogleSignIn';
import PhoneAuth from './PhoneAuth';
import EmailAuth from './EmailAuth';
import RoleSelector from './RoleSelector';
import { useAuth } from '@/hooks';

type AuthMode = 'signin' | 'signup' | 'phone';

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>('signin');
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // Check if user needs role selection
  React.useEffect(() => {
    if (user && !user.role) {
      setShowRoleSelector(true);
    } else if (user && user.role) {
      navigate('/');
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-6xl"
        >
          🌾
        </motion.div>
      </div>
    );
  }

  if (showRoleSelector) {
    return <RoleSelector onComplete={() => navigate('/')} />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-dark via-brown to-green relative overflow-hidden">
        {/* Grain texture overlay */}
        <div className="absolute inset-0 grain-texture opacity-30" />
        
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity }}
            className="absolute top-1/4 left-1/4 text-8xl opacity-20"
          >
            🌾
          </motion.div>
          <motion.div
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, delay: 1 }}
            className="absolute top-1/2 right-1/4 text-7xl opacity-20"
          >
            🌽
          </motion.div>
          <motion.div
            animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
            transition={{ duration: 7, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/4 left-1/3 text-6xl opacity-20"
          >
            🫘
          </motion.div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 text-cream">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="font-display text-5xl font-bold mb-6">
              Kenya's Premier<br />
              <span className="text-amber">Grain Marketplace</span>
            </h1>
            <p className="text-xl text-cream/80 mb-8 max-w-md">
              Connect directly with verified farmers. Buy quality cereals 
              with secure escrow-protected payments.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🔒</span>
                <span>Escrow-protected transactions</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">✅</span>
                <span>Verified sellers only</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">📱</span>
                <span>M-Pesa & Card payments</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-2xl">🚚</span>
                <span>Nationwide delivery</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Forms */}
      <div className="w-full lg:w-1/2 bg-cream flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-4xl">🌾</span>
              <span className="font-display font-bold text-3xl text-amber">GrainMart</span>
            </div>
            <p className="text-muted">
              {authMode === 'signup' ? 'Create your account' : 'Welcome back'}
            </p>
          </div>

          {/* Auth Mode Tabs */}
          <div className="flex gap-1 p-1 bg-border/50 rounded-lg mb-6">
            <button
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                authMode === 'signin' 
                  ? 'bg-white text-dark shadow-sm' 
                  : 'text-muted hover:text-dark'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                authMode === 'signup' 
                  ? 'bg-white text-dark shadow-sm' 
                  : 'text-muted hover:text-dark'
              }`}
            >
              Sign Up
            </button>
            <button
              onClick={() => setAuthMode('phone')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                authMode === 'phone' 
                  ? 'bg-white text-dark shadow-sm' 
                  : 'text-muted hover:text-dark'
              }`}
            >
              Phone
            </button>
          </div>

          {/* Auth Forms */}
          <AnimatePresence mode="wait">
            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {authMode === 'phone' ? (
                <PhoneAuth />
              ) : (
                <>
                  <EmailAuth mode={authMode} />
                  
                  {/* Divider */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-cream text-muted">or continue with</span>
                    </div>
                  </div>

                  <GoogleSignIn />
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Terms */}
          <p className="mt-8 text-center text-xs text-muted">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-amber hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="/privacy" className="text-amber hover:underline">Privacy Policy</a>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
