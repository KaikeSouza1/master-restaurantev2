// kaikesouza1/master-restaurantev2/master-restaurantev2-3f0cf43254fbc3ce4fc7d455ba799df98002a2bb/packages/frontend/src/pages/Configuracoes.tsx

import { useState } from 'react';
import { 
  Settings, 
  Smartphone, 
  Truck, 
  Percent,
  Bell,
  // CORREÇÃO VERCEL (TS6133): Ícone 'Printer' removido pois não estava sendo usado.
  // Printer, 
  Save,
  AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export function Configuracoes() {
  const [taxaServico, setTaxaServico] = useState('10');
  const [taxaEntrega, setTaxaEntrega] = useState('5');
  const [notificacoesSonoras, setNotificacoesSonoras] = useState(true);
  const [impressoraAutomatica, setImpressoraAutomatica] = useState(false);

  // Integrações (simuladas)
  const [integracaoIfood, setIntegracaoIfood] = useState(false);
  const [integracaoRappi, setIntegracaoRappi] = useState(false);
  const [integracaoUberEats, setIntegracaoUberEats] = useState(false);

  const handleSalvar = () => {
    toast.loading('Salvando configurações...', { id: 'save' });
    
    setTimeout(() => {
      toast.success('Configurações salvas com sucesso!', { id: 'save' });
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-brand-gray-light p-6 rounded-2xl shadow-xl border border-zinc-200">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-blue-dark p-3 rounded-xl">
            <Settings size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-brand-blue-dark">
              Configurações
            </h1>
            <p className="text-zinc-600 font-medium">Personalize seu sistema</p>
          </div>
        </div>
      </div>

      {/* Integrações de Delivery */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-800 mb-4 flex items-center space-x-2">
          <Truck size={24} className="text-orange-600" />
          <span>Integrações de Delivery</span>
        </h2>
        <p className="text-sm text-zinc-600 mb-6">
          Conecte seu sistema com plataformas de delivery e gerencie tudo em um só lugar
        </p>

        <div className="space-y-4">
          {/* iFood */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-red-100 rounded-xl border border-red-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-red-600 p-3 rounded-lg">
                <Smartphone size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-800">iFood</h3>
                <p className="text-sm text-zinc-600">
                  {integracaoIfood ? 'Conectado' : 'Não conectado'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIntegracaoIfood(!integracaoIfood);
                toast.success(integracaoIfood ? 'iFood desconectado' : 'iFood conectado!');
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                integracaoIfood
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-white text-red-600 border-2 border-red-600 hover:bg-red-600 hover:text-white'
              }`}
            >
              {integracaoIfood ? 'Desconectar' : 'Conectar'}
            </button>
          </motion.div>

          {/* Rappi */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl border border-orange-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-orange-600 p-3 rounded-lg">
                <Truck size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-800">Rappi</h3>
                <p className="text-sm text-zinc-600">
                  {integracaoRappi ? 'Conectado' : 'Não conectado'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIntegracaoRappi(!integracaoRappi);
                toast.success(integracaoRappi ? 'Rappi desconectado' : 'Rappi conectado!');
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                integracaoRappi
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-white text-orange-600 border-2 border-orange-600 hover:bg-orange-600 hover:text-white'
              }`}
            >
              {integracaoRappi ? 'Desconectar' : 'Conectar'}
            </button>
          </motion.div>

          {/* Uber Eats */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-green-600 p-3 rounded-lg">
                <Smartphone size={24} className="text-white" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-800">Uber Eats</h3>
                <p className="text-sm text-zinc-600">
                  {integracaoUberEats ? 'Conectado' : 'Não conectado'}
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setIntegracaoUberEats(!integracaoUberEats);
                toast.success(integracaoUberEats ? 'Uber Eats desconectado' : 'Uber Eats conectado!');
              }}
              className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                integracaoUberEats
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-white text-green-600 border-2 border-green-600 hover:bg-green-600 hover:text-white'
              }`}
            >
              {integracaoUberEats ? 'Desconectar' : 'Conectar'}
            </button>
          </motion.div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-start space-x-3">
          <AlertCircle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Centralização de Pedidos</p>
            <p className="text-xs text-blue-700 mt-1">
              Todos os pedidos das plataformas conectadas aparecerão automaticamente no seu painel de mesas, facilitando o gerenciamento.
            </p>
          </div>
        </div>
      </div>

      {/* Configurações Gerais */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center space-x-2">
          <Percent size={24} className="text-brand-blue-dark" />
          <span>Taxas e Valores</span>
        </h2>

        <div className="space-y-6">
          {/* Taxa de Serviço */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Taxa de Serviço (%)
            </label>
            <input
              type="number"
              value={taxaServico}
              onChange={(e) => setTaxaServico(e.target.value)}
              className="w-full px-4 py-2 border-2 border-zinc-200 rounded-lg focus:border-brand-blue-light focus:outline-none"
              min="0"
              max="100"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Percentual cobrado sobre o valor da conta
            </p>
          </div>

          {/* Taxa de Entrega */}
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-2">
              Taxa de Entrega Padrão (R$)
            </label>
            <input
              type="number"
              value={taxaEntrega}
              onChange={(e) => setTaxaEntrega(e.target.value)}
              className="w-full px-4 py-2 border-2 border-zinc-200 rounded-lg focus:border-brand-blue-light focus:outline-none"
              min="0"
              step="0.5"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Valor cobrado para entregas (pode ser ajustado por pedido)
            </p>
          </div>
        </div>
      </div>

      {/* Notificações e Impressão */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-zinc-200">
        <h2 className="text-xl font-bold text-zinc-800 mb-6 flex items-center space-x-2">
          <Bell size={24} className="text-brand-blue-dark" />
          <span>Notificações e Impressão</span>
        </h2>

        <div className="space-y-4">
          {/* Notificações Sonoras */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-zinc-800">Notificações Sonoras</h3>
              <p className="text-sm text-zinc-600">Alerta sonoro para novos pedidos</p>
            </div>
            <button
              onClick={() => setNotificacoesSonoras(!notificacoesSonoras)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                notificacoesSonoras ? 'bg-green-600' : 'bg-zinc-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  notificacoesSonoras ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>

          {/* Impressão Automática */}
          <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
            <div>
              <h3 className="font-semibold text-zinc-800">Impressão Automática</h3>
              <p className="text-sm text-zinc-600">Imprimir pedidos automaticamente na cozinha</p>
            </div>
            <button
              onClick={() => setImpressoraAutomatica(!impressoraAutomatica)}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                impressoraAutomatica ? 'bg-green-600' : 'bg-zinc-300'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  impressoraAutomatica ? 'transform translate-x-6' : ''
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Botão Salvar */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSalvar}
        className="w-full bg-gradient-to-r from-brand-blue-light to-brand-blue-dark text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-2"
      >
        <Save size={24} />
        <span>Salvar Todas as Configurações</span>
      </motion.button>
    </div>
  );
}