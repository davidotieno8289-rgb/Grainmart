import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs, 
  doc, 
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  Timestamp,
  QueryConstraint,
  startAfter,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db, isDemoMode } from '@/services/firebase';
import { Product, ProductFilters } from '@/types';

// Demo products for testing without Firebase
const DEMO_PRODUCTS: Product[] = [
  {
    id: 'demo-1',
    name: 'White Maize (Grade A)',
    category: 'Maize',
    emoji: '🌽',
    description: 'Premium quality white maize grain, freshly harvested from the highlands of Kiambu. Perfect for ugali, flour making, or animal feed.',
    tags: ['Grade A', 'Freshly Harvested', 'Kiambu', 'Organic'],
    price: 120,
    minOrderKg: 1,
    stock: 450,
    lowStockAlert: 50,
    sellerId: 'seller-001',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Kiambu',
    sellerVerified: true,
    images: [],
    featured: true,
    rating: 4.8,
    reviewCount: 64,
    totalOrders: 189,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'demo-2',
    name: 'Red Sorghum (Mtama)',
    category: 'Sorghum',
    emoji: '🌿',
    description: 'Traditional red sorghum grain, perfect for making uji, busaa, and porridge. Grown organically in the Rift Valley region.',
    tags: ['Organic', 'Traditional', 'Rift Valley', 'Red'],
    price: 95,
    minOrderKg: 2,
    stock: 200,
    lowStockAlert: 30,
    sellerId: 'seller-003',
    sellerName: 'Kamau Agri Ltd',
    sellerLocation: 'Nakuru',
    sellerVerified: true,
    images: [],
    featured: true,
    rating: 4.9,
    reviewCount: 78,
    totalOrders: 234,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'demo-3',
    name: 'Finger Millet (Wimbi)',
    category: 'Millet',
    emoji: '🌾',
    description: 'Nutritious finger millet, a superfood packed with calcium, iron, and fiber. Excellent for traditional porridge and baby food.',
    tags: ['Superfood', 'High Fiber', 'Baby Food', 'Health'],
    price: 150,
    minOrderKg: 1,
    stock: 180,
    lowStockAlert: 25,
    sellerId: 'seller-001',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Kiambu',
    sellerVerified: true,
    images: [],
    featured: true,
    rating: 4.7,
    reviewCount: 45,
    totalOrders: 156,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'demo-4',
    name: 'Green Grams (Ndengu)',
    category: 'Legumes',
    emoji: '🫘',
    description: 'Fresh green grams, a protein-rich legume essential for Kenyan cuisine. Perfect for making githeri, soups, and sprouting.',
    tags: ['Protein Rich', 'Githeri', 'Fresh', 'Sproutable'],
    price: 180,
    minOrderKg: 1,
    stock: 120,
    lowStockAlert: 20,
    sellerId: 'seller-002',
    sellerName: 'Odhiambo Grains',
    sellerLocation: 'Kisumu',
    sellerVerified: true,
    images: [],
    featured: false,
    rating: 4.4,
    reviewCount: 28,
    totalOrders: 87,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'demo-5',
    name: 'Sunflower Seeds',
    category: 'Oil Seeds',
    emoji: '🌻',
    description: 'Premium sunflower seeds for oil extraction or healthy snacking. High oil content variety, perfect for cold-pressing.',
    tags: ['Oil Extraction', 'Snacking', 'High Oil', 'Organic'],
    price: 200,
    minOrderKg: 1,
    stock: 90,
    lowStockAlert: 15,
    sellerId: 'seller-004',
    sellerName: 'Aisha Coastal Traders',
    sellerLocation: 'Mombasa',
    sellerVerified: false,
    images: [],
    featured: true,
    rating: 4.2,
    reviewCount: 18,
    totalOrders: 42,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
  {
    id: 'demo-6',
    name: 'Pishori Rice',
    category: 'Rice',
    emoji: '🍚',
    description: 'Aromatic Pishori rice from the Mwea irrigation scheme. Known for its excellent taste and fluffy texture when cooked.',
    tags: ['Aromatic', 'Mwea', 'Premium', 'Fluffy'],
    price: 220,
    minOrderKg: 2,
    stock: 250,
    lowStockAlert: 30,
    sellerId: 'seller-001',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Kiambu',
    sellerVerified: true,
    images: [],
    featured: true,
    rating: 4.9,
    reviewCount: 89,
    totalOrders: 312,
    status: 'active',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  },
];

interface UseProductsOptions {
  filters?: ProductFilters;
  pageSize?: number;
  sellerId?: string;
  realtime?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useProducts(options: UseProductsOptions = {}): UseProductsReturn {
  const { filters = {}, pageSize = 20, sellerId, realtime = false } = options;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);

  // Demo mode: return demo products
  useEffect(() => {
    if (isDemoMode) {
      let filteredProducts = [...DEMO_PRODUCTS];
      
      // Apply filters
      if (sellerId) {
        filteredProducts = filteredProducts.filter(p => p.sellerId === sellerId);
      }
      if (filters.category && filters.category !== 'All') {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower)
        );
      }
      if (filters.priceMin !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.priceMin!);
      }
      if (filters.priceMax !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.priceMax!);
      }
      
      // Sort
      if (filters.sort === 'price_asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
      } else if (filters.sort === 'price_desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
      } else if (filters.sort === 'rating') {
        filteredProducts.sort((a, b) => b.rating - a.rating);
      }
      
      setProducts(filteredProducts);
      setLoading(false);
      setHasMore(false);
      return;
    }
  }, [isDemoMode, filters, sellerId]);

  const buildQuery = useCallback(() => {
    const constraints: QueryConstraint[] = [];
    
    // Seller filter
    if (sellerId) {
      constraints.push(where('sellerId', '==', sellerId));
    }
    
    // Category filter
    if (filters.category && filters.category !== 'All') {
      constraints.push(where('category', '==', filters.category));
    }
    
    // Stock filter
    if (filters.inStockOnly) {
      constraints.push(where('status', '==', 'active'));
    }
    
    // Featured filter
    if (filters.listingType === 'featured') {
      constraints.push(where('featured', '==', true));
    }
    
    // Verified sellers filter
    if (filters.sellerType === 'verified') {
      constraints.push(where('sellerVerified', '==', true));
    }
    
    // Rating filter
    if (filters.minRating) {
      constraints.push(where('rating', '>=', filters.minRating));
    }
    
    // Sort
    switch (filters.sort) {
      case 'price_asc':
        constraints.push(orderBy('price', 'asc'));
        break;
      case 'price_desc':
        constraints.push(orderBy('price', 'desc'));
        break;
      case 'rating':
        constraints.push(orderBy('rating', 'desc'));
        break;
      case 'newest':
        constraints.push(orderBy('createdAt', 'desc'));
        break;
      case 'orders':
        constraints.push(orderBy('totalOrders', 'desc'));
        break;
      case 'featured':
      default:
        constraints.push(orderBy('featured', 'desc'));
        constraints.push(orderBy('createdAt', 'desc'));
        break;
    }
    
    constraints.push(limit(pageSize));
    
    return query(collection(db, 'products'), ...constraints);
  }, [filters, pageSize, sellerId]);

  const fetchProducts = useCallback(async (reset = true) => {
    setLoading(true);
    setError(null);
    
    try {
      let q = buildQuery();
      
      if (!reset && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }
      
      const snapshot = await getDocs(q);
      const newProducts: Product[] = [];
      
      snapshot.forEach((doc) => {
        newProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      
      // Client-side filtering for price range and search
      let filteredProducts = newProducts;
      
      if (filters.priceMin !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price >= filters.priceMin!);
      }
      
      if (filters.priceMax !== undefined) {
        filteredProducts = filteredProducts.filter(p => p.price <= filters.priceMax!);
      }
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredProducts = filteredProducts.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.description.toLowerCase().includes(searchLower) ||
          p.sellerName.toLowerCase().includes(searchLower) ||
          p.tags.some(t => t.toLowerCase().includes(searchLower))
        );
      }
      
      if (reset) {
        setProducts(filteredProducts);
      } else {
        setProducts(prev => [...prev, ...filteredProducts]);
      }
      
      setHasMore(snapshot.docs.length === pageSize);
      setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [buildQuery, filters, lastDoc, pageSize]);

  useEffect(() => {
    if (isDemoMode) return; // Skip if in demo mode
    
    if (realtime) {
      const q = buildQuery();
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const newProducts: Product[] = [];
        snapshot.forEach((doc) => {
          newProducts.push({ id: doc.id, ...doc.data() } as Product);
        });
        setProducts(newProducts);
        setLoading(false);
      }, (err) => {
        setError(err.message);
        setLoading(false);
      });
      
      return () => unsubscribe();
    } else {
      fetchProducts(true);
    }
  }, [buildQuery, realtime]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadMore = async () => {
    if (isDemoMode || !hasMore || loading) return;
    await fetchProducts(false);
  };

  const refresh = async () => {
    if (isDemoMode) return;
    setLastDoc(null);
    await fetchProducts(true);
  };

  return { products, loading, error, hasMore, loadMore, refresh };
}

// Single product hook
export function useProduct(productId: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      setLoading(false);
      return;
    }
    
    // Demo mode: find from demo products
    if (isDemoMode) {
      const found = DEMO_PRODUCTS.find(p => p.id === productId);
      setProduct(found || null);
      setError(found ? null : 'Product not found');
      setLoading(false);
      return;
    }

    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const productRef = doc(db, 'products', productId);
        const productSnap = await getDoc(productRef);
        
        if (productSnap.exists()) {
          setProduct({ id: productSnap.id, ...productSnap.data() } as Product);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  return { product, loading, error };
}

// Seller products management
export function useSellerProducts(sellerId: string | undefined) {
  const { products, loading, error, refresh } = useProducts({ 
    sellerId, 
    realtime: true,
    pageSize: 100 
  });

  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = Timestamp.now();
      await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: now,
        updatedAt: now,
      });
      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to add product' };
    }
  };

  const updateProduct = async (productId: string, data: Partial<Product>) => {
    try {
      const productRef = doc(db, 'products', productId);
      await updateDoc(productRef, {
        ...data,
        updatedAt: Timestamp.now(),
      });
      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to update product' };
    }
  };

  const deleteProduct = async (productId: string) => {
    try {
      const productRef = doc(db, 'products', productId);
      await deleteDoc(productRef);
      await refresh();
      return { success: true };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Failed to delete product' };
    }
  };

  const updateStock = async (productId: string, newStock: number) => {
    const status = newStock <= 0 ? 'out_of_stock' : 'active';
    return updateProduct(productId, { stock: newStock, status });
  };

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    updateStock,
    refresh,
  };
}
