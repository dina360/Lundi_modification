from flask import Blueprint, request, jsonify
from .ia_prediction_service import run_prediction_on_file

bp = Blueprint("prediction", __name__)

@bp.route("/analyze", methods=["POST"])
def analyze():
    try:
        if "file" not in request.files:
            return jsonify({"error": "Aucun fichier envoyé"}), 400

        f = request.files["file"]  # FileStorage (a filename)
        result = run_prediction_on_file(f)
        return jsonify(result)

    except Exception as e:
        print("Erreur IA:", str(e))
        return jsonify({"error": "Erreur interne du service IA"}), 500
