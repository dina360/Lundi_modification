// src/PredictionPatient.js
import React, { useState } from "react";
import axios from "axios";
import "./PredictionPatient.css";

const API_URL = "http://localhost:5000/api/prediction/analyze";
 // le backend Node redirige vers Flask

function PredictionPatient() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [result, setResult] = useState(null); // { prediction, probabilities, recommendations }

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file || null);
    setPreviewName(file ? file.name : "");
    setErrorMsg("");
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setResult(null);

    if (!selectedFile) {
      setErrorMsg("Veuillez d'abord sélectionner un fichier d'analyse.");
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setResult(response.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.error ||
          "Une erreur est survenue lors de l'analyse IA."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderProbabilities = () => {
    if (!result || !result.probabilities) return null;

    const entries = Object.entries(result.probabilities);

    return (
      <div className="pred-proba-list">
        {entries.map(([disease, value]) => {
          const percent = Number(value).toFixed(1);
          return (
            <div className="pred-proba-row" key={disease}>
              <div className="pred-proba-row-header">
                <span className="pred-proba-disease">{disease}</span>
                <span className="pred-proba-percent">{percent}%</span>
              </div>
              <div className="pred-proba-bar-container">
                <div
                  className="pred-proba-bar-fill"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!result || !result.recommendations) return null;

    return (
      <ul className="pred-reco-list">
        {result.recommendations.map((rec, index) => (
          <li key={index} className="pred-reco-item">
            <span className="pred-reco-bullet">•</span>
            <span>{rec}</span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="prediction-page">
      <header className="prediction-header">
        <div>
          <h1>Prédiction de Santé (IA)</h1>
          <p>
            Téléchargez vos analyses (CSV ou PDF). Le système IA estime la
            maladie la plus probable et propose des recommandations.
          </p>
        </div>
      </header>

      <div className="prediction-layout">
        {/* Colonne gauche : upload + infos fichier */}
        <section className="prediction-card upload-card">
          <h2>1. Importer un fichier d'analyse</h2>
          <p className="upload-help">
            Formats acceptés : <strong>CSV</strong> ou <strong>PDF</strong>.
          </p>

          <form onSubmit={handleSubmit} className="upload-form">
            <label className="file-input-label">
              <span className="file-input-title">Fichier d'analyse</span>
              <input
                type="file"
                accept=".csv,.pdf"
                onChange={handleFileChange}
              />
            </label>

            {previewName && (
              <p className="file-preview">
                Fichier sélectionné : <span>{previewName}</span>
              </p>
            )}

            {errorMsg && (
              <div className="pred-alert pred-alert-error">{errorMsg}</div>
            )}

            <button
              type="submit"
              className="btn-analyze"
              disabled={loading || !selectedFile}
            >
              {loading ? "Analyse en cours..." : "Lancer l'analyse IA"}
            </button>
          </form>

          <div className="prediction-hint">
            <h3>Conseils d'utilisation</h3>
            <ul>
              <li>Utilisez les rapports générés par le laboratoire.</li>
              <li>Les valeurs doivent correspondre aux analyses sanguines.</li>
              <li>
                Le résultat reste une aide à la décision, pas un diagnostic
                définitif.
              </li>
            </ul>
          </div>
        </section>

        {/* Colonne droite : résultats */}
        <section className="prediction-card result-card">
          <h2>2. Résultats de la prédiction</h2>

          {!result && !loading && (
            <div className="result-placeholder">
              <p>
                Aucun résultat pour le moment. Importez un fichier et lancez
                l'analyse pour afficher les prédictions.
              </p>
            </div>
          )}

          {result && (
            <>
              {/* Résultat principal */}
              <div className="pred-main-result">
                <span className="pred-main-label">Résultat principal :</span>
                <span className="pred-main-badge">{result.prediction}</span>
              </div>

              {/* Probabilités */}
              <div className="pred-section">
                <h3>Probabilités par maladie</h3>
                {renderProbabilities()}
              </div>

              {/* Recommandations */}
              <div className="pred-section">
                <h3>Recommandations personnalisées</h3>
                {renderRecommendations()}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default PredictionPatient;
