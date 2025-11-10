// packages/frontend/src/components/ModalTransferirMesa.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
import type { Mesa } from '../types'; 
import { transferirMesa } from '../services/api';
import { ArrowRight, Loader2 } from 'lucide-react';

interface ModalProps {
  mesa: Mesa;
  mesasLivres: Mesa[];
  onClose: () => void;
  onTransferido: () => void;
}

export function ModalTransferirMesa({
  mesa,
  mesasLivres,
  onClose,
  onTransferido,
}: ModalProps) {
  const [numMesaDestino, setNumMesaDestino] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!mesa.codseq) {
      setError('Erro: A mesa de origem não possui um pedido válido para transferir.');
      return;
    }

    const numDestino = parseInt(numMesaDestino, 10);
    if (isNaN(numDestino) || numDestino <= 0) {
      setError('Por favor, selecione uma mesa de destino.');
      return;
    }
    if (numDestino === mesa.num_quiosque) {
      setError('A mesa de destino não pode ser a mesma da origem.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await transferirMesa(mesa.codseq, numDestino);
      
      // Pequeno delay para garantir que o backend processou
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Chama o callback de sucesso
      onTransferido();
      
      // Fecha o modal
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Erro ao transferir mesa. Verifique se a mesa de destino está realmente livre.');
    } finally {
      setLoading(false);
    }
  };

  const mesasDisponiveis = mesasLivres.filter(m => 
    m.num_quiosque !== mesa.num_quiosque && m.codseq === 0
  ).sort((a, b) => a.num_quiosque! - b.num_quiosque!); 

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined} 
      className="Modal bg-white w-full max-w-md mx-auto my-auto rounded-2xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-6 border-b bg-gradient-to-r from-brand-blue-dark to-brand-blue-light text-white rounded-t-2xl">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ArrowRight size={24} />
            <span>Transferir Mesa {mesa.num_quiosque}</span>
          </h2>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-2xl font-bold transition-transform hover:rotate-90 hover:scale-110 disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className='p-4 bg-blue-50 rounded-xl border border-blue-200'>
            <p className="text-zinc-700 font-medium text-center">
              Transferindo Pedido <span className='font-bold text-brand-blue-dark'>#{mesa.codseq}</span> de <span className='font-bold text-lg text-red-600'>Mesa {mesa.num_quiosque}</span>.
            </p>
          </div>

          <div>
            <label
              htmlFor="mesaDestino"
              className="block text-sm font-semibold text-zinc-700 mb-2"
            >
              Selecione a Mesa de DESTINO (LIVRE)
            </label>
            <select
              id="mesaDestino"
              value={numMesaDestino}
              onChange={(e) => {
                setNumMesaDestino(e.target.value);
                setError(null);
              }}
              className="w-full p-3 border-2 border-brand-gray-mid rounded-xl text-lg font-bold bg-white focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition-all"
              required
              autoFocus
              disabled={loading}
            >
              <option value="">-- Selecione uma Mesa --</option>
              {mesasDisponiveis.map((m) => (
                <option key={m.num_quiosque} value={m.num_quiosque!}>
                  Mesa {m.num_quiosque}
                </option>
              ))}
            </select>
            {mesasDisponiveis.length === 0 && (
              <p className="text-sm text-red-500 mt-2">Nenhuma mesa livre disponível.</p>
            )}
          </div>

          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-100 border border-red-300 text-red-600 rounded-xl text-center font-medium"
            >
              {error}
            </motion.div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-zinc-300 text-zinc-800 px-6 py-3 rounded-xl font-bold hover:bg-zinc-400 transition-all disabled:opacity-50"
            >
              Cancelar
            </button>
            <motion.button
              type="submit"
              disabled={loading || mesasDisponiveis.length === 0}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="bg-gradient-to-r from-brand-blue-light to-brand-blue-dark text-white px-6 py-3 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:bg-zinc-400 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Transferindo...</span>
                </>
              ) : (
                <>
                  <ArrowRight size={20} />
                  <span>Transferir Pedido</span>
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </ReactModal>
  );
}