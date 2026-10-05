import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { CATEGORIES } from '@/constants';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark text-cream">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <span className="text-3xl">🌾</span>
              <span className="font-display font-bold text-2xl text-amber">GrainMart</span>
            </Link>
            <p className="text-muted text-sm mb-4">
              Kenya's premier digital cereal marketplace. Connecting farmers directly 
              to buyers with secure escrow-protected transactions.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="p-2 bg-brown/30 rounded-full hover:bg-amber hover:text-dark transition-colors" aria-label="Facebook">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-brown/30 rounded-full hover:bg-amber hover:text-dark transition-colors" aria-label="Twitter">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-brown/30 rounded-full hover:bg-amber hover:text-dark transition-colors" aria-label="Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 bg-brown/30 rounded-full hover:bg-amber hover:text-dark transition-colors" aria-label="LinkedIn">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Quick Links</h3>
            <nav className="space-y-2">
              <Link to="/" className="block text-muted hover:text-amber transition-colors text-sm">
                Marketplace
              </Link>
              <Link to="/sellers" className="block text-muted hover:text-amber transition-colors text-sm">
                Browse Sellers
              </Link>
              <Link to="/deals" className="block text-muted hover:text-amber transition-colors text-sm">
                Hot Deals
              </Link>
              <Link to="/track" className="block text-muted hover:text-amber transition-colors text-sm">
                Track Order
              </Link>
              <Link to="/become-seller" className="block text-muted hover:text-amber transition-colors text-sm">
                Become a Seller
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Categories</h3>
            <nav className="space-y-2">
              {CATEGORIES.slice(0, 6).map((category) => (
                <Link 
                  key={category.name}
                  to={`/?category=${category.name}`} 
                  className="block text-muted hover:text-amber transition-colors text-sm"
                >
                  <span className="mr-2">{category.emoji}</span>
                  {category.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display font-semibold text-lg mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a 
                href="tel:+254700000000" 
                className="flex items-center gap-3 text-muted hover:text-amber transition-colors text-sm"
              >
                <Phone className="w-4 h-4" />
                <span>+254 700 000 000</span>
              </a>
              <a 
                href="mailto:support@grainmart.co.ke" 
                className="flex items-center gap-3 text-muted hover:text-amber transition-colors text-sm"
              >
                <Mail className="w-4 h-4" />
                <span>support@grainmart.co.ke</span>
              </a>
              <div className="flex items-start gap-3 text-muted text-sm">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>Westlands Business Park,<br />Nairobi, Kenya</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Bar */}
      <div className="border-t border-brown/30">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted">
            <div className="flex items-center gap-2">
              <span className="text-green">🔒</span>
              <span>Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✅</span>
              <span>Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <span>📱</span>
              <span>M-Pesa Enabled</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🚚</span>
              <span>Nationwide Delivery</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-brown/30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted">
            <p>© {currentYear} GrainMart. All rights reserved.</p>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-amber transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="hover:text-amber transition-colors">
                Terms of Service
              </Link>
              <Link to="/faq" className="hover:text-amber transition-colors">
                FAQ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
