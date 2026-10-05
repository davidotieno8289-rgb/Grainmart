import { createClient, SupabaseClient, User as SupabaseUser, Session } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Demo mode when credentials are not configured
export const isDemoMode = !supabaseUrl || !supabaseAnonKey;

// Create Supabase client
export const supabase: SupabaseClient = isDemoMode
  ? createClient('https://demo.supabase.co', 'demo-key', {
      auth: { persistSession: false },
    })
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });

// Export types
export type { SupabaseUser, Session };

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          auth_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          role: 'buyer' | 'seller' | 'owner';
          avatar: string | null;
          location: string | null;
          county: string | null;
          verified: boolean;
          verification_status: 'none' | 'pending' | 'approved' | 'rejected';
          wallet_balance: number;
          pending_withdrawal: number;
          rating: number;
          total_sales: number;
          total_orders: number;
          total_spent: number;
          is_premium: boolean;
          suspended: boolean;
          created_at: string;
          updated_at: string;
          last_active: string;
        };
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          auth_id: string;
          name: string;
        };
        Update: Partial<Database['public']['Tables']['users']['Row']>;
      };
      products: {
        Row: {
          id: string;
          seller_id: string;
          name: string;
          category: string;
          description: string | null;
          price: number;
          min_order_kg: number;
          stock: number;
          low_stock_alert: number;
          emoji: string;
          images: string[];
          tags: string[];
          featured: boolean;
          status: 'active' | 'out_of_stock' | 'inactive' | 'deleted';
          rating: number;
          review_count: number;
          total_orders: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at' | 'rating' | 'review_count' | 'total_orders'>;
        Update: Partial<Database['public']['Tables']['products']['Row']>;
      };
      orders: {
        Row: {
          id: string;
          buyer_id: string;
          items: any[];
          subtotal: number;
          delivery_fee: number;
          platform_fee: number;
          total: number;
          delivery_address: {
            county: string;
            area: string;
            details: string;
            phone: string;
          };
          payment_method: 'mpesa' | 'card' | null;
          payment_status: string;
          order_status: string;
          escrow_status: string | null;
          mpesa_receipt: string | null;
          stripe_payment_id: string | null;
          dispute: any | null;
          notes: string | null;
          created_at: string;
          confirmed_at: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['orders']['Row']>;
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          text: string;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read'>;
        Update: Partial<Database['public']['Tables']['messages']['Row']>;
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          reviewer_id: string;
          order_id: string | null;
          rating: number;
          text: string | null;
          verified: boolean;
          helpful_count: number;
          images: string[];
          seller_response: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['reviews']['Row'], 'id' | 'created_at' | 'updated_at' | 'helpful_count' | 'verified'>;
        Update: Partial<Database['public']['Tables']['reviews']['Row']>;
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          body: string | null;
          data: any | null;
          read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'created_at' | 'read'>;
        Update: Partial<Database['public']['Tables']['notifications']['Row']>;
      };
    };
  };
}

// Helper to get current user's profile
export async function getCurrentUserProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  return data;
}

// Helper for auth state changes
export function onAuthStateChange(callback: (user: SupabaseUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user ?? null);
  });
}

console.log(`[Supabase] ${isDemoMode ? 'Running in DEMO mode' : 'Connected to Supabase'}`);

export default supabase;
