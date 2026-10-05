import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Filter, ChevronDown, Star } from 'lucide-react';
import { Category, ProductFilters } from '@/types';
import { CATEGORIES } from '@/constants';
import { formatCurrency } from '@/utils';
import { Button, Slider } from '@/components/ui';

interface FilterSidebarProps {
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  isOpen,
  onClose,
  isMobile = false,
}) => {
  const [expandedSections, setExpandedSections] = React.useState({
    category: true,
    price: true,
    seller: true,
    rating: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCategoryChange = (category: Category | 'All') => {
    onFilterChange({ ...filters, category });
  };

  const handlePriceChange = (value: [number, number]) => {
    onFilterChange({ ...filters, priceMin: value[0], priceMax: value[1] });
  };

  const handleSellerTypeChange = (type: 'all' | 'verified' | 'top') => {
    onFilterChange({ ...filters, sellerType: type });
  };

  const handleRatingChange = (rating: number | undefined) => {
    onFilterChange({ ...filters, minRating: rating });
  };

  const handleStockToggle = () => {
    onFilterChange({ ...filters, inStockOnly: !filters.inStockOnly });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = 
    filters.category !== 'All' ||
    filters.priceMin !== undefined ||
    filters.priceMax !== undefined ||
    filters.sellerType !== 'all' ||
    filters.minRating !== undefined ||
    filters.inStockOnly;

  const content = (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-amber" />
          <h2 className="font-display font-semibold text-lg">Filters</h2>
        </div>
        {isMobile && (
          <button onClick={onClose} className="p-2 hover:bg-cream rounded-lg">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Filter Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Category */}
        <div>
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="font-medium">Category</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.category ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.category && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden"
              >
                <label className="flex items-center gap-2 py-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="category"
                    checked={!filters.category || filters.category === 'All'}
                    onChange={() => handleCategoryChange('All')}
                    className="w-4 h-4 text-amber focus:ring-amber"
                  />
                  <span className="text-sm">All Categories</span>
                </label>
                {CATEGORIES.map((cat) => (
                  <label key={cat.name} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      checked={filters.category === cat.name}
                      onChange={() => handleCategoryChange(cat.name)}
                      className="w-4 h-4 text-amber focus:ring-amber"
                    />
                    <span className="text-sm">{cat.emoji} {cat.name}</span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range */}
        <div>
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="font-medium">Price per kg</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.price && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="pt-2 overflow-hidden"
              >
                <Slider
                  min={50}
                  max={1000}
                  step={10}
                  value={[filters.priceMin ?? 50, filters.priceMax ?? 1000]}
                  onChange={handlePriceChange}
                  formatLabel={(v) => formatCurrency(v)}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Seller Type */}
        <div>
          <button
            onClick={() => toggleSection('seller')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="font-medium">Seller Type</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.seller ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.seller && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden"
              >
                {[
                  { value: 'all', label: 'All Sellers' },
                  { value: 'verified', label: '✅ Verified Only' },
                  { value: 'top', label: '⭐ Top Sellers Only' },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="sellerType"
                      checked={(filters.sellerType ?? 'all') === option.value}
                      onChange={() => handleSellerTypeChange(option.value as 'all' | 'verified' | 'top')}
                      className="w-4 h-4 text-amber focus:ring-amber"
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Rating */}
        <div>
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full py-2 text-left"
          >
            <span className="font-medium">Minimum Rating</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${expandedSections.rating ? 'rotate-180' : ''}`} />
          </button>
          
          <AnimatePresence>
            {expandedSections.rating && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="space-y-1 overflow-hidden"
              >
                {[
                  { value: undefined, label: 'Any Rating' },
                  { value: 3, label: '3.0+ Stars' },
                  { value: 4, label: '4.0+ Stars' },
                  { value: 4.5, label: '4.5+ Stars' },
                ].map((option) => (
                  <label key={String(option.value)} className="flex items-center gap-2 py-1.5 cursor-pointer">
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.minRating === option.value}
                      onChange={() => handleRatingChange(option.value)}
                      className="w-4 h-4 text-amber focus:ring-amber"
                    />
                    <span className="text-sm flex items-center gap-1">
                      {option.value && <Star className="w-3.5 h-3.5 fill-amber text-amber" />}
                      {option.label}
                    </span>
                  </label>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* In Stock Only */}
        <label className="flex items-center gap-3 py-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStockOnly ?? false}
            onChange={handleStockToggle}
            className="w-4 h-4 rounded text-amber focus:ring-amber"
          />
          <span className="text-sm font-medium">In Stock Only</span>
        </label>
      </div>

      {/* Footer */}
      {hasActiveFilters && (
        <div className="p-4 border-t border-border">
          <Button variant="outline" fullWidth onClick={clearFilters}>
            Clear All Filters
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-dark/50 z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] z-50"
            >
              {content}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  return (
    <aside className="w-60 bg-white border border-border rounded-xl h-fit sticky top-20">
      {content}
    </aside>
  );
};

export default FilterSidebar;
