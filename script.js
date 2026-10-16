
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkTeaVe-wyjpkFQ_BXRvZq-WZ34kU2ARA",
  authDomain: "physics-academy-cbec6.firebaseapp.com",
  projectId: "physics-academy-cbec6",
  storageBucket: "physics-academy-cbec6.firebasestorage.app",
  messagingSenderId: "750571292855",
  appId: "1:750571292855:web:9908606a7308668a0aa532"
};

// Connect this website to Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const authForm = document.getElementById("authForm");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

function showMessage(message) {
  authMessage.textContent = message;
}

function friendlyError(error) {
  const messages = {
    "auth/email-already-in-use": "This email already has an account. Please sign in.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/weak-password": "Choose a stronger password with at least 6 characters.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/too-many-requests": "Too many attempts. Please wait and try again.",
    "auth/network-request-failed": "Network error. Check your internet connection.",
    "auth/operation-not-allowed": "Email/Password sign-in is not enabled in Firebase."
  };

  return messages[error.code] || `Something went wrong: ${error.code || error.message}`;
}

function getFormValues() {
  return {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value,
    accountType: document.getElementById("accountType").value
  };
}

// Create a new Firebase account
signupBtn.addEventListener("click", async () => {
  const { email, password } = getFormValues();

  if (!authForm.reportValidity()) return;

  signupBtn.disabled = true;
  loginBtn.disabled = true;
  showMessage("Creating your account...");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage("Account created successfully!");
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    signupBtn.disabled = false;
    loginBtn.disabled = false;
  }
});

// Sign in to an existing account
authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { email, password } = getFormValues();

  loginBtn.disabled = true;
  signupBtn.disabled = true;
  showMessage("Signing in...");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showMessage(friendlyError(error));
  } finally {
    loginBtn.disabled = false;
    signupBtn.disabled = false;
  }
});

// Firebase maintains the signed-in session
onAuthStateChanged(auth, (user) => {
  if (user) {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");
    document.getElementById("userEmail").textContent = user.email || "";
  } else {
    appView.classList.add("hidden");
    authView.classList.remove("hidden");
  }
});

// Sign out
document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("You have signed out.");
  } catch (error) {
    showMessage(friendlyError(error));
  }
});
