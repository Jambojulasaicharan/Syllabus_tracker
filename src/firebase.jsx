import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2-zuwQO1jKlKd0omBNZJ1e47BunnDc4o",
  authDomain: "syllabus-tracker-ced05.firebaseapp.com",
  projectId: "syllabus-tracker-ced05",
  storageBucket: "syllabus-tracker-ced05.firebasestorage.app",
  messagingSenderId: "885811205529",
  appId: "1:885811205529:web:b212e5e2bc250b2cf12f08"
};
const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);