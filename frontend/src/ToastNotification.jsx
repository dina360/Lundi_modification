// src/ToastNotification.jsx

import React, { useEffect } from "react";
import { FiCheck, FiX, FiAlertCircle } from "react-icons/fi";

export default function ToastNotification({ message, type, onClose, duration = 3000 }) {
  // Types supportés : 'success', 'error', 'info'
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const icons = {
    success: <FiCheck className="text-green-500 text-xl" />,
    error: <FiX className="text-red-500 text-xl" />,
    info: <FiAlertCircle className="text-blue-500 text-xl" />,
  };

  const colors = {
    success: "bg-green-100 text-green-800 border-green-200",
    error: "bg-red-100 text-red-800 border-red-200",
    info: "bg-blue-100 text-blue-800 border-blue-200",
  };

  return (
    <div
      className={`fixed bottom-6 right-6 p-4 rounded-lg shadow-lg flex items-center space-x-3 border ${colors[type]} animate-fadeInOut`}
      style={{ zIndex: 1000 }}
    >
      {icons[type]}
      <span>{message}</span>
    </div>
  );
}