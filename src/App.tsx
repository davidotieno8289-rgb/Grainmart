import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Header from '@/components/shared/Header';
import Footer from '@/components/shared/Footer';
import MobileNav from '@/components/shared/MobileNav';
import { CartPanel } from '@/components/cart';
import NotificationPanel from '@/components/shared/Notification';
import { AuthPage } from '@/components/auth';
import HomePage from '@/pages/HomePage';
import ProductPage from '@/pages/ProductPage';
import DashboardPage from '@/pages/DashboardPage';
import SellersPage from '@/pages/SellersPage';
import CheckoutPage from '@/pages/CheckoutPage';
import InstallPrompt from '@/components/shared/InstallPrompt';
import UpdatePrompt from '@/components/shared/UpdatePrompt';
import SplashScreen from '@/components/shared/SplashScreen';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pt-[68px] pb-16 md:pb-0">
        {children}
      </main>
      <Footer />
      <MobileNav />
      <CartPanel />
      <NotificationPanel />
      <InstallPrompt />
      <UpdatePrompt />
    </div>
  );
};

const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if running as installed PWA
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
                       (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
    
    // Only show splash for installed PWA
    if (!standalone) {
      setShowSplash(false);
    }
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <NotificationProvider>
            {/* Splash screen for PWA */}
            {showSplash && isStandalone && (
              <SplashScreen onComplete={() => setShowSplash(false)} />
            )}
            
            <Toaster 
              position="bottom-center"
              toastOptions={{
                style: {
                  background: '#1A1208',
                  color: '#FBF5E6',
                  borderRadius: '12px',
                },
                success: {
                  iconTheme: {
                    primary: '#2D5016',
                    secondary: '#FBF5E6',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#C94A1A',
                    secondary: '#FBF5E6',
                  },
                },
              }}
            />
            <Routes>
              {/* Auth route without layout */}
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Routes with layout */}
              <Route
                path="/"
                element={
                  <AppLayout>
                    <HomePage />
                  </AppLayout>
                }
              />
              <Route
                path="/product/:productId"
                element={
                  <AppLayout>
                    <ProductPage />
                  </AppLayout>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <AppLayout>
                    <DashboardPage />
                  </AppLayout>
                }
              />
              <Route
                path="/sellers"
                element={
                  <AppLayout>
                    <SellersPage />
                  </AppLayout>
                }
              />
              <Route
                path="/checkout"
                element={
                  <AppLayout>
                    <CheckoutPage />
                  </AppLayout>
                }
              />
              
              {/* Catch-all route */}
              <Route
                path="*"
                element={
                  <AppLayout>
                    <div className="flex items-center justify-center min-h-[50vh] text-center">
                      <div>
                        <span className="text-6xl mb-4 block">🔍</span>
                        <h1 className="font-display text-2xl font-semibold mb-2">Page Not Found</h1>
                        <p className="text-muted">The page you're looking for doesn't exist.</p>
                      </div>
                    </div>
                  </AppLayout>
                }
              />
            </Routes>
          </NotificationProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
