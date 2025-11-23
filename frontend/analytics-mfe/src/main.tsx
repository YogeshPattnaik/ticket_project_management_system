// Standalone mode - render App directly if running standalone
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Only render if running standalone (has root element and not loaded via Module Federation)
if (typeof window !== 'undefined' && document.getElementById('root')) {
  const root = document.getElementById('root');
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
}

