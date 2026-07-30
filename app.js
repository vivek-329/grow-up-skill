import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
  getFirestore,
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// 🔥 Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBrsmcsae8q786ugs1nfVHxquOErCTQJMw",
  authDomain: "grow-up-skill.firebaseapp.com",
  projectId: "grow-up-skill"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===================================================
// 🔐 GLOBAL LOGOUT (INSTANT)
// ===================================================
window.logout = async () => {
  try {
    document.body.innerHTML = "<h2>Logging out...</h2>";
    await signOut(auth);
    location.href = "index.html";
  } catch (err) {
    alert(err.message);
  }
};


// ===================================================
// 👨‍💼 ADMIN PANEL LOGIC
// ===================================================
if (location.pathname.includes("admin.html")) {

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.email));

    if (!snap.exists() || snap.data().role !== "admin") {
      location.href = "dashboard.html";
      return;
    }

    loadUsers();
  });

  async function loadUsers() {
    const snap = await getDocs(collection(db, "users"));

    let html = "";
    let total = 0, pending = 0, approved = 0;

    snap.forEach((d) => {
      const u = d.data();
      total++;

      if (u.status === "pending") pending++;
      if (u.status === "approved") approved++;

      html += `
        <div class="user-card">
          <div>
            <b>${u.email}</b><br>
            Status: ${u.status}
          </div>

          <div>
            <button onclick="approve('${u.email}')">Approve</button>
            <button onclick="reject('${u.email}')" style="background:red">Reject</button>
          </div>
        </div>
      `;
    });

    document.getElementById("users").innerHTML = html;
    document.getElementById("totalUsers").innerText = total;
    document.getElementById("pendingUsers").innerText = pending;
    document.getElementById("approvedUsers").innerText = approved;
  }

  // ✅ Approve user
  window.approve = async (email) => {
  await setDoc(doc(db, "users", email), {
    status: "approved"
  }, { merge: true });

  // 📧 Email send karo
  emailjs.send("service_f0f7ctr", "template_1tcg8gb", {
    name: email,
    email: email,
    message: "Your account has been approved 🎉"
  });

  loadUsers();
};

  // ❌ Reject user
  window.reject = async (email) => {
  await setDoc(doc(db, "users", email), {
    status: "rejected"
  }, { merge: true });

  emailjs.send("service_f0f7ctr", "template_1tcg8gb", {
    name: email,
    email: email,
    message: "Your account was rejected ❌"
  });

  loadUsers();
};

  // 🔍 Search user
  window.searchUser = () => {
    const val = document.getElementById("search").value.toLowerCase();

    document.querySelectorAll(".user-card").forEach(card => {
      card.style.display =
        card.innerText.toLowerCase().includes(val) ? "flex" : "none";
    });
  };
}


// ===================================================
// 🎓 DASHBOARD SECURITY (NO BYPASS)
// ===================================================
if (location.pathname.includes("dashboard.html")) {

  onAuthStateChanged(auth, async (user) => {
    if (!user) {
      location.href = "index.html";
      return;
    }

    const snap = await getDoc(doc(db, "users", user.email));

    if (!snap.exists()) {
      location.href = "index.html";
      return;
    }

    const data = snap.data();

    if (data.status === "pending") {
      location.href = "pending.html";
    } 
    else if (data.status === "rejected") {
      alert("You are rejected ❌");
      location.href = "index.html";
    }
    else if (data.status === "approved") {
      console.log("Access granted ✅");
    } 
    else {
      location.href = "index.html";
    }
  });
}