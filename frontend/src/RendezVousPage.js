import React, { useState } from "react";
import { FiCalendar, FiClock, FiUsers, FiBarChart2 } from "react-icons/fi";
import CalendrierRendezVous from "./CalendrierRendezVous";
import FormulaireRendezVous from "./FormulaireRendezVous";
import ListeRendezVous from "./ListeRendezVous";
import Sidebar from "./Sidebar";

function RendezVousPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [refresh, setRefresh] = useState(false);

  const todayStats = {
    total: 8,
    completed: 5,
    upcoming: 3,
    cancelled: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        active="rendezvous"
      />

      <div className={`transition-all duration-300 min-h-screen ${sidebarOpen ? "ml-72" : "ml-20"}`}>
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-800 via-royalblue-900 to-blue-900 text-white p-8 -mt-8 -mx-8 mb-8 shadow-2xl border-b-4 border-gold-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm border border-white/30">
                  <FiCalendar className="text-2xl text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white">Gestion des Rendez-vous</h1>
                  <p className="text-blue-100 mt-2 text-lg">
                    Planification intelligente avec suivi en temps réel
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <div className="text-blue-200 text-sm">Hôpital NeoHealth</div>
                <div className="text-white font-semibold">Service de Planification</div>
              </div>
            </div>
          </div>

          {/* Stats Today */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm opacity-90">Total Aujourd'hui</div>
                  <div className="text-2xl font-bold text-white">{todayStats.total}</div>
                </div>
                <FiCalendar className="text-2xl text-white/70" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm opacity-90">Terminés</div>
                  <div className="text-2xl font-bold text-white">{todayStats.completed}</div>
                </div>
                <FiClock className="text-2xl text-white/70" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm opacity-90">À venir</div>
                  <div className="text-2xl font-bold text-white">{todayStats.upcoming}</div>
                </div>
                <FiUsers className="text-2xl text-white/70" />
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm opacity-90">Annulés</div>
                  <div className="text-2xl font-bold text-white">{todayStats.cancelled}</div>
                </div>
                <FiBarChart2 className="text-2xl text-white/70" />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Calendrier - 2 colonnes */}
            <div className="lg:col-span-2">
              <CalendrierRendezVous
                onDateSelect={setSelectedDate}
                refresh={refresh}
              />
            </div>

            {/* Formulaire - 1 colonne */}
            <div>
              <FormulaireRendezVous
                selectedDate={selectedDate}
                onSuccess={() => {
                  setRefresh(!refresh);
                  setSelectedDate(null);
                }}
              />
            </div>
          </div>

          {/* Liste des RDV */}
          <div>
            <ListeRendezVous refresh={refresh} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default RendezVousPage;