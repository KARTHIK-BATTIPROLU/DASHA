import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyArWcTt6S93IlPo4suQe0o8XniPVk2mMvk",
  authDomain: "dasha-college-app-2026.firebaseapp.com",
  projectId: "dasha-college-app-2026",
  storageBucket: "dasha-college-app-2026.firebasestorage.app",
  messagingSenderId: "356415508940",
  appId: "1:356415508940:web:bbe0351f87590eac184d69"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Configure Google OAuth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
