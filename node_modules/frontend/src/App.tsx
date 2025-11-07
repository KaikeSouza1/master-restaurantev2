// master-restaurante-v2/packages/frontend/src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { CardapioPage } from './pages/Cardapio';

import { MesasDashboard } from './pages/MesasDashboard';
import { KDS } from './pages/KDS';
import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/AdminLayout';

export default function App() {
  return (
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
          <Route path="/admin/kds" element={<KDS />} />
        </Route>
      </Route>
      
      {/* Rota de fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}