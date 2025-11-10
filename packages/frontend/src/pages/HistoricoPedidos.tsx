// packages/frontend/src/pages/HistoricoPedidos.tsx

import { useState, useEffect } from 'react';
import { getFinalizadosOrders } from '../services/api';
import type { Mesa } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import {
  Loader2,
  Search,
  // Calendar, // Removido pois não estava sendo usado
  DollarSign,
  Package,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export function HistoricoPedidos() {
  const [pedidos, setPedidos] = useState<Mesa[]>([]);
  const [pedidosFiltrados, setPedidosFiltrados] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pedidoExpandido, setPedidoExpandido] = useState<number | null>(null);

  useEffect(() => {
    carregarHistorico();
  }, []);

  useEffect(() => {
    filtrarPedidos();
  }, [searchTerm, pedidos]);

  const carregarHistorico = async () => {
    setLoading(true);
    try {
      const data = await getFinalizadosOrders();
      // Garante que os pedidos venham ordenados do mais novo para o mais antigo
      const pedidosOrdenados = data.sort(
        (a: Mesa, b: Mesa) => b.codseq - a.codseq,
      );
      setPedidos(pedidosOrdenados);
      setPedidosFiltrados(pedidosOrdenados);
      toast.success(`${data.length} pedidos carregados`);
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      toast.error('Erro ao carregar histórico de pedidos');
    } finally {
      setLoading(false);
    }
  };

  const filtrarPedidos = () => {
    if (!searchTerm.trim()) {
      setPedidosFiltrados(pedidos);
      return;
    }

    const termo = searchTerm.toLowerCase();
    const filtrados = pedidos.filter(
      (p) =>
        p.codseq.toString().includes(termo) ||
        p.num_quiosque?.toString().includes(termo) ||
        p.nome_cli_esp?.toLowerCase().includes(termo) ||
        p.total.toString().includes(termo),
    );

    setPedidosFiltrados(filtrados);
  };

  // Estatísticas
  const totalFaturamento = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
  const ticketMedio = pedidos.length > 0 ? totalFaturamento / pedidos.length : 0;
  const totalItens = pedidos.reduce(
    (acc, p) => acc + p.quitens.reduce((sum, item) => sum + item.qtd, 0), // Corrigido para somar 'qtd' de 'quitens'
    0,
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header e Stats */}
      <div className="bg-gradient-to-br from-white to-brand-gray-light p-6 rounded-2xl shadow-xl border border-zinc-200">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue-dark p-3 rounded-xl">
              <FileText size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brand-blue-dark">
                Histórico de Pedidos
              </h1>
              <p className="text-zinc-600 font-medium">
                Últimos pedidos finalizados
              </p>
            </div>
          </div>
          {/* Search Bar */}
          <div className="relative w-full md:max-w-sm">
            <input
              type="text"
              placeholder="Buscar (Cód, Mesa, Cliente...)"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-300 bg-white shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-blue"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={20}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Faturamento Total */}
          <div className="bg-white p-4 rounded-lg shadow-inner border border-zinc-200 flex items-center space-x-3">
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Faturamento Total
              </p>
              <p className="text-2xl font-bold text-brand-blue-dark">
                {formatCurrency(totalFaturamento)}
              </p>
            </div>
          </div>
          {/* Ticket Médio */}
          <div className="bg-white p-4 rounded-lg shadow-inner border border-zinc-200 flex items-center space-x-3">
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">Ticket Médio</p>
              <p className="text-2xl font-bold text-brand-blue-dark">
                {formatCurrency(ticketMedio)}
              </p>
            </div>
          </div>
          {/* Itens Vendidos */}
          <div className="bg-white p-4 rounded-lg shadow-inner border border-zinc-200 flex items-center space-x-3">
            <div className="bg-orange-100 p-3 rounded-full">
              <Package size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-500">
                Itens Vendidos
              </p>
              <p className="text-2xl font-bold text-brand-blue-dark">
                {totalItens}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden">
        {pedidosFiltrados.length === 0 ? (
          <div className="p-16 text-center text-zinc-500">
            <p className="text-lg">Nenhum pedido encontrado.</p>
            {searchTerm && <p>Tente ajustar seus termos de busca.</p>}
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200">
            {pedidosFiltrados.map((pedido) => (
              <li key={pedido.codseq} className="transition-colors">
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-zinc-50"
                  onClick={() =>
                    setPedidoExpandido(
                      pedidoExpandido === pedido.codseq ? null : pedido.codseq,
                    )
                  }
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <span className="font-bold text-lg text-brand-blue-dark">
                        Pedido #{pedido.codseq}
                      </span>
                      <p className="text-sm text-zinc-600">
                        {pedido.nome_cli_esp ||
                          `Mesa ${pedido.num_quiosque || 'N/A'}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6 text-right">
                    <div>
                      <p className="font-bold text-lg text-green-600">
                        {formatCurrency(Number(pedido.total))}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {/* CORREÇÃO AQUI: 
                          Usando 'data_hora_finalizada' ou 'data_hora_abertura' como fallback 
                        */}
                        {formatDateTime(
                          pedido.data_hora_finalizada ||
                            pedido.data_hora_abertura,
                        )}
                      </p>
                    </div>
                    {pedidoExpandido === pedido.codseq ? (
                      <ChevronUp size={20} className="text-zinc-500" />
                    ) : (
                      <ChevronDown size={20} className="text-zinc-500" />
                    )}
                  </div>
                </div>
                <AnimatePresence>
                  {pedidoExpandido === pedido.codseq && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-zinc-100 overflow-hidden"
                    >
                      <div className="p-4 border-t border-zinc-200">
                        <h4 className="text-md font-semibold text-brand-blue-dark mb-3">
                          Detalhes do Pedido
                        </h4>
                        <ul className="space-y-2">
                          {pedido.quitens.map((item, index) => (
                            <li
                              /* CORREÇÃO AQUI: 
                                Usando 'item.codseq' ou index como key 
                              */
                              key={item.codseq || index}
                              className="flex justify-between items-center text-sm"
                            >
                              <span>
                                {/* CORREÇÃO AQUI: 
                                  Usando 'item.qtd' e 'item.descricao' 
                                */}
                                {item.qtd}x {item.descricao}
                              </span>
                              <span className="font-medium">
                                {/* CORREÇÃO AQUI: 
                                  Usando 'item.total' 
                                */}
                                {formatCurrency(Number(item.total))}
                              </span>
                            </li>
                          ))}
                        </ul>
                        <div className="border-t border-zinc-300 mt-3 pt-3 flex justify-between font-bold">
                          <span>Total Pago</span>
                          <span>{formatCurrency(Number(pedido.total))}</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}