// src/Sidebar.js
import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiHome,
  FiUsers,
  FiCalendar,
  FiLogOut,
  FiMenu,
  FiX,
  FiUser,
  FiBriefcase,
  FiMapPin
} from "react-icons/fi";
import logo from "./assets/neohealth-logo.jpg";

function Sidebar({ sidebarOpen, setSidebarOpen, active }) {
  const navigate = useNavigate();

  // 🔹 Lecture des infos utilisateur depuis le localStorage
  const storedName = localStorage.getItem("userName");
  const storedEmail = localStorage.getItem("userEmail");
  const storedRole = localStorage.getItem("userRole");

  const displayName = storedName || storedEmail || "Administrateur";
  const displayRole = storedRole || "Admin";
  const initial = displayName?.charAt(0)?.toUpperCase() || "A";

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const navItems = [
    {
      key: "dashboard",
      label: "Tableau de Bord",
      icon: <FiHome className="text-xl" />,
      path: "/dashboard",
      section: "GÉNÉRAL",
    },
    {
      key: "patients",
      label: "Gestion Patients",
      icon: <FiUsers className="text-xl" />,
      path: "/patients",
      section: "GÉNÉRAL",
    },
    {
      key: "rendezvous",
      label: "Rendez-vous",
      icon: <FiCalendar className="text-xl" />,
      path: "/rendezvous",
      section: "GÉNÉRAL",
    },
    {
      key: "personnel",
      label: "Personnel Médical",
      icon: <FiUser className="text-xl" />,
      path: "/personnel",
      section: "ADMINISTRATION",
    },
    {
      key: "docteurs",
      label: "Médecins",
      icon: <FiBriefcase className="text-xl" />,
      path: "/docteurs",
      section: "ADMINISTRATION",
    },
    {
      key: "salles",
      label: "Salles & Blocs",
      icon: <FiMapPin className="text-xl" />,
      path: "/salles",
      section: "ADMINISTRATION",
    },
  ];

  const sections = [...new Set(navItems.map((item) => item.section))];

  return (
    <div
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-900 to-blue-800 text-white transition-all duration-300 z-40 shadow-2xl ${
        sidebarOpen ? "w-72" : "w-20"
      }`}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between p-6 border-b border-blue-700">
        {sidebarOpen ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
              <img
                src={logo}
                alt="NeoHealth"
                className="w-8 h-8 object-contain"
              />
            </div>
            <div>
              <h2 className="text-xl font-bold">NeoHealth</h2>
              <p className="text-xs text-blue-200">Medical Suite</p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 mx-auto rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
            <img
              src={logo}
              alt="NeoHealth"
              className="w-8 h-8 object-contain"
            />
          </div>
        )}

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-white/10 rounded-xl transition-colors"
        >
          {sidebarOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
        </button>
      </div>

      {/* Navigation */}
      <div className="p-4 overflow-y-auto h-[calc(100vh-180px)]">
        {sections.map((section) => (
          <div key={section} className="mb-6">
            {sidebarOpen && (
              <h3 className="px-4 mb-2 text-xs font-semibold text-blue-300 uppercase tracking-wider">
                {section}
              </h3>
            )}

            <div className="space-y-1">
              {navItems
                .filter((item) => item.section === section)
                .map((item) => (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.path)}
                    className={`flex items-center w-full px-4 py-3 rounded-xl transition-all duration-200 group ${
                      active === item.key
                        ? "bg-white/20 backdrop-blur-sm border border-white/30 shadow-lg"
                        : "hover:bg-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`${
                        active === item.key
                          ? "text-white"
                          : "text-blue-200 group-hover:text-white"
                      } transition-colors`}
                    >
                      {item.icon}
                    </div>

                    {sidebarOpen && (
                      <span className="ml-4 font-medium text-sm whitespace-nowrap">
                        {item.label}
                      </span>
                    )}

                    {!sidebarOpen && (
                      <div className="absolute left-16 bg-blue-800 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                        {item.label}
                      </div>
                    )}
                  </button>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* Logout + User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-700 bg-blue-900/50 backdrop-blur-sm">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 rounded-xl hover:bg-white/10 transition-colors group"
        >
          <FiLogOut className="text-xl text-blue-200 group-hover:text-white" />
          {sidebarOpen && (
            <span className="ml-4 font-medium text-sm whitespace-nowrap">
              Déconnexion
            </span>
          )}
          {!sidebarOpen && (
            <div className="absolute left-16 bg-blue-800 text-white px-3 py-2 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
              Déconnexion
            </div>
          )}
        </button>

        {sidebarOpen && (
          <div className="mt-4 pt-4 border-t border-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-white border-2 border-white/30">
                {initial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {displayName}
                </p>
                <p className="text-xs text-blue-300 truncate">
                  {displayRole}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
