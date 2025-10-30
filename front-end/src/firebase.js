import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBSqZBbMVw7ZBPv3zFPZCNdb9hFU3V7LAg",
  authDomain: "otis-mvp.firebaseapp.com",
  projectId: "otis-mvp",
  storageBucket: "otis-mvp.firebasestorage.app",
  messagingSenderId: "407657232469",
  appId: "1:407657232469:web:0be42bb3fee9ba17933cdc"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);