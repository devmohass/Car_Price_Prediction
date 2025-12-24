from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

# -----------------------------
# FastAPI app
# -----------------------------
app = FastAPI(title="Car Price Prediction API")

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Load models and metadata
# -----------------------------
BASE_DIR = os.path.dirname(__file__)

model = joblib.load(os.path.join(BASE_DIR, "../models/linear_regression.pkl"))
scaler = joblib.load(os.path.join(BASE_DIR, "../models/scaler.pkl"))
feature_columns = joblib.load(os.path.join(BASE_DIR, "../models/feature_columns.pkl"))

# -----------------------------
# Input Schema
# -----------------------------
class CarInput(BaseModel):
    tax: float
    mpg: float
    engineSize: float
    car_age: int
    mileage: float
    fuelType: str
    transmission: str
    manufacturer: str
    model: str

# -----------------------------
# Prediction Endpoint
# -----------------------------
@app.post("/predict")
def predict(data: CarInput):
    # 1️⃣ Create empty feature vector
    X = dict.fromkeys(feature_columns, 0)

    # 2️⃣ Fill numerical features
    X["tax"] = data.tax
    X["mpg"] = data.mpg
    X["engineSize"] = data.engineSize
    X["car_age"] = data.car_age
    X["log_mileage"] = np.log1p(data.mileage)

    # 3️⃣ One-hot encode categorical features
    model_key = f"model_{data.model}"
    if model_key in X:
        X[model_key] = 1

    fuel_key = f"fuelType_{data.fuelType.capitalize()}"
    if fuel_key in X:
        X[fuel_key] = 1

    brand_key = f"Manufacturer_{data.manufacturer.capitalize()}"
    if brand_key in X:
        X[brand_key] = 1

    # 4️⃣ Convert to array
    X_array = np.array([X[col] for col in feature_columns])

    # 5️⃣ Scale numeric features (first 5 columns: tax, mpg, engineSize, car_age, log_mileage)
    X_array[:5] = scaler.transform([X_array[:5]])[0]

    # 6️⃣ Predict
    log_price = model.predict([X_array])[0]
    price = np.expm1(log_price)

    return {"predicted_price": round(price, 2)}

# -----------------------------
# Run with:
# uvicorn main:app --reload
# -----------------------------
