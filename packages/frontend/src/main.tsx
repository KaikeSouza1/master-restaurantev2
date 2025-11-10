// master-restaurante-v2/packages/frontend/src/main.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import ReactModal from 'react-modal';

// 1. IMPORTAR O SEU TOAST PROVIDER
import { ToastProvider } from './components/ToastProvider.tsx';

import './index.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactModal.setAppElement(rootElement);
}

ReactDOM.createRoot(rootElement!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        {/* 2. ADICIONAR O COMPONENTE AQUI */}
        <ToastProvider />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
);