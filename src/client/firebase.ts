import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCCZrEluSXBszuqQzjNnDRCRTSy3c1jgyk",
  authDomain: "squirrelapp-fe548.firebaseapp.com",
  projectId: "squirrelapp-fe548",
  storageBucket: "squirrelapp-fe548.appspot.com",
  messagingSenderId: "887027828936",
  appId: "1:887027828936:web:0ab4951cbcfde569aa3dfd",
  measurementId: "G-Q2TTGM5696"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


export { db, doc, setDoc, getDoc, updateDoc, collection, query, where, getDocs };
