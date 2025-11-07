// master-restaurante-v2/packages/frontend/src/components/ModalTransferirMesa.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
// CORREÇÃO TS1484: Usando 'import type'
import type { Mesa } from '../types'; 
import { transferirMesa } from '../services/api';
import { ArrowRight } from 'lucide-react';

interface ModalProps {
  mesa: Mesa;
  mesasLivres: Mesa[]; // Lista de mesas que não estão ocupadas (codseq === 0)
  onClose: () => void;
  onTransferido: () => void; // Função para recarregar as mesas
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
      alert(
        `Mesa ${mesa.num_quiosque} transferida com sucesso para a Mesa ${numDestino}!`,
      );
      onTransferido(); // Recarrega as mesas na dashboard
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
      // CORREÇÃO: Prop para evitar o warning
      appElement={document.getElementById('root') || undefined} 
      className="Modal bg-white w-full max-w-md mx-auto my-auto rounded-xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex justify-between items-center p-5 border-b bg-brand-blue-dark text-white">
          <h2 className="text-2xl font-bold flex items-center space-x-2">
            <ArrowRight size={24} />
            <span>Transferir Mesa {mesa.num_quiosque}</span>
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold transition-transform hover:rotate-90"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className='p-3 bg-brand-gray-light rounded-lg'>
             <p className="text-zinc-700 font-medium">
                Transferindo Pedido <span className='font-bold'>#{mesa.codseq}</span> de <span className='font-bold text-lg text-red-600'>Mesa {mesa.num_quiosque}</span>.
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
              className="w-full p-3 border border-brand-gray-mid rounded-lg text-lg font-bold bg-white focus:ring-brand-blue-light focus:border-brand-blue-light"
              required
              autoFocus
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
            <div className="p-3 bg-red-100 border border-red-300 text-red-600 rounded-lg text-center font-medium">
                {error}
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="bg-zinc-300 text-zinc-800 px-6 py-3 rounded-lg font-bold hover:bg-zinc-400 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || mesasDisponiveis.length === 0}
              className="bg-brand-blue-light text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-brand-blue-dark transition-all disabled:opacity-50 disabled:bg-zinc-400"
            >
              {loading ? 'Transferindo...' : 'Transferir Pedido'}
            </button>
          </div>
        </form>
      </motion.div>
    </ReactModal>
  );
}