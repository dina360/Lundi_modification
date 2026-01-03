# ia-service/app/ia_prediction_service.py
import os
import pickle
import pandas as pd
import pdfplumber
import re
import logging

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../models/xgb_model.pkl")
ENCODER_PATH = os.path.join(BASE_DIR, "../models/label_encoder.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    with open(ENCODER_PATH, "rb") as f:
        label_encoder = pickle.load(f)
    logger.info("✅ Modèle IA chargé")
except Exception as e:
    logger.error(f"Erreur chargement modèle IA : {e}")
    model = None
    label_encoder = None

HEALTH_CLASSES = {
    "0": "Diabetes",
    "1": "Heart Di",
    "2": "Healthy",
    "3": "Thalasse",
    "4": "Anemia",
    "5": "Thromboc",
}

REQUIRED_COLUMNS = [
    "Glucose", "Cholesterol", "Hemoglobin", "Platelets",
    "White Blood Cells", "Red Blood Cells", "Hematocrit",
    "Mean Corpuscular Volume", "Mean Corpuscular Hemoglobin",
    "Mean Corpuscular Hemoglobin Concentration", "Insulin", "BMI",
    "Systolic Blood Pressure", "Diastolic Blood Pressure", "Triglycerides",
    "HbA1c", "LDL Cholesterol", "HDL Cholesterol", "ALT", "AST",
    "Heart Rate", "Creatinine", "Troponin", "C-reactive Protein",
]


def get_recommendations(prediction_label: str):
    recos = {
        "Diabetes": [
            "Surveillez votre glycémie régulièrement",
            "Maintenez une alimentation équilibrée",
            "Faites de l'exercice régulièrement",
            "Consultez un diabétologue",
        ],
        "Heart Di": [
            "Surveillez votre tension artérielle",
            "Évitez les aliments riches en sel",
            "Faites de l'exercice modéré",
            "Consultez un cardiologue",
        ],
        "Healthy": [
            "Continuez à maintenir un mode de vie sain",
            "Faites des bilans réguliers",
            "Maintenez une alimentation équilibrée",
            "Faites de l'exercice régulièrement",
        ],
        "Thalasse": [
            "Consultez un hématologue",
            "Surveillez votre taux de fer",
            "Évitez les carences en vitamines",
            "Faites des bilans sanguins réguliers",
        ],
        "Anemia": [
            "Augmentez votre consommation de fer",
            "Prenez des suppléments si prescrits",
            "Surveillez votre alimentation",
            "Consultez un médecin pour un suivi",
        ],
        "Thromboc": [
            "Surveillez votre numération plaquettaire",
            "Évitez les activités à risque de saignement",
            "Consultez un hématologue",
            "Faites des bilans sanguins réguliers",
        ],
    }
    return recos.get(prediction_label, ["Consultez un professionnel de santé."])


def extract_table_from_pdf(file_storage):
    with pdfplumber.open(file_storage) as pdf:
        text = pdf.pages[0].extract_text()
        if not text:
            raise ValueError("Aucun texte détecté dans le PDF")

        values = {}
        for line in text.split("\n"):
            if ":" in line or "|" in line or "Page" in line:
                continue
            match = re.search(r"(.+?)\s+([-+]?\d*\.?\d+)$", line)
            if match:
                key = match.group(1).strip()
                val = match.group(2).strip()
                try:
                    values[key] = float(val)
                except ValueError:
                    continue

        if not values:
            raise ValueError("Aucune donnée numérique extraite du PDF")

        return pd.DataFrame([values])


def dataframe_from_uploaded_file(file_storage):
    filename = file_storage.filename.lower()
    if filename.endswith(".pdf"):
        df = extract_table_from_pdf(file_storage)
    elif filename.endswith(".csv"):
        df = pd.read_csv(file_storage)
    else:
        raise ValueError("Format non supporté (utiliser CSV ou PDF).")

    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise ValueError(f"Colonnes manquantes : {', '.join(missing)}")

    return df[REQUIRED_COLUMNS]


def run_prediction_on_file(file_storage):
    if model is None or label_encoder is None:
        raise RuntimeError("Modèle IA non chargé.")

    df = dataframe_from_uploaded_file(file_storage)
    preds = model.predict(df)
    proba = model.predict_proba(df)[0]
    total = proba.sum()
    if total <= 0:
        raise RuntimeError("Somme des probabilités nulle.")
    proba = proba / total

    prediction_label = label_encoder.inverse_transform(preds)[0]

    probabilities = {
        HEALTH_CLASSES[str(i)]: float(p) * 100.0 for i, p in enumerate(proba)
    }

    max_class, _ = max(probabilities.items(), key=lambda x: x[1])
    if max_class != prediction_label:
        prediction_label = max_class

    recommendations = get_recommendations(prediction_label)

    return {
        "prediction": prediction_label,
        "probabilities": probabilities,
        "recommendations": recommendations,
    }
