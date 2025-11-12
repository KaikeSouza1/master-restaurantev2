// packages/frontend/src/components/ModalEditarItens.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Loader2 } from 'lucide-react';
import type { Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';
import { removerItemMesa } from '../services/api';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onAtualizado: () => void;
}

export function ModalEditarItens({ mesa, onClose, onAtualizado }: ModalProps) {
  const [removendo, setRemovendo] = useState<number | null>(null);

  const handleRemover = async (codseqItem: number, descricao: string) => {
    const confirmar = window.confirm(
      `Tem certeza que deseja remover:\n\n${descricao}?`
    );

    if (!confirmar) return;

    setRemovendo(codseqItem);

    try {
      await removerItemMesa(mesa.codseq, codseqItem);
      toast.success('Item removido!');
      onAtualizado();
    } catch (err: any) {
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setRemovendo(null);
    }
  };

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined}
      className="Modal bg-white w-full max-w-3xl mx-auto my-auto rounded-2xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-full flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-red-600 to-red-800 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">🗑️ Remover Itens</h2>
            <p className="text-white/80 font-semibold">
              Mesa {mesa.num_quiosque} - {mesa.quitens.length} itens
            </p>
          </div>
          <motion.button
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-white hover:bg-white/20 rounded-full p-2"
          >
            <X size={28} />
          </motion.button>
        </div>

        {/* Lista de Itens */}
        <div className="flex-1 overflow-y-auto p-6">
          {mesa.quitens.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-zinc-500 text-xl">Nenhum item no pedido</p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {mesa.quitens.map((item, index) => (
                  <motion.div
                    key={item.codseq || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-50 p-4 rounded-xl border-2 border-zinc-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="bg-blue-600 text-white text-sm font-bold px-3 py-1 rounded-lg min-w-[3rem] text-center">
                            {item.qtd}x
                          </span>
                          <div>
                            <p className="font-bold text-zinc-800 text-lg">{item.descricao}</p>
                            {item.obs && (
                              <p className="text-xs text-zinc-500 italic mt-1">{item.obs}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <p className="text-2xl font-black text-blue-700">
                          {formatCurrency(item.total)}
                        </p>
                        
                        <motion.button
                          onClick={() => item.codseq && handleRemover(item.codseq, item.descricao)}
                          disabled={removendo === item.codseq}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {removendo === item.codseq ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : (
                            <Trash2 size={24} />
                          )}
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 bg-zinc-100 border-t border-zinc-200">
          <p className="text-center text-sm text-zinc-600">
            💡 Clique no botão 🗑️ para remover um item
          </p>
        </div>
      </motion.div>
    </ReactModal>
  );
}