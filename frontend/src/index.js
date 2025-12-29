import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Importer BrowserRouter pour gérer les routes
import App from './App';
import './index.css';

// Créer un root et rendre l'application avec BrowserRouter
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
  
);
