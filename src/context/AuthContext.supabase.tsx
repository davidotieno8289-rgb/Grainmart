import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { supabase, isDemoMode, SupabaseUser } from '@/services/supabase';
import { updateApiToken } from '@/services/api';
import { User, UserRole, VerificationStatus } from '@/types';
import toast from 'react-hot-toast';

// Demo user for testing without Supabase
const DEMO_USER: User = {
  uid: 'demo-user-001',
  name: 'Demo User',
  email: 'demo@grainmart.co.ke',
  phone: '254712345678',
  role: 'buyer',
  location: 'Nairobi',
  county: 'Nairobi',
  verified: false,
  verificationStatus: 'none',
  joinedAt: new Date(),
  lastActive: new Date(),
  walletBalance: 0,
  rating: 0,
  totalSales: 0,
  isPremium: false,
};

// Auth State
interface AuthState {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: string | null;
  isDemoMode: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; supabaseUser: SupabaseUser | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SIGN_OUT' };

// Initial State
const initialState: AuthState = {
  user: null,
  supabaseUser: null,
  loading: true,
  error: null,
  isDemoMode,
};

// Reducer
function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload.user,
        supabaseUser: action.payload.supabaseUser,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_USER':
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      };
    case 'SIGN_OUT':
      return { ...initialState, loading: false };
    default:
      return state;
  }
}

// Context
interface AuthContextType extends AuthState {
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUpWithEmail: (name: string, email: string, password: string, phone: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole, inviteCode?: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Map Supabase user data to app User type
function mapSupabaseUserToUser(profile: any): User {
  return {
    uid: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role as UserRole,
    avatar: profile.avatar,
    location: profile.location,
    county: profile.county,
    verified: profile.verified,
    verificationStatus: profile.verification_status as VerificationStatus,
    joinedAt: new Date(profile.created_at),
    lastActive: new Date(profile.last_active),
    walletBalance: parseFloat(profile.wallet_balance) || 0,
    rating: parseFloat(profile.rating) || 0,
    totalSales: parseFloat(profile.total_sales) || 0,
    isPremium: profile.is_premium,
  };
}

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fetch user profile from Supabase
  const fetchUserProfile = async (supabaseUser: SupabaseUser): Promise<User | null> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', supabaseUser.id)
      .single();

    if (error || !data) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return mapSupabaseUserToUser(data);
  };

  // Listen for auth state changes
  useEffect(() => {
    if (isDemoMode) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const token = session.access_token;
        updateApiToken(token);

        const user = await fetchUserProfile(session.user);
        dispatch({
          type: 'SET_USER',
          payload: { user, supabaseUser: session.user },
        });
      } else {
        dispatch({ type: 'SET_USER', payload: { user: null, supabaseUser: null } });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const token = session.access_token;
          updateApiToken(token);

          const user = await fetchUserProfile(session.user);
          dispatch({
            type: 'SET_USER',
            payload: { user, supabaseUser: session.user },
          });

          // Update last active
          await supabase
            .from('users')
            .update({ last_active: new Date().toISOString() })
            .eq('auth_id', session.user.id);
        } else {
          updateApiToken(null);
          dispatch({ type: 'SET_USER', payload: { user: null, supabaseUser: null } });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (isDemoMode) {
      dispatch({
        type: 'SET_USER',
        payload: { user: DEMO_USER, supabaseUser: null },
      });
      toast.success('Welcome to GrainMart! (Demo Mode)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
    }
  };

  // Sign in with Email
  const signInWithEmail = async (email: string, password: string, rememberMe = false) => {
    if (isDemoMode) {
      dispatch({
        type: 'SET_USER',
        payload: { user: { ...DEMO_USER, email }, supabaseUser: null },
      });
      toast.success('Welcome back! (Demo Mode)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success('Welcome back!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
    }
  };

  // Sign up with Email
  const signUpWithEmail = async (name: string, email: string, password: string, phone: string) => {
    if (isDemoMode) {
      dispatch({
        type: 'SET_USER',
        payload: { user: { ...DEMO_USER, name, email, phone }, supabaseUser: null },
      });
      toast.success('Account created! (Demo Mode)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone },
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      // The trigger will create the user profile, but we need to update with phone
      if (data.user) {
        await supabase
          .from('users')
          .update({ phone, name })
          .eq('auth_id', data.user.id);
      }

      toast.success('Account created! Please check your email to verify.');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
    }
  };

  // Sign in with Phone (OTP)
  const signInWithPhone = async (phone: string) => {
    if (isDemoMode) {
      toast.success('OTP sent! (Demo: use 123456)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) throw error;
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success('OTP sent to your phone!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
    }
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async (phone: string, token: string) => {
    if (isDemoMode) {
      if (token === '123456') {
        dispatch({
          type: 'SET_USER',
          payload: { user: { ...DEMO_USER, phone }, supabaseUser: null },
        });
        toast.success('Phone verified! (Demo Mode)');
      } else {
        toast.error('Invalid OTP');
      }
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: 'sms',
      });

      if (error) throw error;
      toast.success('Phone verified successfully!');
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      toast.error(error.message);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      if (!isDemoMode) {
        await supabase.auth.signOut();
      }
      dispatch({ type: 'SIGN_OUT' });
      toast.success('Signed out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Set User Role
  const setUserRole = async (role: UserRole, inviteCode?: string) => {
    if (!state.supabaseUser && !isDemoMode) return;

    // Verify owner invite code
    if (role === 'owner') {
      const validCode = import.meta.env.VITE_OWNER_INVITE_CODE || 'GRAINMART-OWNER-2025';
      if (inviteCode !== validCode) {
        toast.error('Invalid owner invite code');
        return;
      }
    }

    try {
      if (isDemoMode) {
        dispatch({ type: 'UPDATE_USER', payload: { role } });
        toast.success(`You are now a ${role}!`);
        return;
      }

      const { error } = await supabase
        .from('users')
        .update({ role })
        .eq('auth_id', state.supabaseUser!.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_USER', payload: { role } });
      toast.success(`You are now a ${role}!`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Update User Profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!state.supabaseUser && !isDemoMode) return;

    try {
      if (isDemoMode) {
        dispatch({ type: 'UPDATE_USER', payload: data });
        toast.success('Profile updated');
        return;
      }

      // Map User fields to database column names
      const dbData: Record<string, any> = {
        last_active: new Date().toISOString(),
      };

      if (data.name) dbData.name = data.name;
      if (data.phone) dbData.phone = data.phone;
      if (data.location) dbData.location = data.location;
      if (data.county) dbData.county = data.county;
      if (data.avatar) dbData.avatar = data.avatar;

      const { error } = await supabase
        .from('users')
        .update(dbData)
        .eq('auth_id', state.supabaseUser!.id);

      if (error) throw error;

      dispatch({ type: 'UPDATE_USER', payload: data });
      toast.success('Profile updated');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // Refresh User Data
  const refreshUser = async () => {
    if (!state.supabaseUser) return;

    try {
      const user = await fetchUserProfile(state.supabaseUser);
      if (user) {
        dispatch({ type: 'UPDATE_USER', payload: user });
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  };

  const value: AuthContextType = {
    ...state,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signInWithPhone,
    verifyPhoneOtp,
    signOut,
    setUserRole,
    updateUserProfile,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
