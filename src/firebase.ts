import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBYbHttqFkvcRlmV7nhhdZirWB7Wtn-aoE",
  authDomain: "elnathanapp-86248.firebaseapp.com",
  databaseURL: "https://elnathanapp-86248-default-rtdb.firebaseio.com",
  projectId: "elnathanapp-86248",
  storageBucket: "elnathanapp-86248.firebasestorage.app",
  messagingSenderId: "660155739426",
  appId: "1:660155739426:web:f75f46eab7f5f1f0b4497b",
  measurementId: "G-H6R52EVG4L"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({tabManager: persistentMultipleTabManager()})
});
