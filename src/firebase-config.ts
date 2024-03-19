//testing new firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: import.meta.env.VITE_APP_FIREBASE_API_KEY,
  authDomain: "spherical-easel.firebaseapp.com",
  projectId: "spherical-easel",
  storageBucket: "spherical-easel.appspot.com",
  messagingSenderId: "157369820516",
  appId: "1:157369820516:web:70391e3fea4b7d6ef7c671"
};

//trying to get my userAccountStore setup and working with firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db }; // Exporting the Firestore instance