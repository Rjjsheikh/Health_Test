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
const allData = [];
querySnapshot.forEach((doc) => allData.push(doc.data()));

const container = document.getElementById("data-container");
const barCanvas = document.getElementById("barChart");
const lineCanvas = document.getElementById("lineChart");
const pieCanvas = document.getElementById("pieChart");
const vitalsTable = document.getElementById("data-table");
const searchBtn = document.getElementById("search-btn");
const resetBtn = document.getElementById("reset-btn");
const errorMsg = document.getElementById("error-msg");
const qualitySelect = document.getElementById("search-quality");

const sleepQualities = [...new Set(allData.map(d => d.sleep?.quality).filter(Boolean))];
sleepQualities.forEach(q => {
  const option = document.createElement("option");
  option.value = q;
  option.textContent = q;
  qualitySelect.appendChild(option);
});

const getAverage = (arr) => arr?.length ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : "N/A";
let barChart, lineChart, pieChart;

function renderDashboard(data, searchDate = "", searchQuality = "") {
  container.innerHTML = "";
  vitalsTable.innerHTML = "";

  data.forEach((doc, index) => {
    const entry = document.createElement("div");
    entry.className = "patient-card";

    if (
      (searchDate && doc.date === searchDate) ||
      (searchQuality && doc.sleep?.quality === searchQuality)
    ) {
      entry.classList.add("highlight-card");
    }

    const highlight = (value, match) =>
      value === match ? `<span class="highlight-field">${value}</span>` : value;

    entry.innerHTML = `
      <h3>Patient ${index + 1}</h3>
      <p><strong>Date:</strong> ${highlight(doc.date, searchDate)}</p>
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
        <li>Macros: ${Object.entries(doc.nutrition?.macros || {}).map(([k, v]) => `${k}: ${v}`).join(", ")}</li>
      </ul>
      <h4>Sleep</h4>
      <ul>
        <li>Duration (hours): ${doc.sleep?.duration_hours}</li>
        <li>Quality: ${highlight(doc.sleep?.quality, searchQuality)}</li>
        <li>Interruptions: ${doc.sleep?.interruptions}</li>
      </ul>
      <h4>Vitals</h4>
      <ul>
        <li>Blood Pressure: ${doc.vitals?.blood_pressure?.join(", ") || "N/A"}</li>
        <li>Heart Rate: ${doc.vitals?.heart_rate?.join(", ") || "N/A"}</li>
        <li>Temperature: ${doc.vitals?.temperature?.join(", ") || "N/A"}</li>
      </ul>
    `;

    container.appendChild(entry);
  });

  const labels = data.map((_, i) => `Patient ${i + 1}`);
  const steps = data.map(d => d.activity?.steps || 0);
  const calories = data.map(d => d.nutrition?.calories || 0);
  const avgHeartRates = data.map(d => getAverage(d.vitals?.heart_rate));
  const sleepQualityCounts = data.reduce((acc, d) => {
    const quality = d.sleep?.quality || "Unknown";
    acc[quality] = (acc[quality] || 0) + 1;
    return acc;
  }, {});

  barChart?.destroy();
  lineChart?.destroy();
  pieChart?.destroy();

  barChart = new Chart(barCanvas, {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Steps", data: steps, backgroundColor: "rgba(75, 192, 192, 0.6)" },
        { label: "Calories", data: calories, backgroundColor: "rgba(255, 99, 132, 0.6)" }
      ]
    },
    options: { responsive: true }
  });

  lineChart = new Chart(lineCanvas, {
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
    options: { responsive: true }
  });

  pieChart = new Chart(pieCanvas, {
    type: "pie",
    data: {
      labels: Object.keys(sleepQualityCounts),
      datasets: [{
        data: Object.values(sleepQualityCounts),
        backgroundColor: Object.keys(sleepQualityCounts).map((_, i) => `hsl(${i * 60}, 70%, 60%)`)
      }]
    },
    options: { responsive: true }
  });

  vitalsTable.innerHTML = `
    <tr>
      <th>Patient</th>
      <th>Blood Pressure</th>
      <th>Average Heart Rate</th>
      <th>Average Temperature</th>
    </tr>
  `;
  data.forEach((doc, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>Patient ${index + 1}</td>
      <td>${doc.vitals?.blood_pressure?.join(", ") || "N/A"}</td>
      <td>${getAverage(doc.vitals?.heart_rate)}</td>
      <td>${getAverage(doc.vitals?.temperature)}</td>
    `;
    vitalsTable.appendChild(row);
  });
}

searchBtn.addEventListener("click", () => {
  const dateInput = document.getElementById("search-date").value.trim();
  const qualityInput = document.getElementById("search-quality").value;
  errorMsg.textContent = "";

  let filtered = [...allData];
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

  if (dateInput && !dateRegex.test(dateInput)) {
    errorMsg.textContent = "Invalid date format! Please use YYYY-MM-DD.";
    return;
  }

  if (dateInput) filtered = filtered.filter(d => d.date === dateInput);
  if (qualityInput) filtered = filtered.filter(d => d.sleep?.quality === qualityInput);

  if (filtered.length === 0) {
    errorMsg.textContent = "No results match your search criteria.";
  }

  renderDashboard(filtered, dateInput, qualityInput); // pass for highlighting
});

resetBtn.addEventListener("click", () => {
  document.getElementById("search-date").value = "";
  document.getElementById("search-quality").value = "";
  errorMsg.textContent = "";
  renderDashboard(allData);
});

renderDashboard(allData);

























