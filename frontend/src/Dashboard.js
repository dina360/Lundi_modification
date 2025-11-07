// src/Dashboard.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { useNavigate } from 'react-router-dom';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [totalPatients, setTotalPatients] = useState(0);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: { color: '#6B7280' }
      },
      title: { 
        display: true, 
        text: 'Nouveaux patients par mois',
        color: '#111827',
        font: { size: 18 }
      }
    },
    scales: {
      x: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#6B7280' }
      },
      y: {
        grid: { color: '#F3F4F6' },
        ticks: { color: '#6B7280' }
      }
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, totalRes, appointmentsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/dashboard/stats'),
          axios.get('http://localhost:5000/api/dashboard/total'),
          axios.get('http://localhost:5000/api/dashboard/appointments-today')
        ]);

        setChartData({
          labels: statsRes.data.labels,
          datasets: [{
            label: 'Nouveaux patients',
            data: statsRes.data.values,
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
          }]
        });

        setTotalPatients(totalRes.data.total);
        setTodayAppointments(appointmentsRes.data.appointments);
        setLoading(false);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-2xl text-indigo-600">
          Chargement en cours...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button 
          onClick={() => navigate(-1)}
          className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Retour
        </button>

        <h2 className="text-4xl font-bold text-gray-900 mb-8">Tableau de bord médical</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-white to-indigo-50 p-6 rounded-2xl shadow-xl border border-indigo-50 transition-transform duration-200 hover:scale-105">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">Patients totaux</h3>
                <p className="text-5xl font-bold text-indigo-600">{totalPatients}</p>
              </div>
              <div className="bg-indigo-100 p-4 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-600" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Rendez-vous aujourd'hui
            </h3>
            {todayAppointments.length > 0 ? (
              <ul className="space-y-4">
                {todayAppointments.map((appointment, index) => (
                  <li 
                    key={index} 
                    className="group flex justify-between items-center p-4 bg-gray-50 rounded-xl transition-all duration-200 hover:bg-indigo-50 cursor-pointer border-l-4 border-indigo-200 hover:border-indigo-400"
                  >
                    <div>
                      <span className="font-semibold text-gray-800 group-hover:text-indigo-700">{appointment.patient}</span>
                      <span className="block text-sm text-gray-500 group-hover:text-indigo-500">{appointment.type}</span>
                    </div>
                    <span className="text-gray-600 group-hover:text-indigo-600">
                      {new Date(appointment.date).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 italic">Aucun rendez-vous prévu aujourd'hui</p>
              </div>
            )}
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
                <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
              </svg>
              Statistiques des patients
            </h3>
            <div className="h-96">
              {chartData ? (
                <Bar data={chartData} options={chartOptions} />
              ) : (
                <div className="animate-pulse flex space-x-4">
                  <div className="flex-1 space-y-4 py-1">
                    <div className="h-64 bg-gray-100 rounded"></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;