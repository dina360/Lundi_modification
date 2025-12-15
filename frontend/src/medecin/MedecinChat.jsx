import React, { useState, useEffect, useRef } from "react";
import { FiX, FiSend, FiUsers, FiLoader } from "react-icons/fi";
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

export default function MedecinChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [roomId, setRoomId] = useState(null);
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const fetchRef = useRef({ roomCalled: false, messagesCalled: false });

  const medecin = JSON.parse(localStorage.getItem("medecin"));
  const token = localStorage.getItem("authToken");

  // 🔹 Charger ou créer le salon
  useEffect(() => {
    if (!isOpen || !medecin || !medecin.specialty) return;
    if (fetchRef.current.roomCalled) return;

    fetchRef.current.roomCalled = true;

    const fetchRoom = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`http://localhost:5000/api/chat/room/${medecin.specialty}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Erreur serveur: ${res.status}`);
        }

        const room = await res.json();
        setRoomId(room._id);
        setSpecialty(room.name);
      } catch (err) {
        console.error('Erreur chargement salon:', err);
        setError("Impossible de charger le salon de discussion.");
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [isOpen, medecin, token]);

  // 🔹 Charger les messages
  useEffect(() => {
    if (!roomId) return;
    if (fetchRef.current.messagesCalled) return;

    fetchRef.current.messagesCalled = true;

    const fetchMessages = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/chat/messages/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          throw new Error(`Erreur serveur: ${res.status}`);
        }

        const messages = await res.json();
        setMessages(messages);
      } catch (err) {
        console.error('Erreur chargement messages:', err);
        setError("Impossible de charger les messages.");
      }
    };

    fetchMessages();
  }, [roomId, token]);

  // 🔹 Socket.io : Rejoindre le salon et écouter les nouveaux messages
  useEffect(() => {
    if (!roomId) return;

    socket.emit('joinRoom', roomId);

    const handleNewMessage = (msg) => {
      console.log(" 🔁 Nouveau message reçu via socket:", msg); // ✅ Log
      setMessages(prev => [...prev, msg]); // ✅ Ajouter le message à la liste
    };

    socket.on('newMessage', handleNewMessage);

    return () => {
      socket.off('newMessage', handleNewMessage);
    };
  }, [roomId]); // ✅ Important : roomId dans les dépendances

  // 🔁 Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleChat = () => {
    if (isOpen) {
      fetchRef.current = { roomCalled: false, messagesCalled: false };
    }
    setIsOpen(!isOpen);
  };

  const handleSend = async () => {
    if (inputValue.trim() === "") return;
    if (!roomId) {
      alert("Le salon n'est pas encore chargé. Veuillez patienter.");
      return;
    }

    const newMessage = {
      text: inputValue,
      roomId,
      sender: medecin.name,
    };

    try {
      const res = await fetch('http://localhost:5000/api/chat/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roomId, text: inputValue }),
      });

      if (!res.ok) {
        throw new Error(`Erreur serveur: ${res.status}`);
      }

      const savedMessage = await res.json();

      // ✅ Émettre via Socket.io pour mise à jour en temps réel
      socket.emit('sendMessage', savedMessage);

      setInputValue(""); // ✅ Réinitialiser le champ
    } catch (err) {
      console.error('Erreur envoi message:', err);
      setError("Erreur lors de l'envoi du message.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Bouton flottant pour ouvrir le chat */}
      <button
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-indigo-800 transition-all z-50 flex items-center justify-center w-14 h-14"
        onClick={toggleChat}
      >
        <FiUsers size={24} />
      </button>

      {/* Chat Modal */}
      {isOpen && (
        <div className="fixed bottom-32 right-6 w-96 h-[450px] bg-white rounded-xl shadow-2xl z-50 flex flex-col border border-gray-200 overflow-hidden">
          {/* En-tête */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-3 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <FiUsers size={18} />
              <h3 className="font-semibold truncate max-w-[180px]">
                {specialty || "Chargement..."}
              </h3>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:bg-black/10 p-1 rounded-full"
            >
              <FiX size={20} />
            </button>
          </div>

          {/* Zone de messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <FiLoader className="animate-spin text-blue-500" size={24} />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center">{error}</p>
            ) : messages.length === 0 ? (
              <p className="text-gray-500 text-center">Aucun message.</p>
            ) : (
              <ul className="space-y-3">
                {messages.map((msg) => (
                  <li
                    key={msg._id}
                    className={`p-3 rounded-2xl max-w-[85%] ${
                      msg.sender._id === medecin.id
                        ? "bg-blue-100 ml-auto rounded-tr-none"
                        : "bg-gray-100 mr-auto rounded-tl-none"
                    }`}
                  >
                    <div className="font-semibold text-sm text-gray-700">{msg.sender.name}</div>
                    <div className="text-gray-800">{msg.text}</div>
                    <div className="text-xs text-gray-500 text-right mt-1">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </li>
                ))}
                <div ref={messagesEndRef} />
              </ul>
            )}
          </div>

          {/* Zone d'envoi */}
          <div className="p-3 bg-white border-t border-gray-200 flex">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre message..."
              className="flex-1 border border-gray-300 rounded-lg p-2 resize-none h-12 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={!roomId}
            />
            <button
              onClick={handleSend}
              className="ml-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 flex items-center justify-center w-12"
              disabled={!roomId}
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}