import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDDz2psZDl5kU95kEPOz5OXAQyJHYHYewo",
  authDomain: "prepquest-e5780.firebaseapp.com",
  projectId: "prepquest-e5780",
  storageBucket: "prepquest-e5780.firebasestorage.app",
  messagingSenderId: "118493685424",
  appId: "1:118493685424:web:b1a81e24dd78350e863d75"
};

export const app = initializeApp(firebaseConfig);

export const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});