import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{
      v7_startTransition: true, // Opt-in for startTransition behavior
      v7_relativeSplatPath: true, // Opt-in for new relative splat path behavior
    }}
  >
    <App />
  </BrowserRouter>
);
