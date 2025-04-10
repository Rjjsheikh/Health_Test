// Firebase imports and config setup (you already have this part)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyB3-pM-dr_HGXpLyE-vxXCrJn8vPUnw37Q",
  authDomain: "rn-firebase-ml-test.firebaseapp.com",
  projectId: "rn-firebase-ml-test",
  storageBucket: "rn-firebase-ml-test.firebasestorage.app",
  messagingSenderId: "964593574138",
  appId: "1:964593574138:web:815a05431b322d81312943",
  measurementId: "G-CR54SS9S8P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Fetching data
const querySnapshot = await getDocs(collection(db, "patientData"));
const patientData = {};

querySnapshot.forEach((doc) => {
  patientData[doc.id] = doc.data();
  console.log(doc.id, "=>", doc.data());
});



const container = document.getElementById("data-container");

for (const [docId, doc] of Object.entries(patientData)) {
  const entry = document.createElement("div");
  entry.className = "patient-card";

  entry.innerHTML = `
    <h3>Patient ID: ${docId}</h3>
    <p><strong>Date:</strong> ${doc.date}</p>

    <h4>Activity</h4>
    <ul>
      <li>Steps: ${doc.activity?.steps}</li>
      <li>Active Minutes: ${doc.activity?.active_minutes}</li>
      <li>Sedentary Hours: ${doc.activity?.sedentary_hours}</li>
    </ul>

    <h4>Nutrition</h4>
    <ul>
      <li>Calories: ${doc.nutrition?.calories}</li>
      <li>Water (oz): ${doc.nutrition?.water_oz}</li>
      <li>Macros: ${Object.entries(doc.nutrition?.macros || {}).map(([key, val]) => `${key}: ${val}`).join(', ')}</li>
    </ul>

    <h4>Sleep</h4>
    <ul>
      <li>Duration (hours): ${doc.sleep?.duration_hours}</li>
      <li>Quality: ${doc.sleep?.quality}</li>
      <li>Interruptions: ${doc.sleep?.interruptions}</li>
    </ul>

    <h4>Vitals</h4>
    <ul>
      <li>Blood Pressure: ${doc.vitals?.blood_pressure?.join(', ')}</li>
      <li>Heart Rate: ${doc.vitals?.heart_rate?.join(', ')}</li>
      <li>Temperature: ${doc.vitals?.temperature?.join(', ')}</li>
    </ul>
    <hr>
  `;

  container.appendChild(entry);
}










