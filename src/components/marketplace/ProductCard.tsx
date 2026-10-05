import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Check, MapPin, Star } from 'lucide-react';
import { Product } from '@/types';
import { formatCurrency } from '@/utils';
import { useCart } from '@/hooks';
import { VerifiedBadge, FeaturedBadge, EscrowBadge } from '@/components/shared';

interface ProductCardProps {
  product: Product;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { addToCart, items } = useCart();
  const [added, setAdded] = React.useState(false);
  
  const isInCart = items.some(item => item.productId === product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInCart || added) return;
    
    addToCart({
      productId: product.id,
      productName: product.name,
      productEmoji: product.emoji,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      price: product.price,
      quantity: product.minOrderKg,
      stock: product.stock,
      minOrderKg: product.minOrderKg,
      image: product.images[0],
    });
    
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  // Gradient backgrounds for products without images
  const gradients = [
    'from-amber-200 to-amber-300',
    'from-green-200 to-green-300',
    'from-orange-200 to-orange-300',
    'from-yellow-200 to-yellow-300',
    'from-lime-200 to-lime-300',
  ];
  const gradient = gradients[index % gradients.length];

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group"
    >
      <Link 
        to={`/product/${product.id}`}
        className="block bg-white rounded-xl border border-border overflow-hidden transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 hover:border-amber"
      >
        {/* Image Container */}
        <div className={`relative h-40 bg-gradient-to-br ${gradient} overflow-hidden`}>
          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
            {product.featured && <FeaturedBadge />}
            {product.sellerVerified && <VerifiedBadge />}
          </div>
          
          {/* Product image or emoji */}
          <div className="absolute inset-0 flex items-center justify-center">
            {product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                loading="lazy"
              />
            ) : (
              <span className="text-6xl transition-transform duration-300 group-hover:scale-110">
                {product.emoji}
              </span>
            )}
          </div>
          
          {/* Stock warning */}
          {product.stock <= product.lowStockAlert && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-terra/90 text-white text-xs rounded-full">
              Low Stock
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Seller info */}
          <div className="flex items-center gap-1 text-xs text-muted mb-1">
            <span className="truncate">{product.sellerName}</span>
            <span>•</span>
            <MapPin className="w-3 h-3" />
            <span className="truncate">{product.sellerLocation}</span>
          </div>

          {/* Product name */}
          <h3 className="font-display font-semibold text-dark line-clamp-1 group-hover:text-amber transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1">
            <Star className="w-3.5 h-3.5 fill-amber text-amber" />
            <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
            <span className="text-xs text-muted">({product.reviewCount})</span>
          </div>

          {/* Price and add button */}
          <div className="flex items-center justify-between mt-3">
            <div>
              <p className="font-display font-semibold text-lg text-amber">
                {formatCurrency(product.price)}
                <span className="text-xs text-muted font-normal">/kg</span>
              </p>
              <p className="text-xs text-muted">
                Min {product.minOrderKg}kg • {product.stock}kg left
              </p>
            </div>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              disabled={product.stock <= 0}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center transition-all
                ${added || isInCart
                  ? 'bg-green text-white'
                  : 'bg-amber-pale text-amber hover:bg-amber hover:text-white'
                }
                ${product.stock <= 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              aria-label={added || isInCart ? 'Added to cart' : 'Add to cart'}
            >
              {added || isInCart ? (
                <Check className="w-5 h-5" />
              ) : (
                <Plus className="w-5 h-5" />
              )}
            </motion.button>
          </div>

          {/* Escrow badge */}
          <div className="mt-3 pt-3 border-t border-border">
            <EscrowBadge variant="inline" />
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export default ProductCard;
