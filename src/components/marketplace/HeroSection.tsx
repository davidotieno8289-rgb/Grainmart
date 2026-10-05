import React from 'react';
import { motion } from 'framer-motion';
import { Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';

const HeroSection: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <section className="relative bg-gradient-to-br from-dark via-brown to-green overflow-hidden">
      {/* Grain texture overlay */}
      <div className="absolute inset-0 grain-texture opacity-30" />
      
      {/* Animated grain icons */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-20 left-[10%] text-6xl opacity-20"
        >
          🌽
        </motion.div>
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [0, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, delay: 0.5 }}
          className="absolute top-32 right-[15%] text-5xl opacity-20"
        >
          🌾
        </motion.div>
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
          className="absolute bottom-16 left-[20%] text-4xl opacity-20"
        >
          🫘
        </motion.div>
        <motion.div
          animate={{ y: [0, 8, 0], rotate: [0, 3, 0] }}
          transition={{ duration: 5.5, repeat: Infinity, delay: 1.5 }}
          className="absolute bottom-24 right-[25%] text-5xl opacity-20"
        >
          🌻
        </motion.div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-cream leading-tight"
          >
            Quality Grains,{' '}
            <span className="text-amber">Direct from Farmers</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mt-4 text-lg md:text-xl text-cream/80 max-w-lg"
          >
            Kenya's premier digital cereal marketplace. Shop with confidence 
            using escrow-protected payments and verified sellers.
          </motion.p>
          
          {/* Search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSearch}
            className="mt-8 flex gap-2"
          >
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for maize, sorghum, millet..."
                className="w-full pl-12 pr-4 py-4 bg-white/95 backdrop-blur-sm rounded-xl text-dark placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-amber"
              />
            </div>
            <Button type="submit" size="lg" rightIcon={<ArrowRight className="w-5 h-5" />}>
              Search
            </Button>
          </motion.form>
          
          {/* Quick stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-8 flex flex-wrap gap-6 text-cream/80"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-sm">500+ Verified Sellers</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span className="text-sm">Escrow Protected</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📱</span>
              <span className="text-sm">M-Pesa Enabled</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
