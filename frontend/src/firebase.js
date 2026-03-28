import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCFh7-3Kvt-X9YF_fgZXhausMpe07aFqSI",
  authDomain: "ecoreceipt-ai-7f555.firebaseapp.com",
  projectId: "ecoreceipt-ai-7f555",
  storageBucket: "ecoreceipt-ai-7f555.firebasestorage.app",
  messagingSenderId: "167846093599",
  appId: "1:167846093599:web:1ee0f84e2e8f1999ac462a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;