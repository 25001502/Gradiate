import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDld0y3sKb1e0WkNvWqe2NIsKZSpNUHOW0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'my-univen-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'my-univen-project',
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'my-univen-project.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '786720293448',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:786720293448:web:7a775703cbead240f58e7d',
};

export const firebaseApp = initializeApp(firebaseConfig);
