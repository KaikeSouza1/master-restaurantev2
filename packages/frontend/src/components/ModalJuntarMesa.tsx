// packages/frontend/src/components/ModalJuntarMesa.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Loader2, Combine } from 'lucide-react';
import { juntarMesas } from '../services/api';
import type { Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';

interface ModalProps {
  mesaOrigem: Mesa;
  mesasOcupadas: Mesa[]; // Recebe apenas mesas ocupadas (destino)
  onClose: () => void;
  onJuntado: () => void; // Callback para quando a junção for bem-sucedida
}

export function ModalJuntarMesa({
  mesaOrigem,
  mesasOcupadas,
  onClose,
  onJuntado,
}: ModalProps) {
  const [mesaDestinoId, setMesaDestinoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!mesaDestinoId) {
      toast.error('Por favor, selecione uma mesa de destino.');
      return;
    }
    if (!mesaOrigem || !mesaOrigem.codseq) {
      toast.error('Erro ao identificar a mesa de origem.');
      return;
    }

    setIsLoading(true);

    const promise = juntarMesas(mesaOrigem.codseq, mesaDestinoId);

    toast.promise(promise, {
      loading: 'Juntando mesas...',
      success: () => {
        onJuntado(); // Chama o callback de sucesso
        return 'Mesas juntadas com sucesso!';
      },
      error: (err: any) => {
        console.error('Erro ao juntar mesas:', err);
        return `Erro: ${err.response?.data?.message || err.message}`;
      },
    });

    try {
      await promise;
    } catch (err) {
      // Erro tratado pelo toast
    } finally {
      setIsLoading(false);
    }
  };

  const mesaDestinoSelecionada = mesasOcupadas.find(m => m.codseq === mesaDestinoId);

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined}
      className="Modal bg-brand-gray-light w-full max-w-xl mx-auto my-auto rounded-2xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="h-full flex flex-col max-h-[80vh]"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Juntar Mesas</h2>
            <p className="text-white/80 font-semibold">
              Juntar Mesa{' '}
              <span className="font-bold text-white text-lg bg-black/20 px-2 rounded-lg">
                {mesaOrigem.num_quiosque}
              </span>{' '}
              com...
            </p>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X size={28} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-white">
          <p className="font-semibold text-zinc-700">
            Selecione a mesa de <strong>destino</strong> (para onde os itens e o
            valor da Mesa {mesaOrigem.num_quiosque} serão movidos):
          </p>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {mesasOcupadas.length > 0 ? (
              mesasOcupadas.map((mesa) => (
                <motion.button
                  key={mesa.codseq}
                  onClick={() => setMesaDestinoId(mesa.codseq)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-3 rounded-xl transition-all border-4
                    ${
                      mesaDestinoId === mesa.codseq
                        ? 'bg-purple-600 text-white border-purple-800 shadow-xl'
                        : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
                    }
                  `}
                >
                  <span className="block text-2xl font-black">
                    {mesa.num_quiosque}
                  </span>
                  <span className="block text-xs font-semibold opacity-80">
                    {formatCurrency(mesa.total)}
                  </span>
                </motion.button>
              ))
            ) : (
              <p className="col-span-full text-center text-zinc-500 py-4">
                Nenhuma outra mesa ocupada disponível para juntar.
              </p>
            )}
          </div>
        </div>

        {/* Footer com Ações */}
        <div className="flex-shrink-0 p-4 bg-brand-gray-light border-t border-zinc-200 flex justify-end items-center space-x-3">
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-5 py-3 rounded-lg font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 transition-all"
          >
            Cancelar
          </motion.button>
          <motion.button
            onClick={handleSubmit}
            disabled={isLoading || !mesaDestinoId || mesasOcupadas.length === 0}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Combine size={20} />
            )}
            <span>
              {isLoading
                ? 'Juntando...'
                : mesaDestinoSelecionada
                  ? `Juntar na Mesa ${mesaDestinoSelecionada.num_quiosque}`
                  : 'Confirmar Junção'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </ReactModal>
  );
}