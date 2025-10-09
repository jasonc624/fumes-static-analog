import { initializeApp, getApps, cert, ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Service account configuration - replace with your actual values
const serviceAccount: ServiceAccount = {
  projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'],
  clientEmail: import.meta.env['VITE_FIREBASE_CLIENT_EMAIL'],
  privateKey: import.meta.env['VITE_FIREBASE_PRIVATE_KEY']?.replace(/\\n/g, '\n')
};

// Initialize Firebase Admin SDK
let adminApp;
if (getApps().length === 0) {
  adminApp = initializeApp({
    credential: cert(serviceAccount),
    projectId: serviceAccount.projectId
  });
} else {
  adminApp = getApps()[0];
}

// Export Firestore instance for server-side use
export const adminDb = getFirestore(adminApp);

// Export the admin app instance if needed
export { adminApp };