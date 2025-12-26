import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Import the main styles entry point which imports all other style modules
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
