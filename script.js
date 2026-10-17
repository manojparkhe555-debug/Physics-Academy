
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

/* ===== Physics Academy Study Materials ===== */

const materialsPanel = document.getElementById("studyMaterialsPanel");
const materialsBatch = document.getElementById("materialBatch");
const materialsCategory = document.getElementById("materialCategory");
const materialsList = document.getElementById("materialsList");
const materialsMessage = document.getElementById("materialsMessage");
const loadMaterialsBtn = document.getElementById("loadMaterialsBtn");
const adminMaterialsForm = document.getElementById("adminMaterialsForm");
const addMaterialForm = document.getElementById("addMaterialForm");

function showMaterialsMessage(message) {
  if (materialsMessage) materialsMessage.textContent = message;
}

function validMaterialUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

async function loadStudyMaterials() {
  if (!materialsList || !materialsBatch || !materialsCategory) return;

  materialsList.replaceChildren();
  showMaterialsMessage("Loading materials...");

  try {
    const materialsQuery = query(
      collection(db, "studyMaterials"),
      where("batch", "==", materialsBatch.value)
    );

    const snapshot = await getDocs(materialsQuery);
    const items = [];

    snapshot.forEach((docSnapshot) => {
      const material = docSnapshot.data();

      if (
        materialsCategory.value === "All" ||
        material.category === materialsCategory.value
      ) {
        items.push(material);
      }
    });

    materialsList.replaceChildren();

    if (items.length === 0) {
      showMaterialsMessage("No materials have been published for this selection yet.");
      return;
    }

    items.forEach((material) => {
      const card = document.createElement("div");
      const heading = document.createElement("h3");
      const details = document.createElement("p");
      const link = document.createElement("a");

      heading.textContent = material.title || "Untitled material";
      details.textContent =
        (material.category || "Material") + " • " + (material.batch || "");

      if (validMaterialUrl(material.url || "")) {
        link.href = material.url;
        link.textContent = material.category === "Video Lectures"
          ? "Open video lecture"
          : "Open material";
        link.target = "_blank";
        link.rel = "noopener noreferrer";
      } else {
        link.textContent = "Link unavailable";
      }

      card.append(heading, details, link);
      materialsList.appendChild(card);
    });

    showMaterialsMessage("");
  } catch (error) {
    console.error("Study materials error:", error);
    showMaterialsMessage(
      "Could not load materials. Check your sign-in and Firestore permissions."
    );
  }
}

if (loadMaterialsBtn) {
  loadMaterialsBtn.addEventListener("click", loadStudyMaterials);
}

if (materialsBatch) {
  materialsBatch.addEventListener("change", loadStudyMaterials);
}

if (materialsCategory) {
  materialsCategory.addEventListener("change", loadStudyMaterials);
}

if (addMaterialForm) {
  addMaterialForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const user = auth.currentUser;

    if (!user || user.uid !== ADMIN_UID) {
      showMaterialsMessage("Only the administrator can publish materials.");
      return;
    }

    const title = document.getElementById("newMaterialTitle").value.trim();
    const batch = document.getElementById("newMaterialBatch").value;
    const category = document.getElementById("newMaterialCategory").value;
    const url = document.getElementById("newMaterialUrl").value.trim();

    if (!title || !validMaterialUrl(url)) {
      showMaterialsMessage("Enter a title and a valid web link.");
      return;
    }

    try {
      await addDoc(collection(db, "studyMaterials"), {
        title,
        batch,
        category,
        url,
        createdAt: serverTimestamp(),
        published: true
      });

      addMaterialForm.reset();
      showMaterialsMessage("Material published successfully.");
      await loadStudyMaterials();
    } catch (error) {
      console.error("Publish material error:", error);
      showMaterialsMessage(
        "Could not publish. Check Firestore permissions and try again."
      );
    }
  });
}

onAuthStateChanged(auth, (user) => {
  if (materialsPanel) {
    materialsPanel.hidden = !user;
  }

  if (adminMaterialsForm) {
    adminMaterialsForm.hidden = !user || user.uid !== ADMIN_UID;
  }

  if (user) {
    loadStudyMaterials();
  } else if (materialsList) {
    materialsList.replaceChildren();
    showMaterialsMessage("Sign in to view study materials.");
  }
});
