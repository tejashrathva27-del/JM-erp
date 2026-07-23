/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Firebase SDK Configuration & Initialization
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Default mock/placeholder Firebase Config
const defaultFirebaseConfig = {
  apiKey: "AIzaSyDummyKeyForJamavatMasalaErpLocalPreview",
  authDomain: "jamavat-masala-erp.firebaseapp.com",
  projectId: "jamavat-masala-erp",
  storageBucket: "jamavat-masala-erp.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

export function initFirebase(customConfig?: any) {
  try {
    const config = customConfig || defaultFirebaseConfig;
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApp();
    }
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    return { app, auth, db, storage };
  } catch (error) {
    console.warn("Firebase initialization fallback mode enabled.", error);
    return { app: null, auth: null, db: null, storage: null };
  }
}

const firebaseInstance = initFirebase();
export { app, auth, db, storage };
