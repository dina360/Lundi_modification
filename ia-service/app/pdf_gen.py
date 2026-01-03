from fpdf import FPDF
import random
import os
from datetime import datetime

OUTPUT_DIR = "app/test_files"

PARAMS = [
    "Glucose",
    "Cholesterol",
    "Hemoglobin",
    "Platelets",
    "White Blood Cells",
    "Red Blood Cells",
    "Hematocrit",
    "Mean Corpuscular Volume",
    "Mean Corpuscular Hemoglobin",
    "Mean Corpuscular Hemoglobin Concentration",
    "Insulin",
    "BMI",
    "Systolic Blood Pressure",
    "Diastolic Blood Pressure",
    "Triglycerides",
    "HbA1c",
    "LDL Cholesterol",
    "HDL Cholesterol",
    "ALT",
    "AST",
    "Heart Rate",
    "Creatinine",
    "Troponin",
    "C-reactive Protein",
]

def generate_profile(profile_name: str):
    """
    Génère un dictionnaire {paramètre: valeur}
    avec des plages différentes selon le profil choisi.
    Les valeurs restent entre 0 et 1 car le modèle a été entraîné normalisé.
    """

    # Base "healthy" : valeurs moyennes
    data = {p: round(random.uniform(0.4, 0.6), 6) for p in PARAMS}

    if profile_name == "healthy":
        # on garde les valeurs proches de la moyenne
        return data

    if profile_name == "diabetes":
        data["Glucose"] = round(random.uniform(0.8, 1.0), 6)
        data["HbA1c"] = round(random.uniform(0.8, 1.0), 6)
        data["Insulin"] = round(random.uniform(0.7, 1.0), 6)
        data["BMI"] = round(random.uniform(0.7, 1.0), 6)
        data["Triglycerides"] = round(random.uniform(0.7, 1.0), 6)
        return data

    if profile_name == "heart":
        data["Cholesterol"] = round(random.uniform(0.8, 1.0), 6)
        data["LDL Cholesterol"] = round(random.uniform(0.8, 1.0), 6)
        data["HDL Cholesterol"] = round(random.uniform(0.1, 0.3), 6)  # plutôt bas
        data["Systolic Blood Pressure"] = round(random.uniform(0.8, 1.0), 6)
        data["Diastolic Blood Pressure"] = round(random.uniform(0.8, 1.0), 6)
        data["Troponin"] = round(random.uniform(0.7, 1.0), 6)
        data["Heart Rate"] = round(random.uniform(0.7, 1.0), 6)
        return data

    if profile_name == "anemia":
        data["Hemoglobin"] = round(random.uniform(0.1, 0.3), 6)
        data["Hematocrit"] = round(random.uniform(0.1, 0.3), 6)
        data["Red Blood Cells"] = round(random.uniform(0.1, 0.3), 6)
        return data

    if profile_name == "thalasse":
        data["Hemoglobin"] = round(random.uniform(0.2, 0.4), 6)
        data["Red Blood Cells"] = round(random.uniform(0.7, 0.9), 6)
        data["Mean Corpuscular Volume"] = round(random.uniform(0.1, 0.3), 6)
        data["Mean Corpuscular Hemoglobin"] = round(random.uniform(0.1, 0.3), 6)
        data["Mean Corpuscular Hemoglobin Concentration"] = round(random.uniform(0.1, 0.3), 6)
        return data

    # profil par défaut : valeurs aléatoires
    return {p: round(random.uniform(0.1, 1.0), 6) for p in PARAMS}


class PDF(FPDF):
    def header(self):
        logo_path = "app/routes/download.png"

        # Filigrane
        if os.path.exists(logo_path):
            self.set_text_color(200, 200, 200)
            self.set_font("Arial", "B", 60)
            self.set_xy(40, 80)
            self.cell(130, 130, "HOPITAL", 0, 0, "C")
            self.set_text_color(0, 0, 0)

        # Logo
        if os.path.exists(logo_path):
            self.image(logo_path, 10, 5, 15)

        # Titre
        self.set_font("Arial", "B", 14)
        self.set_xy(0, 5)
        self.cell(210, 8, "RAPPORT D'ANALYSES MÉDICALES", 0, 1, "C")

        # Date + infos patient (générées)
        self.set_font("Arial", "I", 9)
        self.cell(210, 6, f"Date: {datetime.now().strftime('%d/%m/%Y')}", ln=1, align="C")

        self.set_font("Arial", "", 9)
        self.cell(210, 4, "Nom: PATIENT", ln=1, align="L")
        self.cell(
            210,
            4,
            "Date de naissance: "
            + f"{random.randint(1,28)}/{random.randint(1,12)}/{random.randint(1980,2005)}",
            ln=1,
            align="L",
        )

        self.set_draw_color(0, 0, 0)
        self.line(10, self.get_y() + 2, 200, self.get_y() + 2)
        self.ln(4)

    def footer(self):
        self.set_y(-10)
        self.set_font("Arial", "I", 8)
        self.cell(
            0,
            5,
            f"Page {self.page_no()} - Ce rapport est généré automatiquement par le système",
            align="C",
        )

    def add_vertical_table(self, data_map):
        self.set_font("Arial", "B", 11)
        self.cell(0, 6, "RÉSULTATS DES ANALYSES", ln=1, align="L")
        self.ln(2)

        self.set_font("Arial", "B", 10)
        self.set_fill_color(200, 200, 200)
        self.cell(120, 6, "PARAMÈTRE", 0, 0, "L", True)
        self.cell(70, 6, "VALEUR", 0, 1, "C", True)

        self.set_font("Arial", "", 9)
        for key, value in data_map.items():
            fill = (240, 240, 240) if int(self.get_y()) % 2 == 0 else (255, 255, 255)
            self.set_fill_color(*fill)
            label = f"{key:<35}"
            val_text = f"{value}"
            self.cell(120, 5, label, 0, 0, "L", True)
            self.cell(70, 5, val_text, 0, 1, "C", True)


def generate_pdf_for_profile(profile_name: str):
    data_map = generate_profile(profile_name)
    pdf = PDF()
    pdf.add_page()
    pdf.add_vertical_table(data_map)

    os.makedirs(OUTPUT_DIR, exist_ok=True)
    output_path = os.path.join(OUTPUT_DIR, f"test_{profile_name}.pdf")
    pdf.output(output_path)
    print(f"✅ PDF généré pour profil '{profile_name}' : {output_path}")


if __name__ == "__main__":
    profiles = ["healthy", "diabetes", "heart", "anemia", "thalasse"]
    for p in profiles:
        generate_pdf_for_profile(p)
