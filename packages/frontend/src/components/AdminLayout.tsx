// master-restaurante-v2/packages/frontend/src/components/AdminLayout.tsx

import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutGrid, ClipboardList, LogOut } from 'lucide-react';

export function AdminLayout() {
  const { logout, user } = useAuth();

  if (!user || user.role !== 'admin') {
      return <Navigate to="/login" replace />;
  }

  const baseStyle = "flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all";
  const activeStyle = "bg-brand-blue-dark text-white shadow-lg";
  const inactiveStyle = "text-zinc-600 hover:bg-brand-gray-mid";

  const getNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`;

  return (
    <div className="flex min-h-screen bg-brand-gray-light">
      {/* Sidebar */}
      <nav className="w-64 bg-white p-4 shadow-lg flex flex-col">
        <h1 className="text-2xl font-bold text-brand-blue-dark mb-8 border-b pb-4">
          Master V2 Admin
        </h1>
        
        <div className="flex flex-col space-y-2 flex-1">
          {/* Link para o Cardápio Removido */}
          <NavLink to="/admin/mesas" className={getNavLinkClass}>
            <LayoutGrid size={20} />
            <span>Gestão de Mesas</span>
          </NavLink>
          <NavLink to="/admin/kds" className={getNavLinkClass}>
            <ClipboardList size={20} />
            <span>Painel KDS</span>
          </NavLink>
        </div>

        {/* Rodapé do Usuário */}
        <div className="border-t pt-4">
          <p className="text-sm text-zinc-600">
            Admin:
            <span className="font-bold block truncate">{user.nome}</span>
          </p>
          <button
            onClick={logout}
            className={`${inactiveStyle} ${baseStyle} w-full mt-2 text-red-600 hover:bg-red-50`}
          >
            <LogOut size={20} />
            <span>Sair</span>
          </button>
        </div>
      </nav>

      {/* Conteúdo da Página */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}