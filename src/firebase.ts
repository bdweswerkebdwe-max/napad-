import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyBo2mwih0SD9ziqwxFLsF2TLFUpKYsxTw",
  authDomain: "nabad-7f7ac.firebaseapp.com",
  projectId: "nabad-7f7ac",
  storageBucket: "nabad-7f7ac.firebasestorage.app",
  messagingSenderId: "782666463294",
  appId: "1:782666463294:web:0a9aa5fb249e91b6e2796f",
  measurementId: "G-LE7QSEE05D"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

// Validate Connection to Firestore on boot as requested by safety guidelines
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connection verified successfully.");
  } catch (error) {
    console.warn("Firestore backend connection status: Operating in robust offline-cache mode.", error);
  }
}
testConnection();
