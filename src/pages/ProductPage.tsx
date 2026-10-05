import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ChevronRight, 
  MapPin, 
  Star, 
  Minus, 
  Plus, 
  ShoppingCart, 
  Zap,
  Package,
  Shield,
  RotateCcw,
  MessageCircle
} from 'lucide-react';
import { useProduct, useCart } from '@/hooks';
import { formatCurrency } from '@/utils';
import { Button } from '@/components/ui';
import { 
  StarRating, 
  VerifiedBadge, 
  EscrowBadge, 
  PageLoader 
} from '@/components/shared';
import { CONFIG } from '@/constants';

const ProductPage: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const { product, loading, error } = useProduct(productId);
  const { addToCart, items } = useCart();
  
  const [quantity, setQuantity] = React.useState(1);
  const [activeTab, setActiveTab] = React.useState('description');
  
  const isInCart = items.some(item => item.productId === productId);

  React.useEffect(() => {
    if (product) {
      setQuantity(product.minOrderKg);
    }
  }, [product]);

  if (loading) {
    return <PageLoader text="Loading product..." />;
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <span className="text-6xl mb-4 block">😕</span>
          <h1 className="font-display text-2xl font-semibold mb-2">Product Not Found</h1>
          <p className="text-muted mb-4">{error || 'This product may have been removed.'}</p>
          <Link to="/">
            <Button>Back to Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta;
    if (newQty >= product.minOrderKg && newQty <= product.stock) {
      setQuantity(newQty);
    }
  };

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      productName: product.name,
      productEmoji: product.emoji,
      sellerId: product.sellerId,
      sellerName: product.sellerName,
      price: product.price,
      quantity,
      stock: product.stock,
      minOrderKg: product.minOrderKg,
      image: product.images[0],
    });
  };

  const itemTotal = product.price * quantity;

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted mb-6">
          <Link to="/" className="hover:text-amber">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/?category=${product.category}`} className="hover:text-amber">
            {product.category}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-dark">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Product Images */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl aspect-square flex items-center justify-center overflow-hidden">
              {product.images[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-9xl">{product.emoji}</span>
              )}
            </div>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.slice(0, 5).map((img, i) => (
                  <div
                    key={i}
                    className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border hover:border-amber cursor-pointer"
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Right: Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Seller Card */}
            <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-pale rounded-full flex items-center justify-center text-xl">
                  {product.sellerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{product.sellerName}</p>
                    {product.sellerVerified && <VerifiedBadge />}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Star className="w-3.5 h-3.5 fill-amber text-amber" />
                    <span>{product.rating.toFixed(1)}</span>
                    <span>•</span>
                    <span>{product.totalOrders} sales</span>
                    <span>•</span>
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{product.sellerLocation}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" leftIcon={<MessageCircle className="w-4 h-4" />}>
                Chat
              </Button>
            </div>

            {/* Product Title */}
            <div>
              <h1 className="font-display text-3xl font-bold text-dark">
                {product.name}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="px-2 py-0.5 bg-amber-pale text-amber text-sm rounded-full">
                  {product.category}
                </span>
                <StarRating rating={product.rating} showValue reviewCount={product.reviewCount} />
              </div>
            </div>

            {/* Price Box */}
            <div className="p-6 bg-white rounded-xl border border-border">
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-amber">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-muted">/kg</span>
              </div>
              <p className="text-sm text-muted mt-1">
                Min order: {product.minOrderKg}kg ({formatCurrency(product.price * product.minOrderKg)})
              </p>

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mt-6">
                <span className="text-sm font-medium">Quantity (kg):</span>
                <div className="flex items-center border border-border rounded-lg overflow-hidden">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= product.minOrderKg}
                    className="w-10 h-10 flex items-center justify-center bg-cream hover:bg-amber-pale disabled:opacity-50 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      if (val >= product.minOrderKg && val <= product.stock) {
                        setQuantity(val);
                      }
                    }}
                    className="w-16 text-center border-x border-border focus:outline-none"
                  />
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock}
                    className="w-10 h-10 flex items-center justify-center bg-cream hover:bg-amber-pale disabled:opacity-50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-sm text-muted">
                  {product.stock}kg available
                </span>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                <span className="font-medium">Total:</span>
                <span className="font-display text-2xl font-bold text-amber">
                  {formatCurrency(itemTotal)}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  fullWidth
                  leftIcon={<ShoppingCart className="w-5 h-5" />}
                  onClick={handleAddToCart}
                  disabled={isInCart || product.stock <= 0}
                >
                  {isInCart ? 'In Cart' : 'Add to Cart'}
                </Button>
                <Button
                  variant="success"
                  fullWidth
                  leftIcon={<Zap className="w-5 h-5" />}
                  disabled={product.stock <= 0}
                >
                  Buy Now
                </Button>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-border text-center">
                <Package className="w-5 h-5 text-amber mb-1" />
                <span className="text-xs text-muted">2-3 days delivery</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-border text-center">
                <Shield className="w-5 h-5 text-green mb-1" />
                <span className="text-xs text-muted">Escrow protected</span>
              </div>
              <div className="flex flex-col items-center p-3 bg-white rounded-lg border border-border text-center">
                <RotateCcw className="w-5 h-5 text-amber mb-1" />
                <span className="text-xs text-muted">24hr dispute window</span>
              </div>
            </div>

            {/* Escrow Info */}
            <EscrowBadge variant="full" />
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-12">
          <div className="flex gap-1 border-b border-border">
            {['description', 'reviews', 'seller'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 font-medium capitalize transition-colors ${
                  activeTab === tab
                    ? 'text-amber border-b-2 border-amber'
                    : 'text-muted hover:text-dark'
                }`}
              >
                {tab === 'reviews' ? `Reviews (${product.reviewCount})` : tab}
              </button>
            ))}
          </div>

          <div className="py-6">
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                <p className="text-dark">{product.description}</p>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-4">
                    {product.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-amber-pale text-amber text-sm rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="text-center py-8 text-muted">
                Reviews will be displayed here
              </div>
            )}
            {activeTab === 'seller' && (
              <div className="text-center py-8 text-muted">
                Seller profile and other listings will be displayed here
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
