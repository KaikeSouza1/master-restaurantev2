// packages/frontend/src/pages/HistoricoPedidos.tsx

import { useState, useEffect } from 'react';
import { getFinalizadosOrders } from '../services/api';
import type { Mesa } from '../types';
import { formatCurrency, formatDateTime } from '../utils/helpers';
import { 
  Loader2, 
  Search, 
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  FileText,
  ChevronDown,
  ChevronUp
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
        p.total.toString().includes(termo)
    );

    setPedidosFiltrados(filtrados);
  };

  // Estatísticas
  const totalFaturamento = pedidos.reduce((acc, p) => acc + Number(p.total), 0);
  const ticketMedio = pedidos.length > 0 ? totalFaturamento / pedidos.length : 0;
  const totalItens = pedidos.reduce((acc, p) => acc + p.quitens.length, 0);

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
              <p className="text-zinc-600 font-medium">Últ