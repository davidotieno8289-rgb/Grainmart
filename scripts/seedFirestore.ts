/**
 * GrainMart Firestore Seed Script
 * Run with: npx ts-node scripts/seedFirestore.ts
 * 
 * Make sure to:
 * 1. Set up Firebase Admin SDK credentials
 * 2. Update the Firebase config below
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

// Initialize Firebase Admin (update path to your service account key)
// const serviceAccount = require('./serviceAccountKey.json');
// initializeApp({ credential: cert(serviceAccount) });
// const db = getFirestore();

// For demo purposes, this shows the data structure
// In production, you'd use the actual Firebase Admin SDK

const SEED_SELLERS = [
  {
    uid: 'seller-001',
    name: 'Wanjiku Farms',
    email: 'wanjiku@example.com',
    phone: '254712345001',
    role: 'seller',
    location: 'Kiambu Town',
    county: 'Kiambu',
    verified: true,
    verificationStatus: 'approved',
    rating: 4.8,
    totalSales: 342,
    walletBalance: 125000,
    isPremium: true,
  },
  {
    uid: 'seller-002',
    name: 'Odhiambo Grains',
    email: 'odhiambo@example.com',
    phone: '254712345002',
    role: 'seller',
    location: 'Kisumu Central',
    county: 'Kisumu',
    verified: true,
    verificationStatus: 'approved',
    rating: 4.6,
    totalSales: 218,
    walletBalance: 87500,
    isPremium: false,
  },
  {
    uid: 'seller-003',
    name: 'Kamau Agri Ltd',
    email: 'kamau@example.com',
    phone: '254712345003',
    role: 'seller',
    location: 'Nakuru CBD',
    county: 'Nakuru',
    verified: true,
    verificationStatus: 'approved',
    rating: 4.9,
    totalSales: 567,
    walletBalance: 230000,
    isPremium: true,
  },
  {
    uid: 'seller-004',
    name: 'Aisha Coastal Traders',
    email: 'aisha@example.com',
    phone: '254712345004',
    role: 'seller',
    location: 'Mombasa',
    county: 'Mombasa',
    verified: false,
    verificationStatus: 'pending',
    rating: 4.3,
    totalSales: 45,
    walletBalance: 15000,
    isPremium: false,
  },
  {
    uid: 'seller-005',
    name: 'GrainMaster KE',
    email: 'admin@grainmart.co.ke',
    phone: '254712345000',
    role: 'owner',
    location: 'Eldoret',
    county: 'Uasin Gishu',
    verified: true,
    verificationStatus: 'approved',
    rating: 4.7,
    totalSales: 890,
    walletBalance: 450000,
    isPremium: true,
  },
];

const SEED_PRODUCTS = [
  {
    name: 'White Maize (Grade A)',
    category: 'Maize',
    emoji: '🌽',
    description: 'Premium quality white maize grain, freshly harvested from the highlands of Kiambu. Perfect for ugali, flour making, or animal feed. Carefully dried and sorted to ensure zero moisture damage.',
    tags: ['Grade A', 'Freshly Harvested', 'Kiambu', 'Organic'],
    price: 120,
    minOrderKg: 1,
    stock: 450,
    lowStockAlert: 50,
    sellerId: 'seller-001',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Kiambu',
    sellerVerified: true,
    featured: true,
    rating: 4.8,
    reviewCount: 64,
    totalOrders: 189,
    status: 'active',
  },
  {
    name: 'Yellow Maize',
    category: 'Maize',
    emoji: '🌽',
    description: 'High-quality yellow maize, ideal for animal feed and industrial processing. Rich in nutrients and carefully stored to maintain freshness.',
    tags: ['Animal Feed', 'Industrial', 'Bulk Available'],
    price: 110,
    minOrderKg: 5,
    stock: 800,
    lowStockAlert: 100,
    sellerId: 'seller-002',
    sellerName: 'Odhiambo Grains',
    sellerLocation: 'Kisumu',
    sellerVerified: true,
    featured: false,
    rating: 4.5,
    reviewCount: 32,
    totalOrders: 95,
    status: 'active',
  },
  {
    name: 'Red Sorghum (Mtama)',
    category: 'Sorghum',
    emoji: '🌿',
    description: 'Traditional red sorghum grain, perfect for making uji, busaa, and porridge. Grown organically in the Rift Valley region with no pesticides.',
    tags: ['Organic', 'Traditional', 'Rift Valley', 'Red'],
    price: 95,
    minOrderKg: 2,
    stock: 200,
    lowStockAlert: 30,
    sellerId: 'seller-003',
    sellerName: 'Kamau Agri Ltd',
    sellerLocation: 'Nakuru',
    sellerVerified: true,
    featured: true,
    rating: 4.9,
    reviewCount: 78,
    totalOrders: 234,
    status: 'active',
  },
  {
    name: 'Finger Millet (Wimbi)',
    category: 'Millet',
    emoji: '🌾',
    description: 'Nutritious finger millet, a superfood packed with calcium, iron, and fiber. Excellent for making traditional porridge, baby food, and health drinks.',
    tags: ['Superfood', 'High Fiber', 'Baby Food', 'Health'],
    price: 150,
    minOrderKg: 1,
    stock: 180,
    lowStockAlert: 25,
    sellerId: 'seller-001',
    sellerName: 'Wanjiku Farms',
    sellerLocation: 'Kiambu',
    sellerVerified: true,
    featured: true,
    rating: 4.7,
    reviewCount: 45,
    totalOrders: 156,
    status: 'active',
  },
  {
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
    featured: false,
    rating: 4.4,
    reviewCount: 28,
    totalOrders: 87,
    status: 'active',
  },
  {
    name: 'Wheat Grain',
    category: 'Wheat',
    emoji: '🌾',
    description: 'High-quality wheat grain suitable for milling into flour. Grown in the fertile highlands of Narok with optimal moisture content.',
    tags: ['Flour Grade', 'Narok', 'Premium', 'Mill Ready'],
    price: 85,
    minOrderKg: 5,
    stock: 1200,
    lowStockAlert: 150,
    sellerId: 'seller-003',
    sellerName: 'Kamau Agri Ltd',
    sellerLocation: 'Nakuru',
    sellerVerified: true,
    featured: false,
    rating: 4.6,
    reviewCount: 52,
    totalOrders: 178,
    status: 'active',
  },
  {
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
    featured: true,
    rating: 4.2,
    reviewCount: 18,
    totalOrders: 42,
    status: 'active',
  },
  {
    name: 'Cowpeas (Kunde)',
    category: 'Legumes',
    emoji: '🫘',
    description: 'Traditional cowpeas, a staple in Kenyan households. Rich in protein and fiber, perfect for side dishes and mixed with cereals.',
    tags: ['Traditional', 'Protein', 'Side Dish', 'Fiber Rich'],
    price: 160,
    minOrderKg: 1,
    stock: 65,
    lowStockAlert: 10,
    sellerId: 'seller-005',
    sellerName: 'GrainMaster KE',
    sellerLocation: 'Eldoret',
    sellerVerified: true,
    featured: false,
    rating: 4.5,
    reviewCount: 22,
    totalOrders: 56,
    status: 'active',
  },
  {
    name: 'Brown Sorghum',
    category: 'Sorghum',
    emoji: '🌿',
    description: 'Versatile brown sorghum, excellent for brewing traditional beverages and making flour. Drought-resistant variety.',
    tags: ['Brewing', 'Flour', 'Drought Resistant', 'Traditional'],
    price: 100,
    minOrderKg: 2,
    stock: 300,
    lowStockAlert: 40,
    sellerId: 'seller-003',
    sellerName: 'Kamau Agri Ltd',
    sellerLocation: 'Nakuru',
    sellerVerified: true,
    featured: false,
    rating: 4.3,
    reviewCount: 15,
    totalOrders: 38,
    status: 'active',
  },
  {
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
    featured: true,
    rating: 4.9,
    reviewCount: 89,
    totalOrders: 312,
    status: 'active',
  },
];

// Function to seed the database
async function seedDatabase() {
  console.log('🌾 Starting GrainMart database seed...\n');

  // This is a placeholder - in production, you'd use Firebase Admin SDK
  console.log('Sellers to create:');
  SEED_SELLERS.forEach((seller, i) => {
    console.log(`  ${i + 1}. ${seller.name} (${seller.role}) - ${seller.county}`);
  });

  console.log('\nProducts to create:');
  SEED_PRODUCTS.forEach((product, i) => {
    console.log(`  ${i + 1}. ${product.emoji} ${product.name} - KSh ${product.price}/kg`);
  });

  console.log('\n✅ Seed data prepared. Use Firebase Admin SDK to write to Firestore.');
  console.log('   See: https://firebase.google.com/docs/admin/setup');
}

// Export data for use in other scripts
export { SEED_SELLERS, SEED_PRODUCTS };

// Run if called directly
seedDatabase();
