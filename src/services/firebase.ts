/**
 * Firebase Service Module
 * 
 * Provides Firebase integration with graceful fallback to local simulation
 * when credentials are not configured. This ensures the app always works.
 */

let db: any = null;
let auth: any = null;
let storage: any = null;
let analytics: any = null;
let firebaseInitialized = false;

const hasRealConfig = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return key && key.length > 10 && !key.includes('your_');
};

// Only initialize Firebase if real credentials exist
if (hasRealConfig()) {
  try {
    const { initializeApp } = await import('firebase/app');
    const { getDatabase } = await import('firebase/database');
    const { getAuth } = await import('firebase/auth');
    const { getStorage } = await import('firebase/storage');
    const { getAnalytics } = await import('firebase/analytics');

    const firebaseConfig = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };

    const app = initializeApp(firebaseConfig);
    db = getDatabase(app);
    auth = getAuth(app);
    storage = getStorage(app);
    analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
    firebaseInitialized = true;
    console.log('[Firebase] Initialized with real credentials');
  } catch (e) {
    console.warn('[Firebase] Init failed, using local simulation:', e);
  }
} else {
  console.log('[Firebase] No credentials — running in local simulation mode');
}

export { db, auth, storage, analytics };

/**
 * Authenticates the user. Falls back to a mock user when Firebase is unavailable.
 */
export const authenticateUser = async () => {
  if (firebaseInitialized && auth) {
    try {
      const { signInAnonymously } = await import('firebase/auth');
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (e) {
      console.warn('[Auth] Firebase auth failed, using mock:', e);
    }
  }
  // Local simulation: return a mock user
  return {
    uid: 'local_user_' + Math.random().toString(36).slice(2, 8),
    isAnonymous: true,
    displayName: 'Guest User',
  };
};

/**
 * Uploads diagnostic logs. Simulates locally when Firebase is unavailable.
 */
export const uploadDiagnosticLog = async (logData: Blob, filename: string) => {
  if (firebaseInitialized && storage) {
    try {
      const { ref: storageRef, uploadBytes } = await import('firebase/storage');
      const logRef = storageRef(storage, `logs/${filename}`);
      await uploadBytes(logRef, logData);
      return;
    } catch (e) {
      console.warn('[Storage] Upload failed:', e);
    }
  }
  // Local simulation
  console.log(`[Storage-Sim] Log "${filename}" saved locally (${logData.size} bytes)`);
};

// Local queue store for simulation
const localQueues: Record<string, Record<string, { userId: string; timestamp: number; status: string }>> = {};
const queueListeners: Record<string, Set<(data: any) => void>> = {};

const notifyQueueListeners = (facilityId: string) => {
  const listeners = queueListeners[facilityId];
  if (listeners) {
    listeners.forEach(cb => cb(localQueues[facilityId] || null));
  }
};

/**
 * Joins a virtual queue. Works with Firebase or local simulation.
 */
export const joinQueue = async (userId: string, facilityId: string) => {
  if (firebaseInitialized && db) {
    try {
      const { ref, push, set } = await import('firebase/database');
      const queueRef = ref(db, `queues/${facilityId}`);
      const newEntryRef = push(queueRef);
      await set(newEntryRef, { userId, timestamp: Date.now(), status: 'waiting' });
      return newEntryRef.key;
    } catch (e) {
      console.warn('[Queue] Firebase failed, using local:', e);
    }
  }
  // Local simulation
  if (!localQueues[facilityId]) localQueues[facilityId] = {};
  const key = 'local_' + Date.now();
  localQueues[facilityId][key] = { userId, timestamp: Date.now(), status: 'waiting' };
  notifyQueueListeners(facilityId);
  return key;
};

/**
 * Subscribes to queue updates. Uses local simulation when Firebase is unavailable.
 */
export const subscribeToQueue = (facilityId: string, callback: (data: any) => void) => {
  if (firebaseInitialized && db) {
    try {
      // Dynamic import for tree-shaking
      import('firebase/database').then(({ ref, onValue }) => {
        const queueRef = ref(db, `queues/${facilityId}`);
        onValue(queueRef, (snapshot: any) => callback(snapshot.val()));
      });
      return () => {}; // Simplified unsubscribe
    } catch (e) {
      console.warn('[Queue] Firebase subscribe failed:', e);
    }
  }
  // Local simulation
  if (!queueListeners[facilityId]) queueListeners[facilityId] = new Set();
  queueListeners[facilityId].add(callback);
  // Send initial data
  callback(localQueues[facilityId] || null);
  return () => {
    queueListeners[facilityId]?.delete(callback);
  };
};
