// packages/frontend/src/App.tsx

import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/Login';
// REMOVIDO: RegisterPage
// REMOVIDO: CardapioPage

import { MesasDashboard } from './pages/MesasDashboard';
// REMOVIDO: HistoricoPedidos
import { AdminGuard } from './components/AdminGuard';
import { AdminLayout } from './components/AdminLayout';
import { ToastProvider } from './components/ToastProvider';

// Imports da Comanda Mobile (Mantidos)
import { MobileSelecaoMesa } from './pages/MobileSelecaoMesa';
import { MobileCardapio } from './pages/MobileCardapio';
import { MobileRevisaoPedido } from './pages/MobileRevisaoPedido';

export default function App() {
  return (
    <>
      <ToastProvider />
      <Routes>
        {/* Rota de Login (agora a principal) */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Rotas Públicas REMOVIDAS */}
        {/* <Route path="/registrar" element={<RegisterPage />} /> */}
        {/* <Route path="/cardapio" element={<CardapioPage />} /> */}
        
        {/* Rota raiz: Redireciona para /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* ========================================================== */}
        {/* ROTAS EXCLUSIVAS DE ADMIN (PC) */}
        {/* ========================================================== */}
        <Route element={<AdminGuard />}>
          <Route element={<AdminLayout />}>
            <Route
              path="/admin"
              element={<Navigate to="/admin/mesas" replace />}
            />
            <Route path="/admin/mesas" element={<MesasDashboard />} />
            {/* Rota de histórico do cliente removida */}
            {/* <Route path="/admin/historico" element={<HistoricoPedidos />} /> */}
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
        
        {/* ================================================== */}
        {/* NOVAS ROTAS DA COMANDA MOBILE */}
        {/* ================================================== */}
        <Route path="/mobile" element={<MobileSelecaoMesa />} />
        <Route path="/mobile/mesa/:codseq" element={<MobileCardapio />} />
        <Route path="/mobile/mesa/:codseq/revisao" element={<MobileRevisaoPedido />} />
        
        {/* Rota de fallback: Redireciona para /login */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}