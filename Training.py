import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

# 1. Load dataset
df = pd.read_csv("test_data.csv")  # Ensure this file is in the same directory

# 2. Check for and handle missing values
print("Missing Values:\n", df.isnull().sum())
df.fillna(0, inplace=True)  # Replace missing values with 0

# 3. Compute statistical features from pipe-separated values
def compute_stats(col):
    stats = df[col].apply(lambda x: [float(i) for i in x.split('|')])
    return pd.DataFrame({
        f'{col}_mean': stats.apply(np.mean),
        f'{col}_std': stats.apply(np.std),
        f'{col}_min': stats.apply(np.min),
        f'{col}_max': stats.apply(np.max),
    })

# Blood pressure: convert from string like "120/80|..." to systolic and diastolic means
def process_bp(bp_str):
    systolic = []
    diastolic = []
    for reading in bp_str.split('|'):
        sys, dia = reading.split('/')
        systolic.append(int(sys))
        diastolic.append(int(dia))
    return np.mean(systolic), np.mean(diastolic)

# Extract features
heart_rate_stats = compute_stats('vitals_heart_rate')
temperature_stats = compute_stats('vitals_temperature')
bp_stats = df['vitals_blood_pressure'].apply(process_bp)

df['bp_systolic_mean'] = bp_stats.apply(lambda x: x[0])
df['bp_diastolic_mean'] = bp_stats.apply(lambda x: x[1])

# Encode sleep quality (categorical)
sleep_quality_encoded = pd.get_dummies(df['sleep_quality'], prefix='sleep_quality')

# Combine all features into a processed dataframe
processed_df = pd.concat([
    df.drop(['date', 'vitals_heart_rate', 'vitals_blood_pressure', 'vitals_temperature', 'sleep_quality'], axis=1),
    heart_rate_stats,
    temperature_stats,
    sleep_quality_encoded
], axis=1)

# 4. Label the data using thresholds
def label_health(row):
    if (
        60 <= row['vitals_heart_rate_mean'] <= 100 and
        97 <= row['vitals_temperature_mean'] <= 99 and
        row['bp_systolic_mean'] < 130 and
        row['sleep_duration_hours'] >= 7 and
        row['sleep_interruptions'] <= 2 and
        row['activity_steps'] >= 7000
    ):
        return 'Good'
    elif (
        row['vitals_heart_rate_mean'] > 110 or
        row['vitals_temperature_mean'] > 99.5 or
        row['bp_systolic_mean'] > 140 or
        row['sleep_duration_hours'] < 6 or
        row['activity_steps'] < 4000
    ):
        return 'Poor'
    else:
        return 'Moderate'

processed_df['health_category'] = processed_df.apply(label_health, axis=1)

# 5. Prepare for classification
X = processed_df.drop('health_category', axis=1)
y = processed_df['health_category']

# Normalize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# Train the model
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# 6. Evaluation
y_pred = model.predict(X_test)
print("\n--- Classification Report ---")
print(classification_report(y_test, y_pred, zero_division=1))

# Confusion matrix
conf_matrix = confusion_matrix(y_test, y_pred)
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues',
            xticklabels=model.classes_, yticklabels=model.classes_)
plt.title("Confusion Matrix")
plt.xlabel("Predicted")
plt.ylabel("Actual")
plt.show()

# 7. Feature Importance
importances = pd.Series(model.feature_importances_, index=X.columns).sort_values(ascending=False)
print("\n--- Top 10 Important Features ---")
print(importances.head(10))

importances.head(10).plot(kind='barh', color='skyblue')
plt.gca().invert_yaxis()
plt.title("Top 10 Feature Importances")
plt.xlabel("Importance Score")
plt.tight_layout()
plt.show()

# 8. Outlier Detection using IQR method
print("\n--- Outliers Detected (per feature) ---")
numeric_df = X.astype(float)  # Ensure all columns are numeric
for col in numeric_df.columns:
    Q1 = numeric_df[col].quantile(0.25)
    Q3 = numeric_df[col].quantile(0.75)
    IQR = Q3 - Q1
    outliers = numeric_df[(numeric_df[col] < Q1 - 1.5 * IQR) | (numeric_df[col] > Q3 + 1.5 * IQR)]
    if not outliers.empty:
        print(f"{col}: {len(outliers)} outlier(s)")

# 9. Print number of missing values after fillna
print("\n--- Missing Values After Handling ---")
print(df.isnull().sum())
