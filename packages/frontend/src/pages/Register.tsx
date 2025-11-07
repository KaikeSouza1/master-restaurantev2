// master-restaurante-v2/packages/frontend/src/pages/Register.tsx

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { RegistrarClienteDto } from '../types';
import { registrarCliente } from '../services/api';
import { motion } from 'framer-motion';
import { UserPlus } from 'lucide-react';

export function RegisterPage() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [senha, setSenha] = useState('');
  
  const [error, setError] = useState<string | null>(null); 
  const [success, setSuccess] = useState<string | null>(null); 
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Remoção de formatação de CPF e telefone para enviar apenas dígitos (se necessário)
    const newClient: RegistrarClienteDto = { 
        nome, 
        email, 
        cpf: cpf.replace(/\D/g, ''), 
        telefone: telefone.replace(/\D/g, ''), 
        senha 
    };

    try {
      await registrarCliente(newClient);
      
      setSuccess('Registro realizado com sucesso! Redirecionando para o login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao registrar. Email ou CPF já pode estar em uso.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-gray-light p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg p-8 bg-white rounded-xl shadow-2xl"
      >
        <h1 className="text-3xl font-extrabold text-center text-brand-blue-dark mb-6 flex items-center justify-center space-x-2">
            <UserPlus size={30} className='text-brand-accent'/>
            <span>Criar Conta Cliente</span>
        </h1>

        {error && <div className="p-3 bg-red-100 border border-red-300 text-red-600 rounded-lg text-center font-medium mb-4">{error}</div>}
        {success && <div className="p-3 bg-green-100 border border-green-300 text-green-600 rounded-lg text-center font-medium mb-4">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div>
            <label className="block font-semibold text-zinc-700">Nome Completo</label>
            <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="w-full p-3 mt-1 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"/>
          </div>
          <div>
            <label className="block font-semibold text-zinc-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 mt-1 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"/>
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <label className="block font-semibold text-zinc-700">CPF</label>
              <input type="text" value={cpf} onChange={(e) => setCpf(e.target.value)} required maxLength={14} className="w-full p-3 mt-1 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"/>
            </div>
            <div>
              <label className="block font-semibold text-zinc-700">Telefone (DDD + Número)</label>
              <input type="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} required className="w-full p-3 mt-1 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"/>
            </div>
          </div>
          <div>
            <label className="block font-semibold text-zinc-700">Senha (mínimo 6 caracteres)</label>
            <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} className="w-full p-3 mt-1 border border-brand-gray-mid rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue-light"/>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue-light text-white py-3 rounded-lg font-bold text-lg hover:bg-brand-blue-dark transition-all disabled:opacity-50 shadow-md"
          >
            {loading ? 'Criando...' : 'Criar Conta'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-zinc-600">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-brand-blue-dark font-medium hover:underline">
            Faça login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}