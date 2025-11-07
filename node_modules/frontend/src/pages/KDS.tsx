// master-restaurante-v2/packages/frontend/src/pages/KDS.tsx

import { useState, useEffect } from 'react';
import { getKdsOrders, atualizarStatusKds, finalizarPedidoNfce } from '../services/api';
// CORREÇÃO TS1484: Usando 'import type'
import type { Mesa } from '../types';
import { Loader2, Clock, CheckCircle, Utensils, Send, Zap } from 'lucide-react';
import { formatTimeFromISO } from '../utils/helpers';
import { motion } from 'framer-motion';

type KdsStatus = 'NOVO' | 'PREPARANDO' | 'PRONTO' | 'PAGAMENTO';

export function KDS() {
  const [pedidos, setPedidos] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    getKdsOrders()
      .then(data => {
        setPedidos(data.filter(p => p.vda_finalizada !== 'S')); 
      })
      .catch(err => {
        console.error("Erro ao buscar pedidos KDS:", err);
        setError("Não foi possível carregar o painel.");
      })
      .finally(() => setLoading(false));
  };

  // Carga Inicial e Atualização Automática
  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000); 
    return () => clearInterval(interval);
  }, []);

  const handleAtualizarStatus = async (codseq: number, status: KdsStatus) => {
    try {
      await atualizarStatusKds(codseq, status);
      setPedidos(prev => 
        prev.map(p => p.codseq === codseq ? { ...p, obs: status } : p)
      );
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  };

  const handleFinalizar = async (codseq: number) => {
    if (!window.confirm(`Tem certeza que deseja finalizar o PEDIDO #${codseq} e enviá-lo para emissão de NFCe/liberação?`)) {
      return;
    }
    try {
      await finalizarPedidoNfce(codseq);
      setPedidos(prev => prev.filter(p => p.codseq !== codseq));
      alert(`Pedido #${codseq} finalizado e liberado para o caixa/emissor.`);
    } catch (err) {
      alert('Erro ao finalizar pedido.');
    }
  };

  const renderCard = (pedido: Mesa) => {
    const status = (pedido.obs || 'NOVO').toUpperCase() as KdsStatus;
    
    let buttonConfig;
    let cardClass = 'border-l-4 ';

    if (status === 'NOVO') {
        buttonConfig = { label: 'Iniciar Preparo', color: 'bg-yellow-500 hover:bg-yellow-600', nextStatus: 'PREPARANDO', icon: Utensils };
        cardClass += 'border-indigo-600';
    } else if (status === 'PREPARANDO') {
        buttonConfig = { label: 'Marcar como Pronto', color: 'bg-brand-accent hover:bg-brand-accent/80', nextStatus: 'PRONTO', icon: CheckCircle };
        cardClass += 'border-yellow-500';
    } else if (status === 'PRONTO' || status === 'PAGAMENTO') {
        buttonConfig = { label: 'Finalizar Pedido', color: 'bg-brand-blue-light hover:bg-brand-blue-dark', action: () => handleFinalizar(pedido.codseq), icon: Send };
        cardClass += 'border-brand-accent shadow-xl ring-2 ring-brand-accent/30';
    }

    return (
      <motion.div 
        key={pedido.codseq} 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        className={`bg-white p-4 rounded-xl shadow-lg ${cardClass} mb-4 flex flex-col`}
      >
        <div className="flex justify-between items-center mb-2 border-b pb-2">
          <span className={`text-lg font-bold ${status === 'PAGAMENTO' ? 'text-red-600' : 'text-brand-blue-dark'}`}>
            PEDIDO #{pedido.codseq} 
          </span>
          <span className="text-sm text-zinc-500 flex items-center space-x-1">
            <Clock size={16} />
            <span>{formatTimeFromISO(pedido.data_hora_abertura)}</span>
          </span>
        </div>

        <p className="text-xl font-extrabold mb-3">
          {pedido.tipo === 'M' ? `MESA ${pedido.num_quiosque}` : pedido.nome_cli_esp || 'DELIVERY'}
          {status === 'PAGAMENTO' && <span className="text-sm text-red-600 font-bold ml-2 flex items-center"><Zap size={16} className='mr-1'/> Fechamento!</span>}
        </p>
        
        {/* Lista de Itens */}
        <ul className="flex-1 space-y-1 text-sm text-zinc-700 mb-4 bg-brand-gray-light p-3 rounded-lg">
            {pedido.quitens.map((item, index) => (
                <li key={index} className="flex justify-between items-start">
                    <span><span className="font-bold">{item.qtd}x</span> {item.descricao}</span>
                    {item.obs && <span className="text-xs text-red-600 italic">({item.obs})</span>}
                </li>
            ))}
        </ul>

        {/* Botão de Ação */}
        {buttonConfig && (
            <motion.button
                onClick={buttonConfig.action || (() => handleAtualizarStatus(pedido.codseq, buttonConfig.nextStatus as KdsStatus))}
                className={`w-full text-white py-2 rounded-lg font-bold flex justify-center items-center space-x-2 transition-all shadow-md ${buttonConfig.color}`}
                whileTap={{ scale: 0.98 }}
            >
                <buttonConfig.icon size={18} />
                <span>{buttonConfig.label}</span>
            </motion.button>
        )}
      </motion.div>
    );
  };

  if (loading && pedidos.length === 0) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-brand-blue-dark" size={48} /></div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">{error}</div>;
  }
  
  const pedidosPorStatus = (status: KdsStatus) => pedidos.filter(p => p.obs?.toUpperCase() === status || (!p.obs && status === 'NOVO'));

  const novosPedidos = pedidosPorStatus('NOVO');
  const emPreparo = pedidosPorStatus('PREPARANDO');
  const prontos = pedidosPorStatus('PRONTO').concat(pedidosPorStatus('PAGAMENTO')); 

  return (
    <div className="min-h-screen bg-brand-gray-light p-4">
        <h1 className="text-3xl font-bold mb-6 text-brand-blue-dark">Painel de Cozinha (KDS)</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Coluna 1: NOVOS PEDIDOS */}
            <div className="bg-white p-4 rounded-xl shadow-lg h-full">
                <h2 className="text-xl font-bold mb-4 text-indigo-600 border-b pb-2">📦 Novos ({novosPedidos.length})</h2>
                <div className="space-y-4">
                  {novosPedidos.length === 0 ? <p className="text-zinc-500">Sem novos pedidos.</p> : novosPedidos.map(renderCard)}
                </div>
            </div>

            {/* Coluna 2: EM PREPARO */}
            <div className="bg-white p-4 rounded-xl shadow-lg h-full">
                <h2 className="text-xl font-bold mb-4 text-yellow-600 border-b pb-2">🔪 Em Preparo ({emPreparo.length})</h2>
                <div className="space-y-4">
                  {emPreparo.length === 0 ? <p className="text-zinc-500">Nenhum em preparo.</p> : emPreparo.map(renderCard)}
                </div>
            </div>

            {/* Coluna 3: PRONTOS / CAIXA */}
            <div className="bg-white p-4 rounded-xl shadow-lg h-full">
                <h2 className="text-xl font-bold mb-4 text-brand-accent border-b pb-2">✅ Prontos / Caixa ({prontos.length})</h2>
                <div className="space-y-4">
                  {prontos.length === 0 ? <p className="text-zinc-500">Nenhum pronto.</p> : prontos.map(renderCard)}
                </div>
            </div>

        </div>
    </div>
  );
}