
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
const firebaseConfig = {
  apiKey: "AIzaSyCkTeaVe-wyjpkFQ_BXRvZq-WZ34kU2ARA",
  authDomain: "physics-academy-cbec6.firebaseapp.com",
  projectId: "physics-academy-cbec6",
  storageBucket: "physics-academy-cbec6.firebasestorage.app",
  messagingSenderId: "750571292855",
  appId: "1:750571292855:web:9908606a7308668a0aa532"
};
const ADMIN_UID = "TrMyz1cOwoVJKQL08pxIG5LZI7f1";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const authView = document.getElementById("authView");
const appView = document.getElementById("appView");
const authForm = document.getElementById("authForm");
const signupBtn = document.getElementById("signupBtn");
const loginBtn = document.getElementById("loginBtn");
const authMessage = document.getElementById("authMessage");

function showMessage(message) {
  authMessage.textContent = message;
}

function explainError(error) {
  const messages = {
    "auth/email-already-in-use": "This email already has an account. Please sign in.",
    "auth/invalid-email": "Enter a valid email address.",
    "auth/weak-password": "Use a stronger password with at least 6 characters.",
    "auth/invalid-credential": "Email or password is incorrect.",
    "auth/operation-not-allowed": "Enable Email/Password in Firebase Authentication.",
    "auth/network-request-failed": "Check your internet connection."
  };
  return messages[error.code] || "Error: " + error.code;
}

function getCredentials() {
  return {
    email: document.getElementById("email").value.trim(),
    password: document.getElementById("password").value
  };
}

signupBtn.addEventListener("click", async () => {
  if (!authForm.reportValidity()) return;

  const { email, password } = getCredentials();
  signupBtn.disabled = true;
  loginBtn.disabled = true;
  showMessage("Creating account...");

  try {
    await createUserWithEmailAndPassword(auth, email, password);
    showMessage("Account created successfully!");
  } catch (error) {
    showMessage(explainError(error));
  } finally {
    signupBtn.disabled = false;
    loginBtn.disabled = false;
  }
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const { email, password } = getCredentials();
  signupBtn.disabled = true;
  loginBtn.disabled = true;
  showMessage("Signing in...");

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    showMessage(explainError(error));
  } finally {
    signupBtn.disabled = false;
    loginBtn.disabled = false;
  }
});

onAuthStateChanged(auth, (user) => {
  if (user) {
    authView.classList.add("hidden");
    appView.classList.remove("hidden");
    document.getElementById("userEmail").textContent = user.email || "";

    const adminPanel = document.getElementById("adminPanel");

    if (adminPanel) {
      adminPanel.hidden = user.uid !== ADMIN_UID;
    }
  } else {
    appView.classList.add("hidden");
    authView.classList.remove("hidden");
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await signOut(auth);
    showMessage("You have signed out.");
  } catch (error) {
    showMessage(explainError(error));
  }
});

const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const studentFormMessage = document.getElementById("studentFormMessage");

if (studentForm && studentList && studentFormMessage) {
  studentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;
    if (!user || user.uid !== ADMIN_UID) {
      studentFormMessage.textContent = "Admin access required.";
      return;
    }

    const studentName =
      document.getElementById("studentName").value.trim();
    const studentEmail =
      document.getElementById("studentEmail").value.trim();
    const parentContact =
      document.getElementById("parentContact").value.trim();
    const studentBatch =
      document.getElementById("studentBatch").value;

    try {
      studentFormMessage.textContent = "Saving student...";

      await addDoc(collection(db, "students"), {
        name: studentName,
        email: studentEmail,
        parentContact: parentContact,
        batch: studentBatch,
        createdAt: serverTimestamp()
      });

      studentForm.reset();
      studentFormMessage.textContent = "Student registered successfully!";
    } catch (error) {
      console.error(error);
      studentFormMessage.textContent =
        "Could not save student: " + error.message;
    }
  });

  async function loadStudents() {
    if (!auth.currentUser || auth.currentUser.uid !== ADMIN_UID) return;

    try {
      const studentsQuery = query(
        collection(db, "students"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(studentsQuery);

      studentList.replaceChildren();

      if (snapshot.empty) {
        studentList.textContent = "No students registered yet.";
        return;
      }

      snapshot.forEach((studentDoc) => {
        const student = studentDoc.data();
        const item = document.createElement("p");
        item.textContent =
          `${student.name} — ${student.batch}` +
          (student.email ? ` — ${student.email}` : "");
        studentList.appendChild(item);
      });
    } catch (error) {
      console.error(error);
      studentFormMessage.textContent =
        "Could not load students: " + error.message;
    }
  }

  studentForm.addEventListener("submit", () => {
    setTimeout(loadStudents, 1000);
  });

  onAuthStateChanged(auth, (user) => {
    if (user && user.uid === ADMIN_UID) loadStudents();
  }); 
}
