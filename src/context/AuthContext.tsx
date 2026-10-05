import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  signOut as firebaseSignOut,
  sendEmailVerification,
  User as FirebaseUser,
  ConfirmationResult
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { auth, db, googleProvider, setAuthPersistence, initializeRecaptcha, isDemoMode } from '@/services/firebase';
import { updateApiToken } from '@/services/api';
import { User, UserRole, VerificationStatus } from '@/types';
import toast from 'react-hot-toast';

// Demo user for testing without Firebase
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
  joinedAt: Timestamp.now(),
  lastActive: Timestamp.now(),
  walletBalance: 0,
  rating: 0,
  totalSales: 0,
  isPremium: false,
};

// Auth State
interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  confirmationResult: ConfirmationResult | null;
  isDemoMode: boolean;
}

// Auth Actions
type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: { user: User | null; firebaseUser: FirebaseUser | null } }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONFIRMATION_RESULT'; payload: ConfirmationResult | null }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'SIGN_OUT' };

// Initial State
const initialState: AuthState = {
  user: null,
  firebaseUser: null,
  loading: true,
  error: null,
  confirmationResult: null,
  isDemoMode: isDemoMode,
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
        firebaseUser: action.payload.firebaseUser,
        loading: false,
        error: null 
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_CONFIRMATION_RESULT':
      return { ...state, confirmationResult: action.payload };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: state.user ? { ...state.user, ...action.payload } : null 
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
  sendPhoneOtp: (phoneNumber: string, recaptchaContainerId: string) => Promise<void>;
  verifyPhoneOtp: (otp: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUserRole: (role: UserRole, inviteCode?: string) => Promise<void>;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Fetch user document from Firestore
  const fetchUserDoc = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const userSnap = await getDoc(userRef);
    
    if (userSnap.exists()) {
      return { uid: firebaseUser.uid, ...userSnap.data() } as User;
    }
    return null;
  };

  // Create initial user document
  const createUserDoc = async (
    firebaseUser: FirebaseUser, 
    additionalData: Partial<User> = {}
  ): Promise<User> => {
    const userRef = doc(db, 'users', firebaseUser.uid);
    
    const newUser: Omit<User, 'uid'> = {
      name: additionalData.name || firebaseUser.displayName || 'User',
      email: firebaseUser.email || undefined,
      phone: additionalData.phone || firebaseUser.phoneNumber || '',
      role: 'buyer' as UserRole,
      avatar: firebaseUser.photoURL || undefined,
      location: '',
      county: '',
      verified: false,
      verificationStatus: 'none' as VerificationStatus,
      joinedAt: Timestamp.now(),
      lastActive: Timestamp.now(),
      walletBalance: 0,
      rating: 0,
      totalSales: 0,
      isPremium: false,
      ...additionalData,
    };

    await setDoc(userRef, newUser);
    return { uid: firebaseUser.uid, ...newUser };
  };

  // Listen for auth state changes
  useEffect(() => {
    // In demo mode, set loading to false immediately
    if (isDemoMode) {
      dispatch({ type: 'SET_LOADING', payload: false });
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Get and set the auth token for API calls
          const token = await firebaseUser.getIdToken();
          updateApiToken(token);

          let user = await fetchUserDoc(firebaseUser);
          
          if (!user) {
            user = await createUserDoc(firebaseUser);
          } else {
            // Update last active
            const userRef = doc(db, 'users', firebaseUser.uid);
            await updateDoc(userRef, { lastActive: Timestamp.now() });
          }
          
          dispatch({ 
            type: 'SET_USER',
            payload: { user, firebaseUser } 
          });
        } catch (error) {
          console.error('Error fetching user:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load user data' });
        }
      } else {
        updateApiToken(null);
        dispatch({ type: 'SET_USER', payload: { user: null, firebaseUser: null } });
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    if (isDemoMode) {
      // Demo mode sign-in
      dispatch({ 
        type: 'SET_USER', 
        payload: { user: DEMO_USER, firebaseUser: null } 
      });
      toast.success('Welcome to GrainMart! (Demo Mode)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await signInWithPopup(auth, googleProvider);
      toast.success('Welcome to GrainMart!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Sign in with Email
  const signInWithEmail = async (email: string, password: string, rememberMe = false) => {
    if (isDemoMode) {
      // Demo mode sign-in
      dispatch({ 
        type: 'SET_USER', 
        payload: { user: { ...DEMO_USER, email }, firebaseUser: null } 
      });
      toast.success('Welcome back! (Demo Mode)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await setAuthPersistence(rememberMe);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Welcome back!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Sign up with Email
  const signUpWithEmail = async (name: string, email: string, password: string, phone: string) => {
    if (isDemoMode) {
      // Demo mode sign-up
      dispatch({ 
        type: 'SET_USER', 
        payload: { user: { ...DEMO_USER, name, email, phone }, firebaseUser: null } 
      });
      toast.success('Account created! (Demo Mode)');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user document
      await createUserDoc(firebaseUser, { name, phone });
      
      // Send email verification
      await sendEmailVerification(firebaseUser);
      
      toast.success('Account created! Please verify your email.');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign up failed';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Send Phone OTP
  const sendPhoneOtp = async (phoneNumber: string, recaptchaContainerId: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const recaptchaVerifier = initializeRecaptcha(recaptchaContainerId);
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
      dispatch({ type: 'SET_CONFIRMATION_RESULT', payload: confirmationResult });
      dispatch({ type: 'SET_LOADING', payload: false });
      toast.success('OTP sent to your phone!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Verify Phone OTP
  const verifyPhoneOtp = async (otp: string) => {
    if (!state.confirmationResult) {
      toast.error('No OTP request pending');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await state.confirmationResult.confirm(otp);
      dispatch({ type: 'SET_CONFIRMATION_RESULT', payload: null });
      toast.success('Phone verified successfully!');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid OTP';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      toast.error(errorMessage);
    }
  };

  // Sign Out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      dispatch({ type: 'SIGN_OUT' });
      toast.success('Signed out successfully');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
      toast.error(errorMessage);
    }
  };

  // Set User Role
  const setUserRole = async (role: UserRole, inviteCode?: string) => {
    if (!state.firebaseUser) return;

    // Verify owner invite code
    if (role === 'owner') {
      const validCode = import.meta.env.VITE_OWNER_INVITE_CODE || 'GRAINMART-OWNER-2025';
      if (inviteCode !== validCode) {
        toast.error('Invalid owner invite code');
        return;
      }
    }

    try {
      const userRef = doc(db, 'users', state.firebaseUser.uid);
      await updateDoc(userRef, { role });
      dispatch({ type: 'UPDATE_USER', payload: { role } });
      toast.success(`You are now a ${role}!`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to set role';
      toast.error(errorMessage);
    }
  };

  // Update User Profile
  const updateUserProfile = async (data: Partial<User>) => {
    if (!state.firebaseUser) return;

    try {
      const userRef = doc(db, 'users', state.firebaseUser.uid);
      await updateDoc(userRef, { ...data, lastActive: Timestamp.now() });
      dispatch({ type: 'UPDATE_USER', payload: data });
      toast.success('Profile updated');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
      toast.error(errorMessage);
    }
  };

  // Refresh User Data
  const refreshUser = async () => {
    if (!state.firebaseUser) return;

    try {
      const user = await fetchUserDoc(state.firebaseUser);
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
    sendPhoneOtp,
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
