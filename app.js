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

const querySnapshot = await getDocs(collection(db, "patientData"));
const patientData = [];
querySnapshot.forEach((doc) => {
  patientData.push(doc.data());
});

const container = document.getElementById("data-container");

// Display patient details
patientData.forEach((doc, index) => {
  const entry = document.createElement("div");
  entry.className = "patient-card";
  entry.innerHTML = `
    <h3>Patient ${index + 1}</h3>
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
  `;
  container.appendChild(entry);
});

// --- Data Preparation ---
const labels = patientData.map((_, i) => `Patient ${i + 1}`);
const steps = patientData.map(d => d.activity?.steps || 0);
const calories = patientData.map(d => d.nutrition?.calories || 0);
const water = patientData.map(d => d.nutrition?.water_oz || 0);

// Compute average heart rate if array is provided
const avgHeartRates = patientData.map(d => {
  const rates = d.vitals?.heart_rate || [];
  if (Array.isArray(rates) && rates.length > 0) {
    const sum = rates.reduce((a, b) => a + b, 0);
    return sum / rates.length;
  }
  return 0;
});

// Sleep quality counts
const sleepQualityCounts = patientData.reduce((acc, d) => {
  const quality = d.sleep?.quality || "Unknown";
  acc[quality] = (acc[quality] || 0) + 1;
  return acc;
}, {});

// --- Bar Chart: Steps & Calories ---
new Chart(document.getElementById("barChart"), {
  type: "bar",
  data: {
    labels,
    datasets: [
      {
        label: "Steps",
        data: steps,
        backgroundColor: "rgba(75, 192, 192, 0.6)"
      },
      {
        label: "Calories",
        data: calories,
        backgroundColor: "rgba(255, 99, 132, 0.6)"
      }
    ]
  },
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: "Steps & Calories Burned per Patient" }
    }
  }
});

// --- Line Chart: Heart Rate Over Time ---
new Chart(document.getElementById("lineChart"), {
  type: "line",
  data: {
    labels,
    datasets: [{
      label: "Average Heart Rate",
      data: avgHeartRates,
      borderColor: "rgba(153, 102, 255, 1)",
      backgroundColor: "rgba(153, 102, 255, 0.2)",
      fill: true,
      tension: 0.4
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: "Heart Rate Over Time" }
    }
  }
});

// --- Pie Chart: Sleep Quality Distribution ---
const sleepLabels = Object.keys(sleepQualityCounts);
const sleepData = Object.values(sleepQualityCounts);
const pieColors = sleepLabels.map((_, i) => `hsl(${i * 60}, 70%, 60%)`);

new Chart(document.getElementById("pieChart"), {
  type: "pie",
  data: {
    labels: sleepLabels,
    datasets: [{
      label: "Sleep Quality",
      data: sleepData,
      backgroundColor: pieColors
    }]
  },
  options: {
    responsive: true,
    plugins: {
      title: { display: true, text: "Sleep Quality Distribution" }
    }
  }
});




























