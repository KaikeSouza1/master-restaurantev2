// master-restaurante-v2/packages/frontend/src/components/Header.tsx

import { useState, useEffect } from 'react';
import { getEmpresaInfo } from '../services/api';
import type { EmpresaInfo } from '../types';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Utensils, LogIn, LogOut } from 'lucide-react';

function Header() {
  const [empresa, setEmpresa] = useState<EmpresaInfo | null>(null);
  const { user, logout } = useAuth(); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmpresaInfo()
      .then(setEmpresa)
      .catch(err => console.error("Falha ao buscar empresa", err))
      .finally(() => setLoading(false));
  }, []);

  const nomeCurto = user?.nome.split(' ')[0] || 'Cliente';

  return (
    <header className="bg-brand-blue-dark text-white p-4 shadow-xl">
      <div className="container mx-auto flex justify-between items-center">
        
        {/* Lado Esquerdo: Info da Empresa */}
        <div className='flex items-center space-x-3'>
            <Utensils size={32} className='text-brand-accent'/>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-white/30 rounded w-48 mb-1"></div>
              <div className="h-3 bg-white/30 rounded w-64"></div>
            </div>
          ) : empresa ? (
            <div>
              <h1 className="text-xl font-bold">{empresa.nome}</h1>
              <p className="text-sm opacity-80">
                {empresa.cidade} - {empresa.fone}
              </p>
            </div>
          ) : (
             <h1 className="text-xl font-bold">Restaurante Master</h1>
          )}
        </div>

        {/* Lado Direito: Info do Usuário */}
        <div className="text-right flex items-center space-x-4">
          {user ? (
            // SE ESTIVER LOGADO
            <div className='flex items-center space-x-2'>
                <p className="text-sm">Olá, <span className="font-bold">{nomeCurto}</span>!</p>
                <button 
                  onClick={logout}
                  className="text-sm font-medium bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20 flex items-center space-x-1 transition-all"
                >
                  <LogOut size={16} />
                  <span>Sair</span>
                </button>
            </div>
          ) : (
            // SE ESTIVER DESLOGADO, MOSTRA O BOTÃO "ENTRAR"
            <Link 
              to="/login"
              className="bg-brand-accent text-white px-4 py-2 rounded-lg font-bold hover:bg-brand-accent/80 transition-all flex items-center space-x-2 shadow-md"
            >
              <LogIn size={18} />
              <span>Entrar</span>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}

export default Header;