import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  RecaptchaVerifier,
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
  Auth
} from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

// Check if we're in demo mode (no real Firebase config)
export const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
  import.meta.env.VITE_FIREBASE_API_KEY === 'demo-api-key';

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
let googleProvider: GoogleAuthProvider;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize services
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  
  // Google Auth Provider
  googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('profile');
  googleProvider.addScope('email');

  if (isDemoMode) {
    console.warn('🌾 GrainMart running in DEMO MODE - Firebase not configured');
    console.warn('To enable full functionality, add your Firebase credentials to .env');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
  // Create mock objects for demo mode
  app = {} as FirebaseApp;
  auth = {} as Auth;
  db = {} as Firestore;
  storage = {} as FirebaseStorage;
  googleProvider = {} as GoogleAuthProvider;
}

export { app, auth, db, storage, googleProvider };

// Set auth persistence based on remember me preference
export async function setAuthPersistence(rememberMe: boolean): Promise<void> {
  if (isDemoMode) return;
  const persistence = rememberMe ? browserLocalPersistence : browserSessionPersistence;
  await setPersistence(auth, persistence);
}

// Initialize reCAPTCHA for phone auth
export function initializeRecaptcha(containerId: string): RecaptchaVerifier | null {
  if (isDemoMode) return null;
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    },
  });
}

export default app;
