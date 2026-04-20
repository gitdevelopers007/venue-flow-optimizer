import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);

/**
 * Joins a virtual queue for a facility.
 */
export const joinQueue = async (userId: string, facilityId: string) => {
  const queueRef = ref(db, `queues/${facilityId}`);
  const newEntryRef = push(queueRef);
  await set(newEntryRef, {
    userId,
    timestamp: Date.now(),
    status: 'waiting',
  });
  return newEntryRef.key;
};

/**
 * Listens for queue updates.
 */
export const subscribeToQueue = (facilityId: string, callback: (data: any) => void) => {
  const queueRef = ref(db, `queues/${facilityId}`);
  return onValue(queueRef, (snapshot) => {
    callback(snapshot.val());
  });
};
