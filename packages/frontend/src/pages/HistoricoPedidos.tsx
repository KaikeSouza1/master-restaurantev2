// kaikesouza1/master-restaurantev2/master-restaurantev2-3f0cf43254fbc3ce4fc7d455ba799df98002a2bb/packages/frontend/src/pages/HistoricoPedidos.tsx

import { useState, useEffect } from 'react';
import { getFinalizadosOrders } from '../services/api';
import type { Mesa } from '../types';
// CORREÇÃO VERCEL (TS6133): Removido 'formatDateTime' e 'formatTimeFromISO' pois não estavam sendo usados.
import { formatCurrency, formatDateCompact } from '../utils/helpers';
import { 
  Loader2, 
  Search, 
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  FileText,
  ChevronDown,
  // CORREÇÃO VERCEL (TS6133): Removido 'ChevronUp' pois não estava sendo usado.
  // ChevronUp,
  Filter,
  Download,
  LayoutGrid 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function HistoricoPedidos() {
  const [pedidos, setPedidos] = useState<Mesa[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<'TODOS' | 'MESA' | 'DELIVERY'>('TODOS');

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [searchTerm, pedidos, filtroTipo]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const data = await getFinalizadosOrders();
      setPedidos(data);
      toast.success(`${data.length} pedidos carregados`);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPedidos = () => {
    let filtrados = [...pedidos];

    // Filtro por tipo
    if (filtroTipo !== 'TODOS') {
      filtrados = filtrados.filter(p => 
        filtroTipo === 'MESA' ? p.tipo === 'M' : p.tipo === 'D'
      );
    }

    // Filtro por busca
    if (searchTerm.trim()) {
      const termo = searchTerm.toLowerCase();
      filtrados = filtrados.filter(
        (p) =>
          p.codseq.toString().includes(termo) ||
          p.num_quiosque?.toString().includes(termo) ||
          p.nome_cli_esp?.toLowerCase().includes(termo) ||
          p.total.toString().includes(termo)
      );
    }

    setPedidosFiltrados(filtrados);
  };

  // Estatísticas
  const totalFaturamento = pedidosFiltrados.reduce((acc, p) => acc + Number(p.total), 0);
  const ticketMedio = pedidosFiltrados.length > 0 ? totalFaturamento / pedidosFiltrados.length : 0;
  // CORREÇÃO VERCEL (TS6133): Variável 'totalItens' comentada pois não estava sendo usada.
  // const totalItens = pedidosFiltrados.reduce((acc, p) => acc + p.quitens.length, 0);
  const pedidosMesa = pedidosFiltrados.filter(p => p.tipo === 'M').length;
  const pedidosDelivery = pedidosFiltrados.filter(p => p.tipo === 'D').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-white to-brand-gray-light p-6 rounded-2xl shadow-xl border border-zinc-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue-dark p-3 rounded-xl">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brand-blue-dark">
                Histórico de Pedidos
              </h1>
              <p className="text-zinc-600 font-medium">Últimas 24 horas</p>
            </div>
          </div>

          <button
            onClick={carregarHistorico}
            className="bg-brand-blue-light text-white px-4 py-2 rounded-xl font-semibold hover:bg-brand-blue-dark transition-all flex items-center space-x-2"
          >
            <Download size={18} />
            <span>Atualizar</span>
          </button>
        </div>

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <DollarSign size={20} />
              <p className="text-xs font-bold uppercase opacity-90">Faturamento</p>
            </div>
            <p className="text-2xl font-black">{formatCurrency(totalFaturamento)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp size={20} />
              <p className="text-xs font-bold uppercase opacity-90">Ticket Médio</p>
            </div>
            <p className="text-2xl font-black">{formatCurrency(ticketMedio)}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Package size={20} />
              <p className="text-xs font-bold uppercase opacity-90">Total Pedidos</p>
            </div>
            <p className="text-2xl font-black">{pedidosFiltrados.length}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-red-500 to-red-600 text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <LayoutGrid size={20} />
              <p className="text-xs font-bold uppercase opacity-90">Mesas</p>
            </div>
            <p className="text-2xl font-black">{pedidosMesa}</p>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-4 rounded-xl shadow-lg"
          >
            <div className="flex items-center space-x-2 mb-2">
              <Calendar size={20} />
              <p className="text-xs font-bold uppercase opacity-90">Delivery</p>
            </div>
            <p className="text-2xl font-black">{pedidosDelivery}</p>
          </motion.div>
        </div>
      </div>

      {/* Filtros e Busca */}
      <div className="bg-white p-4 rounded-xl shadow-lg flex flex-wrap gap-4 items-center">
        {/* Busca */}
        <div className="flex-1 min-w-[250px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Buscar por pedido, mesa, cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border-2 border-zinc-200 rounded-lg focus:border-brand-blue-light focus:outline-none"
          />
        </div>

        {/* Filtros de Tipo */}
        <div className="flex items-center space-x-2">
          <Filter size={18} className="text-zinc-600" />
          <button
            onClick={() => setFiltroTipo('TODOS')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroTipo === 'TODOS'
                ? 'bg-brand-blue-dark text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setFiltroTipo('MESA')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroTipo === 'MESA'
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Mesas
          </button>
          <button
            onClick={() => setFiltroTipo('DELIVERY')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              filtroTipo === 'DELIVERY'
                ? 'bg-orange-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Delivery
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="space-y-3">
        <AnimatePresence>
          {pedidosFiltrados.length > 0 ? (
            pedidosFiltrados.map((pedido) => (
              <motion.div
                key={pedido.codseq}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden border border-zinc-200"
              >
                {/* Header do Card */}
                <button
                  onClick={() => setPedidoExpandido(pedidoExpandido === pedido.codseq ? null : pedido.codseq)}
                  className="w-full p-5 flex items-center justify-between hover:bg-zinc-50 transition-colors"
                >
                  <div className="flex items-center space-x-4 flex-1">
                    {/* Badge de Tipo */}
                    <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                      pedido.tipo === 'M' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-orange-100 text-orange-700'
                    }`}>
                      {pedido.tipo === 'M' ? `Mesa ${pedido.num_quiosque}` : 'Delivery'}
                    </div>

                    {/* Info do Pedido */}
                    <div className="text-left flex-1">
                      <p className="font-bold text-lg text-zinc-800">
                        Pedido #{pedido.codseq}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {pedido.nome_cli_esp || 'Cliente'} • {formatDateCompact(pedido.data_hora_finalizada)}
                      </p>
                    </div>

                    {/* Itens e Valor */}
                    <div className="text-right">
                      <p className="text-sm text-zinc-500 flex items-center justify-end space-x-1">
                        <Package size={14} />
                        <span>{pedido.quitens.length} itens</span>
                      </p>
                      <p className="text-2xl font-black text-brand-blue-dark">
                        {formatCurrency(pedido.total)}
                      </p>
                    </div>
                  </div>

                  {/* Ícone de Expandir */}
                  <motion.div
                    animate={{ rotate: pedidoExpandido === pedido.codseq ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown size={24} className="text-zinc-400" />
                  </motion.div>
                </button>

                {/* Detalhes Expandidos */}
                <AnimatePresence>
                  {pedidoExpandido === pedido.codseq && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t border-zinc-200 bg-zinc-50"
                    >
                      <div className="p-5 space-y-3">
                        {pedido.quitens.map((item, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <div className="flex items-center space-x-2">
                              <span className="bg-brand-blue-light text-white text-sm font-bold px-2 py-1 rounded min-w-[2rem] text-center">
                                {item.qtd}x
                              </span>
                              <span className="font-medium text-zinc-800">{item.descricao}</span>
                            </div>
                            <span className="font-bold text-zinc-700">{formatCurrency(item.total)}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-xl shadow-lg text-center">
              <p className="text-zinc-500 text-lg">
                {searchTerm ? 'Nenhum pedido encontrado com este filtro.' : 'Nenhum pedido finalizado nas últimas 24 horas.'}
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}