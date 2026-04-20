import { initializeApp } from 'firebase/app';
import { getDatabase, ref, onValue, set, push } from 'firebase/database';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getStorage, ref as storageRef, uploadBytes } from 'firebase/storage';
import { getAnalytics, logEvent } from 'firebase/analytics';

/**
 * Firebase Configuration using secure environment variables.
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "mock-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mock-domain",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://mock.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mock-bucket",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "mock-sender",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "mock-app-id",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "mock-measurement-id"
};

// Initialize Google Firebase Services
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Conditionally initialize analytics (only works in browser context)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

/**
 * Authenticates the user anonymously to secure their queue session.
 */
export const authenticateUser = async () => {
  try {
    const userCredential = await signInAnonymously(auth);
    if (analytics) logEvent(analytics, 'login', { method: 'anonymous' });
    return userCredential.user;
  } catch (error) {
    console.error("Auth failed (Expected in Sandbox Mode)", error);
    return null;
  }
};

/**
 * Uploads diagnostic logs to Google Cloud Storage.
 */
export const uploadDiagnosticLog = async (logData: Blob, filename: string) => {
  const logRef = storageRef(storage, `logs/${filename}`);
  await uploadBytes(logRef, logData);
  if (analytics) logEvent(analytics, 'upload_log');
};

/**
 * Joins a virtual queue for a facility using Realtime DB.
 * @param userId - The authenticated user's ID
 * @param facilityId - The target facility
 */
export const joinQueue = async (userId: string, facilityId: string) => {
  const queueRef = ref(db, `queues/${facilityId}`);
  const newEntryRef = push(queueRef);
  await set(newEntryRef, {
    userId,
    timestamp: Date.now(),
    status: 'waiting',
  });
  if (analytics) logEvent(analytics, 'join_queue', { facilityId });
  return newEntryRef.key;
};

/**
 * Listens for real-time queue updates.
 */
export const subscribeToQueue = (facilityId: string, callback: (data: any) => void) => {
  const queueRef = ref(db, `queues/${facilityId}`);
  return onValue(queueRef, (snapshot) => {
    callback(snapshot.val());
  });
};
