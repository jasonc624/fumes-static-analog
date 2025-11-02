export const environment = {
  production: import.meta.env['PROD'] || false,
  stripe: {
    publishableKey: import.meta.env['VITE_STRIPE'] || ''
  },
  firebase: {
    apiKey: import.meta.env['VITE_FIREBASE_API_KEY'] || '',
    authDomain: import.meta.env['VITE_FIREBASE_AUTH_DOMAIN'] || '',
    projectId: import.meta.env['VITE_FIREBASE_PROJECT_ID'] || '',
    storageBucket: import.meta.env['VITE_FIREBASE_STORAGE_BUCKET'] || '',
    messagingSenderId: import.meta.env['VITE_FIREBASE_MESSAGING_SENDER_ID'] || '',
    appId: import.meta.env['VITE_FIREBASE_APP_ID'] || ''
  },
  apiUrl: import.meta.env['VITE_API_URL'] || '/api/v1'
};