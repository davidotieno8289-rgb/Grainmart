import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Grid, Map, Star, Package, BadgeCheck, Search, Filter, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import SellerMap, { SellerLocation } from '../components/shared/SellerMap';

// Demo sellers data - in production, this would come from Supabase
const DEMO_SELLERS: SellerLocation[] = [
  {
    id: 'seller-1',
    name: 'Kamau Farms',
    lat: -1.2864,
    lng: 36.8172,
    rating: 4.8,
    reviewCount: 156,
    productCount: 12,
    verified: true,
    phone: '+254712345678',
    location: 'Westlands, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
  },
  {
    id: 'seller-2',
    name: 'Njeri Grains',
    lat: -1.3031,
    lng: 36.7073,
    rating: 4.5,
    reviewCount: 89,
    productCount: 8,
    verified: true,
    phone: '+254723456789',
    location: 'Karen, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
  },
  {
    id: 'seller-3',
    name: 'Otieno Cereals',
    lat: -1.2634,
    lng: 36.8095,
    rating: 4.2,
    reviewCount: 42,
    productCount: 5,
    verified: false,
    phone: '+254734567890',
    location: 'Parklands, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
  },
  {
    id: 'seller-4',
    name: 'Mwangi Harvest',
    lat: -1.3197,
    lng: 36.8277,
    rating: 4.9,
    reviewCount: 203,
    productCount: 15,
    verified: true,
    phone: '+254745678901',
    location: 'South B, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/men/4.jpg',
  },
  {
    id: 'seller-5',
    name: 'Wanjiku Mills',
    lat: -1.2456,
    lng: 36.8912,
    rating: 4.1,
    reviewCount: 28,
    productCount: 4,
    verified: false,
    phone: '+254756789012',
    location: 'Kasarani, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/women/5.jpg',
  },
  {
    id: 'seller-6',
    name: 'Ochieng Traders',
    lat: -1.2983,
    lng: 36.7890,
    rating: 4.7,
    reviewCount: 112,
    productCount: 9,
    verified: true,
    phone: '+254767890123',
    location: 'Lavington, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/men/6.jpg',
  },
  {
    id: 'seller-7',
    name: 'Akinyi Fresh Grains',
    lat: -1.2567,
    lng: 36.8234,
    rating: 4.6,
    reviewCount: 78,
    productCount: 7,
    verified: true,
    phone: '+254778901234',
    location: 'Eastleigh, Nairobi',
    avatar: 'https://randomuser.me/api/portraits/women/7.jpg',
  },
  {
    id: 'seller-8',
    name: 'Kipchoge Farm Supply',
    lat: -0.0917,
    lng: 34.7680,
    rating: 4.4,
    reviewCount: 65,
    productCount: 11,
    verified: true,
    phone: '+254789012345',
    location: 'Kisumu',
  },
  {
    id: 'seller-9',
    name: 'Mombasa Grain Co.',
    lat: -4.0435,
    lng: 39.6682,
    rating: 4.3,
    reviewCount: 94,
    productCount: 14,
    verified: true,
    phone: '+254790123456',
    location: 'Mombasa',
  },
  {
    id: 'seller-10',
    name: 'Highland Cereals',
    lat: -0.2827,
    lng: 36.0660,
    rating: 4.8,
    reviewCount: 145,
    productCount: 10,
    verified: true,
    phone: '+254701234567',
    location: 'Nakuru',
  },
];

type ViewMode = 'map' | 'grid';

export default function SellersPage() {
  const [sellers, setSellers] = useState<SellerLocation[]>(DEMO_SELLERS);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<SellerLocation | null>(null);
  
  // Filter sellers
  const filteredSellers = sellers.filter(seller => {
    const matchesSearch = seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          seller.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVerified = !showVerifiedOnly || seller.verified;
    return matchesSearch && matchesVerified;
  });
  
  const handleSellerClick = (seller: SellerLocation) => {
    setSelectedSeller(seller);
  };
  
  return (
    <div className="page-container bg-cream min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-bold text-dark mb-2">
            Find Sellers Near You
          </h1>
          <p className="text-muted text-lg">
            Browse verified grain sellers across Kenya
          </p>
        </motion.div>
        
        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sellers by name or location..."
              className="w-full pl-11 pr-10 py-3 bg-white border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber focus:border-transparent text-dark placeholder:text-muted"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          
          {/* Verified Filter */}
          <button
            onClick={() => setShowVerifiedOnly(!showVerifiedOnly)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium transition-colors ${
              showVerifiedOnly
                ? 'bg-green text-white'
                : 'bg-white border border-border text-dark hover:bg-cream'
            }`}
          >
            <BadgeCheck className="w-5 h-5" />
            <span>Verified Only</span>
          </button>
          
          {/* View Toggle */}
          <div className="flex bg-white rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => setViewMode('map')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                viewMode === 'map'
                  ? 'bg-amber text-white'
                  : 'text-muted hover:bg-cream'
              }`}
            >
              <Map className="w-5 h-5" />
              <span className="hidden sm:inline">Map</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-amber text-white'
                  : 'text-muted hover:bg-cream'
              }`}
            >
              <Grid className="w-5 h-5" />
              <span className="hidden sm:inline">Grid</span>
            </button>
          </div>
        </motion.div>
        
        {/* Results count */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-sm text-muted mb-4"
        >
          Showing {filteredSellers.length} seller{filteredSellers.length !== 1 ? 's' : ''}
          {showVerifiedOnly && ' (verified only)'}
        </motion.p>
        
        {/* Map View */}
        {viewMode === 'map' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <SellerMap
              sellers={filteredSellers}
              onSellerClick={handleSellerClick}
              height="600px"
              className="mb-8"
            />
          </motion.div>
        )}
        
        {/* Grid View */}
        {viewMode === 'grid' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSellers.map((seller, index) => (
              <motion.div
                key={seller.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border border-border p-5 hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer"
                onClick={() => handleSellerClick(seller)}
              >
                <div className="flex items-start gap-4 mb-4">
                  {seller.avatar ? (
                    <img
                      src={seller.avatar}
                      alt={seller.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-amber-pale flex items-center justify-center">
                      <span className="text-amber font-bold text-2xl">
                        {seller.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-display font-semibold text-lg text-dark truncate">
                        {seller.name}
                      </h3>
                      {seller.verified && (
                        <BadgeCheck className="w-5 h-5 text-green flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{seller.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-amber fill-amber" />
                    <span className="font-semibold text-dark">{seller.rating}</span>
                    <span className="text-muted">({seller.reviewCount})</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted">
                    <Package className="w-4 h-4" />
                    <span>{seller.productCount} products</span>
                  </div>
                </div>
                
                <Link
                  to={`/seller/${seller.id}`}
                  className="block w-full py-2.5 bg-amber text-white text-center rounded-lg font-medium hover:bg-amber-light transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  View Shop
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        {/* Empty state */}
        {filteredSellers.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-20 h-20 bg-amber-pale rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-10 h-10 text-amber" />
            </div>
            <h3 className="font-display text-xl font-semibold text-dark mb-2">
              No sellers found
            </h3>
            <p className="text-muted mb-4">
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setShowVerifiedOnly(false);
              }}
              className="px-6 py-2.5 bg-amber text-white rounded-lg font-medium hover:bg-amber-light transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
