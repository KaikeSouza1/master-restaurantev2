// packages/frontend/src/components/ToastProvider.tsx

import { Toaster } from 'react-hot-toast';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        // Estilos padrão para todos os toasts
        duration: 4000,
        style: {
          background: '#fff',
          color: '#1e293b',
          padding: '16px',
          borderRadius: '12px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          fontWeight: '600',
          fontSize: '14px',
        },
        // Sucesso (verde)
        success: {
          duration: 3000,
          iconTheme: {
            primary: '#10b981',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #10b981',
          },
        },
        // Erro (vermelho)
        error: {
          duration: 5000,
          iconTheme: {
            primary: '#ef4444',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #ef4444',
          },
        },
        // Loading (azul)
        loading: {
          iconTheme: {
            primary: '#2563eb',
            secondary: '#fff',
          },
          style: {
            border: '2px solid #2563eb',
          },
        },
      }}
    />
  );
}