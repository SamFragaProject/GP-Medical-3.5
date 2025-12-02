import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
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
