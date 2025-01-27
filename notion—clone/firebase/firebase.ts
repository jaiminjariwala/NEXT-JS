// Client—Side Firebase

import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Our web-app firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC9Pn0rgqke1oghjG6ZQ21V7e9etFHw4m4",
    authDomain: "notion-clone-jj.firebaseapp.com",
    projectId: "notion-clone-jj",
    storageBucket: "notion-clone-jj.firebasestorage.app",
    messagingSenderId: "692561669119",
    appId: "1:692561669119:web:209e3aa10e893d9f5215ca",
    measurementId: "G-SLXVBYLZ4H",
};

// if there's no app initialized initially, then we're gonna initialize the App with the "firebaseConfig" which we have initialized above, otherwise we'll just get the app which is already initalized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// now we need the instance of the connection to firestore, the database!
const db = getFirestore(app)

// finally let's export the database, as we're gonna use outside!
export { db }

// ========= Hence this was the "firebase in a nutshell" setup ========