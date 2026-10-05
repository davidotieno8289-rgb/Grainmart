import { useState, useEffect, useCallback } from 'react';
import { supabase, isDemoMode } from '@/services/supabase';
import { Product, ProductCategory } from '@/types';

// Demo products for testing without Supabase
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    sellerId: 'seller-1',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Nakuru',
    sellerVerified: true,
    name: 'Premium White Maize',
    category: 'Maize',
    description: 'High-quality white maize grain, perfect for ugali. Freshly harvested from Nakuru highlands.',
    price: 55,
    minOrderKg: 50,
    stock: 2500,
    lowStockAlert: 100,
    emoji: '🌽',
    images: [],
    tags: ['organic', 'fresh', 'grade-a'],
    featured: true,
    rating: 4.8,
    reviewCount: 124,
    totalOrders: 340,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-2',
    sellerId: 'seller-2',
    sellerName: 'Rift Valley Grains',
    sellerLocation: 'Eldoret',
    sellerVerified: true,
    name: 'Red Sorghum',
    category: 'Sorghum',
    description: 'Traditional red sorghum ideal for porridge and brewing. Drought-resistant variety.',
    price: 45,
    minOrderKg: 25,
    stock: 1800,
    lowStockAlert: 50,
    emoji: '🌾',
    images: [],
    tags: ['traditional', 'drought-resistant'],
    featured: true,
    rating: 4.6,
    reviewCount: 89,
    totalOrders: 210,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-3',
    sellerId: 'seller-1',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Nakuru',
    sellerVerified: true,
    name: 'Finger Millet (Wimbi)',
    category: 'Millet',
    description: 'Nutritious finger millet for healthy porridge. Rich in calcium and iron.',
    price: 85,
    minOrderKg: 10,
    stock: 500,
    lowStockAlert: 50,
    emoji: '🌱',
    images: [],
    tags: ['nutritious', 'superfood', 'traditional'],
    featured: false,
    rating: 4.9,
    reviewCount: 67,
    totalOrders: 156,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-4',
    sellerId: 'seller-3',
    sellerName: 'Narok Highlands',
    sellerLocation: 'Narok',
    sellerVerified: false,
    name: 'Bread Wheat',
    category: 'Wheat',
    description: 'High-gluten bread wheat perfect for commercial baking. Clean and dry.',
    price: 65,
    minOrderKg: 100,
    stock: 5000,
    lowStockAlert: 200,
    emoji: '🌾',
    images: [],
    tags: ['commercial', 'bulk', 'baking'],
    featured: true,
    rating: 4.5,
    reviewCount: 45,
    totalOrders: 89,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-5',
    sellerId: 'seller-2',
    sellerName: 'Rift Valley Grains',
    sellerLocation: 'Eldoret',
    sellerVerified: true,
    name: 'Green Grams (Ndengu)',
    category: 'Legumes',
    description: 'Fresh green grams perfect for stews and sprouting. High protein content.',
    price: 120,
    minOrderKg: 5,
    stock: 800,
    lowStockAlert: 50,
    emoji: '🫘',
    images: [],
    tags: ['protein', 'legumes', 'healthy'],
    featured: false,
    rating: 4.7,
    reviewCount: 92,
    totalOrders: 234,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'demo-6',
    sellerId: 'seller-4',
    sellerName: 'Mwea Rice Mills',
    sellerLocation: 'Kirinyaga',
    sellerVerified: true,
    name: 'Pishori Rice',
    category: 'Rice',
    description: 'Premium Mwea pishori rice. Aromatic long-grain variety.',
    price: 180,
    minOrderKg: 10,
    stock: 3000,
    lowStockAlert: 100,
    emoji: '🍚',
    images: [],
    tags: ['premium', 'aromatic', 'long-grain'],
    featured: true,
    rating: 4.9,
    reviewCount: 156,
    totalOrders: 445,
    status: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface UseProductsOptions {
  category?: ProductCategory | 'All';
  sellerId?: string;
  featured?: boolean;
  limit?: number;
  searchQuery?: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

// Map database row to Product type
function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    sellerId: row.seller_id,
    sellerName: row.seller?.name || 'Unknown Seller',
    sellerLocation: row.seller?.location || row.seller?.county || '',
    sellerVerified: row.seller?.verified || false,
    name: row.name,
    category: row.category as ProductCategory,
    description: row.description || '',
    price: parseFloat(row.price),
    minOrderKg: parseFloat(row.min_order_kg),
    stock: parseFloat(row.stock),
    lowStockAlert: parseFloat(row.low_stock_alert),
    emoji: row.emoji || '🌾',
    images: row.images || [],
    tags: row.tags || [],
    featured: row.featured,
    rating: parseFloat(row.rating) || 0,
    reviewCount: row.review_count || 0,
    totalOrders: row.total_orders || 0,
    status: row.status,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { category = 'All', sellerId, featured, limit = 20, searchQuery } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchProducts = useCallback(async (reset = true) => {
    if (isDemoMode) {
      let filtered = [...DEMO_PRODUCTS];

      if (category && category !== 'All') {
        filtered = filtered.filter(p => p.category === category);
      }

      if (sellerId) {
        filtered = filtered.filter(p => p.sellerId === sellerId);
      }

      if (featured) {
        filtered = filtered.filter(p => p.featured);
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.tags.some(t => t.toLowerCase().includes(query))
        );
      }

      setProducts(filtered.slice(0, limit));
      setLoading(false);
      setHasMore(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentOffset = reset ? 0 : offset;

      let query = supabase
        .from('products')
        .select(`
          *,
          seller:users!seller_id (
            id,
            name,
            location,
            county,
            verified
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + limit - 1);

      if (category && category !== 'All') {
        query = query.eq('category', category);
      }

      if (sellerId) {
        query = query.eq('seller_id', sellerId);
      }

      if (featured) {
        query = query.eq('featured', true);
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      const mappedProducts = (data || []).map(mapDbProductToProduct);

      if (reset) {
        setProducts(mappedProducts);
        setOffset(limit);
      } else {
        setProducts(prev => [...prev, ...mappedProducts]);
        setOffset(prev => prev + limit);
      }

      setHasMore(mappedProducts.length === limit);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [category, sellerId, featured, limit, searchQuery, offset]);

  useEffect(() => {
    fetchProducts(true);
  }, [category, sellerId, featured, searchQuery]);

  const refetch = useCallback(() => fetchProducts(true), [fetchProducts]);
  const loadMore = useCallback(() => fetchProducts(false), [fetchProducts]);

  return { products, loading, error, refetch, loadMore, hasMore };
}

// Single product hook
export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setLoading(false);
      return;
    }

    if (isDemoMode) {
      const found = DEMO_PRODUCTS.find(p => p.id === productId);
      setProduct(found || null);
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      try {
        setLoading(true);

        const { data, error: fetchError } = await supabase
          .from('products')
          .select(`
            *,
            seller:users!seller_id (
              id,
              name,
              location,
              county,
              verified,
              rating
            )
          `)
          .eq('id', productId)
          .single();

        if (fetchError) throw fetchError;

        setProduct(mapDbProductToProduct(data));
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

export default useProducts;
