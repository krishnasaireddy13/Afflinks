import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBgyq-xGXAabq-KpRv0wVX6StkUlENYUbU",
  authDomain: "afflinks-83e43.firebaseapp.com",
  projectId: "afflinks-83e43",
  storageBucket: "afflinks-83e43.firebasestorage.app",
  messagingSenderId: "43353831547",
  appId: "1:43353831547:web:ce46623abfb89b3b5bcade",
  measurementId: "G-7LWT5WL9T7"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);