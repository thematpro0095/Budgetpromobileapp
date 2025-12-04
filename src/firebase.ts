import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCxSmmt3vjSI-IQjXGdjz9t-SVIojEjG7E",
  authDomain: "budgetpro-80915.firebaseapp.com",
  projectId: "budgetpro-80915",
  storageBucket: "budgetpro-80915.appspot.com",
  messagingSenderId: "914000449703",
  appId: "1:914000449703:web:e2ff89558cfa7f382a0b82"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
