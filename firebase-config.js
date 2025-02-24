import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";

// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyAFEQr6oAFlZhwFIVbQxn6uwAurvwrvlz8",
    authDomain: "study-go-37c39.firebaseapp.com",
    projectId: "study-go-37c39",
    storageBucket: "study-go-37c39.firebasestorage.app",
    messagingSenderId: "124573683721",
    appId: "1:124573683721:web:8cc72488e0fafd446d68d8",
    measurementId: "G-HQZ5CJZC9Q"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const usersCollection = collection(db, "users");

const addUser = (collection, data) => {
    addDoc(collection, data);
}

export { db, usersCollection, addUser, getDocs };
