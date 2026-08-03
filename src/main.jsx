import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Application entry point — mounts <App /> into the #root element.
// StrictMode helps surface unsafe side effects during development;
// the clock's interval cleanup is written to be StrictMode-safe.
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
