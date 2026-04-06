import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyDlQF4_uVftYfTG35jSOw6j6NsFRDHpCw8",
  authDomain: "hein-erp.firebaseapp.com",
  projectId: "hein-erp",
  storageBucket: "hein-erp.firebasestorage.app",
  messagingSenderId: "1015799360941",
  appId: "1:1015799360941:web:8ef9758330e0b28c540524",
  measurementId: "G-EC7Q9M5Q5F"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
