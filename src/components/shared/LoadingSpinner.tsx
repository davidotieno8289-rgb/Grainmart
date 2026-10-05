import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'amber' | 'green' | 'white';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  color = 'amber',
  text,
}) => {
  const sizes = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const colors = {
    amber: 'border-amber',
    green: 'border-green',
    white: 'border-white',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className={`${sizes[size]} border-2 border-t-transparent rounded-full ${colors[color]}`}
      />
      {text && (
        <p className="text-sm text-muted">{text}</p>
      )}
    </div>
  );
};

// Full page loading state
export const PageLoader: React.FC<{ text?: string }> = ({ text = 'Loading...' }) => (
  <div className="fixed inset-0 bg-cream flex items-center justify-center z-50">
    <div className="text-center">
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-5xl mb-4"
      >
        🌾
      </motion.div>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-muted font-medium">{text}</p>
    </div>
  </div>
);

// Skeleton loader for cards
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl border border-border overflow-hidden">
    <div className="h-40 skeleton" />
    <div className="p-4 space-y-3">
      <div className="h-3 w-1/3 skeleton rounded" />
      <div className="h-5 w-3/4 skeleton rounded" />
      <div className="h-3 w-1/2 skeleton rounded" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 w-20 skeleton rounded" />
        <div className="h-8 w-8 skeleton rounded-full" />
      </div>
    </div>
  </div>
);

// Skeleton loader for text
export const TextSkeleton: React.FC<{ width?: string; height?: string }> = ({ 
  width = '100%', 
  height = '1rem' 
}) => (
  <div className="skeleton rounded" style={{ width, height }} />
);

// Skeleton loader for product grid
export const ProductGridSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => (
  <div className="product-grid">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export default LoadingSpinner;
