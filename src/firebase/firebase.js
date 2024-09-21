// src/firebase/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/* const firebaseConfig = {
  apiKey: "AIzaSyAhuR-58ylg1pTIBs_xyBsHzYxFMA2fBvo",
  authDomain: "ssr-host-verification-12d08.firebaseapp.com",
  projectId: "ssr-host-verification-12d08",
  storageBucket: "ssr-host-verification-12d08.appspot.com",
  messagingSenderId: "759982908058",
  appId: "1:759982908058:web:0e2ecc1294493dd21bb523",
  measurementId: "G-WG1HE433S5"
}; */

const firebaseConfig = {
  apiKey: "AIzaSyBozfDwJK-8YsqaMPvp2XBLkGdZHOuBjMI",
  authDomain: "secretcrew-ssr24.firebaseapp.com",
  projectId: "secretcrew-ssr24",
  storageBucket: "secretcrew-ssr24.appspot.com",
  messagingSenderId: "102244200220",
  appId: "1:102244200220:web:7fccb78e9df06e7a1f14d9",
  measurementId: "G-284S58PC8G"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);

export { auth, db };
