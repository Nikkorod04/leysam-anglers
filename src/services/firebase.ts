import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Replaced
const firebaseConfig = {
  apiKey: "AIzaSyDOeV2v2N_i3Cudf4gCTxhva8L3BksWiag",
  authDomain: "leysam-anglers.firebaseapp.com",
  projectId: "leysam-anglers",
  storageBucket: "leysam-anglers.firebasestorage.app",
  messagingSenderId: "854593259989",
  appId: "1:854593259989:web:0050409982c51d727f155c"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
