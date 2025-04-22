import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCrTGzXwKGZBR9hM6q23oFOBKHSqXiwhyg",
  authDomain: "furniture-design-system.firebaseapp.com",
  projectId: "furniture-design-system",
  storageBucket: "furniture-design-system.firebasestorage.app",
  messagingSenderId: "877095846781",
  appId: "1:877095846781:web:78a854fa445ece2777c214"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export auth and firestore
export const auth = getAuth(app);
export const db = getFirestore(app);