import React from "react";
// ou sinon tu fais une version plus simple

const HomePatient = () => {
  return (
    <div className="patient-home">
      <header className="patient-header">
        <h1>Bienvenue dans votre espace patient</h1>
        <p>Consultez vos rendez-vous et votre dossier médical.</p>
      </header>

      <main className="patient-main">
        <section className="patient-section">
          <h2>Mes rendez-vous</h2>
          <p>(Plus tard : liste des rendez-vous du patient connecté)</p>
        </section>
        <section className="patient-section">
          <h2>Mon dossier médical</h2>
          <p>(Plus tard : résumé du dossier, fichiers, etc.)</p>
        </section>
      </main>
    </div>
  );
};

export default HomePatient;
