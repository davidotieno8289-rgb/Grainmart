import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal } from 'lucide-react';
import { HeroSection, TrustBar, ProductGrid, FilterSidebar, SearchBar } from '@/components/marketplace';
import { useProducts } from '@/hooks';
import { ProductFilters } from '@/types';
import { Button } from '@/components/ui';

const HomePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category');
  
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<ProductFilters>({
    search: searchQuery,
    category: categoryParam as ProductFilters['category'] || 'All',
    sort: 'featured',
  });

  const { products, loading, error, hasMore, loadMore } = useProducts({ filters });

  React.useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      category: categoryParam as ProductFilters['category'] || prev.category,
    }));
  }, [searchQuery, categoryParam]);

  const handleFilterChange = (newFilters: ProductFilters) => {
    setFilters(newFilters);
  };

  const handleSortChange = (sort: ProductFilters['sort']) => {
    setFilters(prev => ({ ...prev, sort }));
  };

  const showHero = !searchQuery && !categoryParam;

  return (
    <div className="min-h-screen bg-cream">
      {/* Hero Section - only show if not searching */}
      {showHero && <HeroSection />}
      
      {/* Trust Bar */}
      <TrustBar />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Top Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display text-2xl font-semibold text-dark">
              {searchQuery 
                ? `Results for "${searchQuery}"` 
                : categoryParam 
                  ? categoryParam 
                  : 'All Products'}
            </h2>
            <p className="text-muted text-sm mt-1">
              {products.length} products available
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile filter button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(true)}
              className="md:hidden"
              leftIcon={<Filter className="w-4 h-4" />}
            >
              Filters
            </Button>

            {/* Sort dropdown */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted" />
              <select
                value={filters.sort || 'featured'}
                onChange={(e) => handleSortChange(e.target.value as ProductFilters['sort'])}
                className="border border-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-amber"
              >
                <option value="featured">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="newest">Newest</option>
                <option value="orders">Most Ordered</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {(filters.category && filters.category !== 'All') || filters.priceMin || filters.priceMax || filters.inStockOnly ? (
          <div className="flex flex-wrap gap-2 mb-4">
            {filters.category && filters.category !== 'All' && (
              <span className="px-3 py-1 bg-amber-pale text-amber text-sm rounded-full flex items-center gap-1">
                {filters.category}
                <button onClick={() => handleFilterChange({ ...filters, category: 'All' })} className="ml-1 hover:text-dark">×</button>
              </span>
            )}
            {(filters.priceMin || filters.priceMax) && (
              <span className="px-3 py-1 bg-amber-pale text-amber text-sm rounded-full flex items-center gap-1">
                KSh {filters.priceMin || 0} - {filters.priceMax || '∞'}
                <button onClick={() => handleFilterChange({ ...filters, priceMin: undefined, priceMax: undefined })} className="ml-1 hover:text-dark">×</button>
              </span>
            )}
            {filters.inStockOnly && (
              <span className="px-3 py-1 bg-green-pale text-green text-sm rounded-full flex items-center gap-1">
                In Stock
                <button onClick={() => handleFilterChange({ ...filters, inStockOnly: false })} className="ml-1 hover:text-dark">×</button>
              </span>
            )}
          </div>
        ) : null}

        {/* Content Grid */}
        <div className="flex gap-6">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <FilterSidebar
              filters={filters}
              onFilterChange={handleFilterChange}
              isOpen={true}
              onClose={() => {}}
            />
          </div>

          {/* Products */}
          <div className="flex-1">
            <ProductGrid
              products={products}
              loading={loading}
              error={error}
              emptyMessage={searchQuery ? `No results for "${searchQuery}"` : 'No products available'}
            />

            {/* Load More */}
            {hasMore && products.length > 0 && (
              <div className="text-center mt-8">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  loading={loading}
                >
                  Load More Products
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Mobile Filter Sheet */}
      <FilterSidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        isMobile
      />
    </div>
  );
};

export default HomePage;
