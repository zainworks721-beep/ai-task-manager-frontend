import React from 'react';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';

import '@fontsource-variable/inter';
import './index.css';

import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>

    <Toaster
      position="bottom-center"
      gutter={10}
      containerClassName="!z-[100]"
      toastOptions={{
        duration: 3200,
        className: 'tf-toast',
        style: {
          background: 'rgba(21, 27, 39, 0.92)',
          backdropFilter: 'blur(18px) saturate(160%)',
          WebkitBackdropFilter: 'blur(18px) saturate(160%)',
          color: '#e8edf6',
          border: '1px solid rgba(56, 68, 92, 0.9)',
          borderRadius: '14px',
          padding: '12px 16px',
          fontSize: '13px',
          fontWeight: 500,
          letterSpacing: '-0.006em',
          maxWidth: 'min(92vw, 420px)',
          boxShadow:
            '0 1px 0 0 rgba(255,255,255,0.06) inset, 0 18px 44px -16px rgba(0,0,0,0.75), 0 2px 8px -2px rgba(0,0,0,0.5)',
        },
        success: {
          duration: 2600,
          iconTheme: { primary: '#10b981', secondary: '#ffffff' },
        },
        error: {
          duration: 5000,
          iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
        },
        loading: {
          duration: Infinity,
          iconTheme: { primary: '#4f46e5', secondary: '#ffffff' },
        },
      }}
    />
  </React.StrictMode>
);
