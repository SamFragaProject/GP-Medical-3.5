import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Inicializar solo si no existe
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Messaging solo funciona en el browser
let messaging: Messaging | null = null;

export function getFirebaseMessaging() {
  if (typeof window !== 'undefined' && !messaging) {
    messaging = getMessaging(app);
  }
  return messaging;
}

export { app, getToken, onMessage };
