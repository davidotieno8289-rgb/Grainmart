import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  ShoppingCart, 
  MapPin, 
  Bell, 
  User, 
  Menu, 
  X,
  LogOut,
  Settings,
  Package,
  LayoutDashboard,
  ChevronDown
} from 'lucide-react';
import { useAuth, useCart } from '@/hooks';
import { useNotifications } from '@/context';
import { Button } from '@/components/ui';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { itemCount, toggleCart } = useCart();
  const { unreadCount, toggleNotifications } = useNotifications();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-[68px] bg-dark z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <span className="text-2xl">🌾</span>
          <span className="font-display font-bold text-xl text-amber hidden sm:block">
            GrainMart
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search grains, sellers, locations..."
              className="w-full pl-10 pr-4 py-2.5 bg-brown/30 border border-brown/50 rounded-lg text-cream placeholder:text-muted/70 focus:outline-none focus:border-amber focus:ring-2 focus:ring-amber/20"
            />
          </div>
        </form>

        {/* Location Pill */}
        <button className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-brown/30 rounded-full text-cream text-sm hover:bg-brown/50 transition-colors">
          <MapPin className="w-4 h-4 text-amber" />
          <span>Nairobi</span>
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          {user && (
            <button
              onClick={() => toggleNotifications()}
              className="relative p-2 text-cream hover:text-amber transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-terra rounded-full text-xs text-white flex items-center justify-center font-medium"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              )}
            </button>
          )}

          {/* Cart */}
          <button
            onClick={() => toggleCart(true)}
            className="relative p-2 text-cream hover:text-amber transition-colors"
            aria-label="Shopping cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span
                key={itemCount}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-amber rounded-full text-xs text-dark flex items-center justify-center font-medium"
              >
                {itemCount > 9 ? '9+' : itemCount}
              </motion.span>
            )}
          </button>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-brown/30 transition-colors"
              >
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber flex items-center justify-center text-dark font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-modal overflow-hidden"
                  >
                    {/* User Info */}
                    <div className="p-4 bg-amber-pale border-b border-border">
                      <p className="font-display font-semibold text-dark">{user.name}</p>
                      <p className="text-sm text-muted">{user.email || user.phone}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-amber/10 text-amber text-xs font-medium rounded-full capitalize">
                        {user.role}
                      </span>
                    </div>

                    {/* Menu Items */}
                    <nav className="p-2">
                      {(user.role === 'seller' || user.role === 'owner') && (
                        <Link
                          to="/dashboard"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-3 py-2.5 text-dark hover:bg-cream rounded-lg transition-colors"
                        >
                          <LayoutDashboard className="w-5 h-5 text-muted" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <Link
                        to="/orders"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-dark hover:bg-cream rounded-lg transition-colors"
                      >
                        <Package className="w-5 h-5 text-muted" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-3 py-2.5 text-dark hover:bg-cream rounded-lg transition-colors"
                      >
                        <Settings className="w-5 h-5 text-muted" />
                        <span>Settings</span>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-terra hover:bg-terra/5 rounded-lg transition-colors"
                      >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                      </button>
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/auth">
                <Button variant="ghost" size="sm" className="text-cream hover:text-amber">
                  Sign In
                </Button>
              </Link>
              <Link to="/auth" className="hidden sm:block">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2 text-cream md:hidden"
            aria-label="Menu"
          >
            {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Search */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-brown px-4 py-3 border-t border-brown/50"
          >
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search grains, sellers..."
                  className="w-full pl-10 pr-4 py-2.5 bg-dark border border-brown rounded-lg text-cream placeholder:text-muted focus:outline-none focus:border-amber"
                />
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
