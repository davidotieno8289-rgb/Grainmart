-- GrainMart Supabase Schema
-- Run this in the Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'owner')),
  avatar TEXT,
  location TEXT,
  county TEXT,
  verified BOOLEAN DEFAULT FALSE,
  verification_status TEXT DEFAULT 'none' CHECK (verification_status IN ('none', 'pending', 'approved', 'rejected')),
  wallet_balance DECIMAL(12, 2) DEFAULT 0,
  pending_withdrawal DECIMAL(12, 2) DEFAULT 0,
  rating DECIMAL(3, 2) DEFAULT 0,
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  total_spent DECIMAL(12, 2) DEFAULT 0,
  is_premium BOOLEAN DEFAULT FALSE,
  suspended BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_active TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PRODUCTS TABLE
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Maize', 'Sorghum', 'Millet', 'Wheat', 'Legumes', 'Oil Seeds', 'Rice', 'Barley')),
  description TEXT,
  price DECIMAL(10, 2) NOT NULL CHECK (price >= 10),
  min_order_kg DECIMAL(10, 2) NOT NULL CHECK (min_order_kg >= 1),
  stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  low_stock_alert DECIMAL(10, 2) DEFAULT 50,
  emoji TEXT DEFAULT '🌾',
  images TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  featured BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'out_of_stock', 'inactive', 'deleted')),
  rating DECIMAL(3, 2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES users(id),
  items JSONB NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) DEFAULT 0,
  platform_fee DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL,
  delivery_address JSONB NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('mpesa', 'card')),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'escrowed', 'released', 'refunded', 'failed')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  escrow_status TEXT CHECK (escrow_status IN ('held', 'released', 'refunded')),
  mpesa_receipt TEXT,
  stripe_payment_id TEXT,
  dispute JSONB,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_ids UUID[] NOT NULL,
  product_id UUID REFERENCES products(id),
  order_id TEXT REFERENCES orders(id),
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES users(id),
  order_id TEXT REFERENCES orders(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  verified BOOLEAN DEFAULT FALSE,
  helpful_count INTEGER DEFAULT 0,
  images TEXT[] DEFAULT '{}',
  seller_response TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(product_id, reviewer_id, order_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WITHDRAWALS TABLE
-- ============================================
CREATE TABLE withdrawals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id),
  amount DECIMAL(12, 2) NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  mpesa_reference TEXT,
  processed_by UUID REFERENCES users(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_featured ON products(featured) WHERE featured = TRUE;
CREATE INDEX idx_orders_buyer ON orders(buyer_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;

-- USERS policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = auth_id);

-- PRODUCTS policies
CREATE POLICY "Anyone can view active products" ON products FOR SELECT USING (status = 'active' OR seller_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Sellers can insert products" ON products FOR INSERT WITH CHECK (seller_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role IN ('seller', 'owner')));
CREATE POLICY "Sellers can update own products" ON products FOR UPDATE USING (seller_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Sellers can delete own products" ON products FOR DELETE USING (seller_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- ORDERS policies
CREATE POLICY "Buyers can view own orders" ON orders FOR SELECT USING (buyer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR EXISTS (SELECT 1 FROM jsonb_array_elements(items) AS item WHERE (item->>'sellerId')::uuid IN (SELECT id FROM users WHERE auth_id = auth.uid())));
CREATE POLICY "Buyers can create orders" ON orders FOR INSERT WITH CHECK (buyer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Participants can update orders" ON orders FOR UPDATE USING (buyer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR EXISTS (SELECT 1 FROM jsonb_array_elements(items) AS item WHERE (item->>'sellerId')::uuid IN (SELECT id FROM users WHERE auth_id = auth.uid())));

-- CONVERSATIONS policies
CREATE POLICY "Participants can view conversations" ON conversations FOR SELECT USING ((SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids));
CREATE POLICY "Users can create conversations" ON conversations FOR INSERT WITH CHECK ((SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids));

-- MESSAGES policies
CREATE POLICY "Participants can view messages" ON messages FOR SELECT USING (conversation_id IN (SELECT id FROM conversations WHERE (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids)));
CREATE POLICY "Participants can send messages" ON messages FOR INSERT WITH CHECK (sender_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) AND conversation_id IN (SELECT id FROM conversations WHERE (SELECT id FROM users WHERE auth_id = auth.uid()) = ANY(participant_ids)));

-- REVIEWS policies
CREATE POLICY "Anyone can view reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Buyers can create reviews" ON reviews FOR INSERT WITH CHECK (reviewer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Reviewers can update own reviews" ON reviews FOR UPDATE USING (reviewer_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- NOTIFICATIONS policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- WITHDRAWALS policies
CREATE POLICY "Sellers can view own withdrawals" ON withdrawals FOR SELECT USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));
CREATE POLICY "Sellers can request withdrawals" ON withdrawals FOR INSERT WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid() AND role IN ('seller', 'owner')));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update product rating when review is added
CREATE OR REPLACE FUNCTION update_product_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE products SET 
    rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id),
    review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id)
  WHERE id = NEW.product_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_rating_update AFTER INSERT OR UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_product_rating();

-- Create user profile on auth signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (auth_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
