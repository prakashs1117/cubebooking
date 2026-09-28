import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBOCiZ0KDUWabEmRt29zRYHTTwTKY43fHc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'mer-booking-tool.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'mer-booking-tool',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'mer-booking-tool.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '377720551717',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:377720551717:web:1498d8c4dc758d17fe82cc',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-7PCGW4CBLT',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize analytics if supported
export const initializeAnalytics = async () => {
  if (await isSupported()) {
    getAnalytics(app);
  }
};

export default app;
