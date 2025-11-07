// master-restaurante-v2/packages/frontend/src/pages/Login.tsx

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import type { LoginDto, User } from '../types';
import { jwtDecode } from 'jwt-decode';
import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export function LoginPage() {
  const [loginField, setLoginField] = useState('');
  const [senha, setSenha] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login: authLogin, user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const credentials: LoginDto = { login: loginField, senha };

    try {
      const { access_token } = await login(credentials);
      authLogin(access_token); 

      const decodedUser = jwtDecode<User>(access_token);
      
      // CORREÇÃO: Redireciona corretamente baseado no role
      if (decodedUser.role === 'admin') {
        navigate('/admin/mesas', { replace: true });
      } else {
        navigate('/cardapio', { replace: true });
      }

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login. Credenciais inválidas ou serviço indisponível.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Se já estiver logado, redireciona
  if (user) {
    if (user.role === 'admin') {
        return <Navigate to="/admin/mesas" replace />;
    }
    return <Navigate to="/cardapio" replace />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-gray-light">
      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-2xl"
      >
        <h1 className="text-3xl font-extrabold text-center text-brand-blue-dark mb-6 flex items-center justify-center space-x-2">
          <LogIn size={30} className='text-brand-accent'/>
          <span>Acesso ao Sistema</span>
        </h1>
        <p className="text-center text-zinc-500 mb-8">Administrador ou Cliente</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Email ou CPF</label>
            <input
              type="text"
              value={loginField}
              onChange={(e) => setLoginField(e.target.value)}
              className="w-full p-3 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
              placeholder="admin@teste.com"
              required
            />
          </div>
          <div>
            <label className="block font-semibold text-zinc-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-3 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"
              placeholder="123456"
              required
            />
          </div>

          {error && <p className="p-3 bg-red-100 border border-red-300 text-red-600 rounded-lg text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue-light text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-blue-dark transition-all disabled:opacity-50 shadow-md hover:shadow-lg"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-6 text-center text-zinc-600">
          Não tem uma conta?{' '}
          <Link to="/registrar" className="text-brand-blue-dark font-medium hover:underline">
            Crie uma aqui
          </Link>
        </p>
      </motion.div>
    </div>
  );
}