# Patient Data Dashboard

##  Overview

The Patient Data Dashboard functions as a full-featured web-based application designed to represent and categorize patient medical documents. The application uses Firebase Firestore to access health metrics like vitals and activity and sleep and nutrition before showing this data through dashboards that interact with users. This project includes a Python-based machine learning model which analyzes records and assigns them to health categories that include **Good** and **Moderate** and **Poor**.

---

##  Tasks Breakdown

###  Firebase Connection

- **Goal**: Connect the dashboard to the `rn-firebase-ml-test` Firestore database.
- **Approach**: The `app.js` uses Firebase SDK to make the connection and obtain the `patientData` collection.
- **Reasoning**:The database connection with minimal configuration enables secure real-time access through Firebase.

---

###  Data Visualization

- **Goal**: The goal of this application is data visualization for all information collected through Firebase database.
- **Charts Used**:
  - **Bar Chart**: Compares calories burned and steps.
  - **Line Chart**:  The heart rate trends appear in the line chart display.
  - **Pie Chart**: The sleep quality distribution appears in the design.
  - **Vitals Table**: Compares temperature, heart rate, and blood pressure.

- **User Interactions**:
  - Filter by **date** (`YYYY-MM-DD`)
  - Filter by **sleep quality** (e.g., Good, Poor)
  - Display error messages for invalid inputs
  - Reset Button

---




###   UI/UX Enhancements

- The system uses HTML and CSS for building its clean responsive layout.
- Real-time visual updates with Chart.js
- Integrated filters for intuitive navigation
- Proper spacing and headings for clarity
- The application shows all patient fields and charts and then presents the particular records and the respesctive visuals if there is any filtration done.
- Search Highlight Support

---

##  Technologies Used

| Tool             | Purpose                                 |
|------------------|------------------------------------------|
| Firebase         | Cloud database for real-time data        |
| Chart.js         | Data visualization (charts, pie, line)   |
| HTML/CSS/JS      | Frontend development                     |
| Python, pandas   | Data analysis and ML training            |
| scikit-learn     | Classification model (Random Forest)     |
| Joblib           | Saving/loading the trained model         |
| VS Code + Live Server | Local development & testing       |

---

##  Setup Instructions
### Prerequisites
- Visual Studio Code
- Live Server Extension
### Instruction 
- Open the project folder in Visual Studio Code.

- Right-click on index.html and select "Open with Live Server". Make sure the Live Server extention is installed.

- The browser will launch the dashboard.

- To train the machine learning model, run the Python script using your terminal.

- Ensure the tese_data.csv dataset is present in the same directory for training to succeed.
