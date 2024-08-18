// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9eL_xkPVq51rQ2fwswzYhe8gWgyMDh7Y",
  authDomain: "techprep-ai-bot.firebaseapp.com",
  projectId: "techprep-ai-bot",
  storageBucket: "techprep-ai-bot.appspot.com",
  messagingSenderId: "181681530763",
  appId: "1:181681530763:web:dd88136e0171ce2c17318e",
  measurementId: "G-BTFJFKT9H5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const db = getFirestore(app);

export { db, collection, addDoc, getDocs };