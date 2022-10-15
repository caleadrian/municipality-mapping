import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from "firebase/storage"
import { initializeAuth, getAuth } from "firebase/auth";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "municipality-mapping.firebaseapp.com",
    projectId: "municipality-mapping",
    storageBucket: "municipality-mapping.appspot.com",
    messagingSenderId: "970427989428",
    appId: "1:970427989428:web:e7f8aad693e47b113f86e1",
    measurementId: "G-M5PTSVK475"
};

export const app = initializeApp(firebaseConfig)
export const db = getFirestore()
export const storage = getStorage()
// export const auth = getAuth(app)
