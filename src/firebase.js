import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBeZgo2_pFzbpQ40O8au3ruVZY2IYcFd74",
  authDomain: "prabha-lands.firebaseapp.com",
  projectId: "prabha-lands",
  storageBucket: "prabha-lands.firebasestorage.app",
  messagingSenderId: "302059948400",
  appId: "1:302059948400:web:747b3b1281d17f4ccb67b5",
  measurementId: "G-NTFT71P9XM"
};

const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
