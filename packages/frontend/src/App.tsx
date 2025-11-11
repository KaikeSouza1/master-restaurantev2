// packages/frontend/src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { CardapioPage } from './pages/Cardapio';

import { MesasDashboard } from './pages/MesasDashboard';
import { HistoricoPedidos } from './pages/HistoricoPedidos';
import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider } from './components/ToastProvider';

export default function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/registrar" element={<RegisterPage />} />
        <Route path="/cardapio" element={<CardapioPage />} />
        
        {/* Rota raiz */}
        <Route path="/" element={<Navigate to="/cardapio" replace />} />

        {/* ========================================================== */}
        {/* ROTAS EXCLUSIVAS DE ADMIN */}
        {/* ========================================================== */}
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/mesas" replace />}
            />
            <Route path="/admin/mesas" element={<MesasDashboard />} />
            <Route path="/admin/historico" element={<HistoricoPedidos />} />
            <Route 
              path="/admin/configuracoes" 
              element={
                <div className="p-8 bg-white rounded-xl shadow-lg">
                  <h1 className="text-2xl font-bold text-zinc-800 mb-4">Configurações</h1>
                  <p className="text-zinc-600">Em desenvolvimento...</p>
                </div>
              } 
            />
          </Route>
        </Route>
        
        {/* Rota de fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}