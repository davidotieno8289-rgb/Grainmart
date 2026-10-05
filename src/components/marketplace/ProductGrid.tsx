import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '@/components/shared';
import { Package } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
}

const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  error = null,
  emptyMessage = 'No products found',
}) => {
  if (loading) {
    return <ProductGridSkeleton count={8} />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-terra/10 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">⚠️</span>
        </div>
        <h3 className="font-display font-semibold text-lg text-dark mb-2">
          Something went wrong
        </h3>
        <p className="text-muted text-sm max-w-md">
          {error}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-amber-pale rounded-full flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-amber" />
        </div>
        <h3 className="font-display font-semibold text-lg text-dark mb-2">
          {emptyMessage}
        </h3>
        <p className="text-muted text-sm max-w-md">
          Try adjusting your filters or search terms to find what you're looking for.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product, index) => (
        <ProductCard key={product.id} product={product} index={index} />
      ))}
    </div>
  );
};

export default ProductGrid;
