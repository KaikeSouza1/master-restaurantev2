// kaikesouza1/master-restaurantev2/master-restaurantev2-3f0cf43254fbc3ce4fc7d455ba799df98002a2bb/packages/frontend/src/pages/MobileRevisaoPedido.tsx

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMesasStatus, removerItemMesa } from '../services/api';
import type { Mesa, ItemDoPedido } from '../types';
import { formatCurrency } from '../utils/helpers';
// CORREÇÃO VERCEL (TS6133): Removido 'AlertTriangle' pois não estava sendo usado.
import { Loader2, Trash2, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileHeader } from '../components/MobileHeader'; // Importa o header

// ==========================================================
// CORREÇÃO AQUI: export function (named export)
// ==========================================================
export function MobileRevisaoPedido() {
  const { codseq } = useParams();
  const navigate = useNavigate();

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [loading, setLoading] = useState(true);
  const [removendoId, setRemovendoId] = useState<number | null>(null);

  const fetchMesa = useCallback(async (showLoading = true) => {
    if (!codseq) return;
    if (showLoading) setLoading(true);
    
    try {
      const mesas = await getMesasStatus();
      const mesaAtual = mesas.find(m => m.codseq === Number(codseq));
      if (mesaAtual) {
        setMesa(mesaAtual);
      } else {
        toast.error('Mesa não encontrada.');
        navigate('/mobile');
      }
    } catch (err) {
      toast.error('Erro ao carregar itens da mesa.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [codseq, navigate]);

  useEffect(() => {
    fetchMesa(true);
  }, [fetchMesa]);

  const handleRemover = async (item: ItemDoPedido) => {
    if (!item.codseq) return;
    if (removendoId) return;

    const confirmar = window.confirm(
      `Tem certeza que deseja remover?\n\n${item.qtd}x ${item.descricao}`
    );
    if (!confirmar) return;

    setRemovendoId(item.codseq);
    try {
      await removerItemMesa(Number(codseq), item.codseq);
      toast.success('Item removido!');
      await fetchMesa(false);
      
    } catch (err: any) {
      toast.error(`Erro ao remover: ${err.response?.data?.message || err.message}`);
    } finally {
      setRemovendoId(null);
    }
  };

  if (loading || !mesa) {
    return (
     <div className="flex flex-col justify-center items-center min-h-screen bg-zinc-100">
       <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
       <p className="text-zinc-600 font-semibold mt-4">Carregando itens...</p>
     </div>
   );
 }

  return (
    <div className="flex flex-col h-screen bg-brand-gray-light">
      <MobileHeader 
        title={`Mesa ${mesa.num_quiosque}`}
        subtitle="Itens Lançados" 
        canGoBack={true} 
      />

      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {mesa.quitens.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 bg-white rounded-xl shadow-md border">
            <Package size={40} className="text-zinc-400" />
            <p className="text-zinc-500 font-semibold mt-2">Nenhum item lançado nesta mesa.</p>
          </div>
        ) : (
          <AnimatePresence>
            {mesa.quitens.map(item => (
              <motion.div
                key={item.codseq}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50, height: 0 }}
                className="bg-white p-4 rounded-xl shadow-md border border-zinc-200 flex items-center space-x-3"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-black text-lg text-brand-blue-dark">{item.qtd}x</span>
                    <span className="font-semibold text-zinc-800">{item.descricao}</span>
                  </div>
                  {item.obs && (
                    <p className="text-xs text-red-600 italic mt-1">OBS: {item.obs}</p>

                  )}
                  <p className="font-bold text-brand-blue-dark mt-1">
                    {formatCurrency(item.total)}
                  </p>
                </div>
                
                <motion.button
                  onClick={() => handleRemover(item)}
                  disabled={removendoId === item.codseq}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 disabled:opacity-50"
                >
                  {removendoId === item.codseq ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Trash2 size={24} />
                  )}
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <div className="flex-shrink-0 p-4 bg-white border-t border-zinc-200">
        <h3 className="text-2xl font-black text-zinc-800 text-right">
          Total: {formatCurrency(mesa.total)}
        </h3>
      </div>
    </div>
  );
}