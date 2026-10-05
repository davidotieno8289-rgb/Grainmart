import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Home, 
  Search, 
  ShoppingCart, 
  Package, 
  User 
} from 'lucide-react';
import { useCart, useAuth } from '@/hooks';

const MobileNav: React.FC = () => {
  const location = useLocation();
  const { itemCount, toggleCart } = useCart();
  const { user } = useAuth();

  const navItems = [
    { path: '/', icon: Home, label: 'Shop' },
    { path: '/search', icon: Search, label: 'Search' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', count: itemCount },
    { path: '/orders', icon: Package, label: 'Orders' },
    { path: user ? '/profile' : '/auth', icon: User, label: user ? 'Account' : 'Sign In' },
  ];

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleCart(true);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-border md:hidden z-40">
      <div className="flex items-center justify-around h-full px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const isCart = item.path === '/cart';

          const content = (
            <div className="flex flex-col items-center">
              <div className="relative">
                <item.icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-amber' : 'text-muted'
                  }`} 
                />
                {item.count && item.count > 0 && (
                  <motion.span
                    key={item.count}
                    initial={{ scale: 0.5 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber rounded-full text-[10px] text-dark flex items-center justify-center font-medium"
                  >
                    {item.count > 9 ? '9+' : item.count}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] mt-1 transition-colors ${
                isActive ? 'text-amber font-medium' : 'text-muted'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 w-6 h-0.5 bg-amber rounded-full"
                />
              )}
            </div>
          );

          if (isCart) {
            return (
              <button
                key={item.path}
                onClick={handleCartClick}
                className="relative flex-1 flex items-center justify-center py-2"
                aria-label="Open cart"
              >
                {content}
              </button>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className="relative flex-1 flex items-center justify-center py-2"
            >
              {content}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default MobileNav;
