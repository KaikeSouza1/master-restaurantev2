// packages/frontend/src/components/ModalEditarItens.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Edit3, Check, Loader2, AlertTriangle } from 'lucide-react';
import type { Mesa, ItemDoPedido } from '../types';
import { formatCurrency } from '../utils/helpers';
import { removerItemMesa, editarQuantidadeItem } from '../services/api';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onAtualizado: () => void;
}

type ModoEdicao = 'visualizar' | 'editar' | 'remover';

export function ModalEditarItens({ mesa, onClose, onAtualizado }: ModalProps) {
  const [modo, setModo] = useState<ModoEdicao>('visualizar');
  const [itemSelecionado, setItemSelecionado] = useState<ItemDoPedido | null>(null);
  
  // Estados para edição
  const [novaQuantidade, setNovaQuantidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);

  const handleIniciarEdicao = (item: ItemDoPedido) => {
    setItemSelecionado(item);
    setNovaQuantidade(String(item.qtd));
    setMotivo('');
    setModo('editar');
  };

  const handleIniciarRemocao = (item: ItemDoPedido) => {
    setItemSelecionado(item);
    setMotivo('');
    setModo('remover');
  };

  const handleConfirmarEdicao = async () => {
    if (!itemSelecionado || !itemSelecionado.codseq) {
      toast.error('Item inválido');
      return;
    }

    const qtd = parseFloat(novaQuantidade);
    if (!qtd || qtd <= 0) {
      toast.error('Quantidade deve ser maior que zero');
      return;
    }

    if (qtd === itemSelecionado.qtd) {
      toast.error('Quantidade não foi alterada');
      return;
    }

    setLoading(true);

    try {
      await editarQuantidadeItem(mesa.codseq, itemSelecionado.codseq, qtd, motivo || undefined);
      toast.success('Quantidade atualizada!');
      onAtualizado();
      setModo('visualizar');
      setItemSelecionado(null);
    } catch (err: any) {
      console.error('Erro ao editar:', err);
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarRemocao = async () => {
    if (!itemSelecionado || !itemSelecionado.codseq) {
      toast.error('Item inválido');
      return;
    }

    if (!motivo || motivo.trim().length < 3) {
      toast.error('Motivo é obrigatório (mínimo 3 caracteres)');
      return;
    }

    setLoading(true);

    try {
      await removerItemMesa(mesa.codseq, itemSelecionado.codseq, motivo);
      toast.success('Item removido!');
      onAtualizado();
      setModo('visualizar');
      setItemSelecionado(null);
    } catch (err: any) {
      console.error('Erro ao remover:', err);
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    setModo('visualizar');
    setItemSelecionado(null);
    setNovaQuantidade('');
    setMotivo('');
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
        exit={{ scale: 0.9, opacity: 0 }}
        className="h-full flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-red-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">Editar Itens</h2>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {modo === 'visualizar' ? (
            // MODO VISUALIZAÇÃO - Lista de Itens
            <div className="space-y-3">
              <AnimatePresence>
                {mesa.quitens.map((item, index) => (
                  <motion.div
                    key={item.codseq || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-brand-blue-light text-white text-sm font-bold px-3 py-1 rounded-lg">
                            {item.qtd}x
                          </span>
                          <span className="font-bold text-zinc-800 text-lg">{item.descricao}</span>
                        </div>
                        {item.obs && (
                          <p className="text-xs text-red-600 italic mt-2 ml-12 bg-red-50 px-2 py-1 rounded">
                            💬 {item.obs}
                          </p>
                        )}
                        <p className="text-sm text-zinc-600 mt-2 ml-12">
                          {formatCurrency(Number(item.unitario))} / unidade
                        </p>
                      </div>

                      <div className="flex flex-col items-end space-y-2">
                        <p className="text-2xl font-black text-brand-blue-dark">
                          {formatCurrency(item.total)}
                        </p>
                        <div className="flex space-x-2">
                          <motion.button
                            onClick={() => handleIniciarEdicao(item)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition-colors"
                            title="Editar Quantidade"
                          >
                            <Edit3 size={18} />
                          </motion.button>
                          <motion.button
                            onClick={() => handleIniciarRemocao(item)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors"
                            title="Remover Item"
                          >
                            <Trash2 size={18} />
                          </motion.button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : modo === 'editar' && itemSelecionado ? (
            // MODO EDIÇÃO
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-xl border-2 border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center space-x-2">
                  <Edit3 size={24} />
                  <span>Editar Quantidade</span>
                </h3>

                <div className="bg-white p-4 rounded-lg mb-4">
                  <p className="font-bold text-zinc-800 text-lg">{itemSelecionado.descricao}</p>
                  <p className="text-sm text-zinc-600">Quantidade atual: {itemSelecionado.qtd}</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Nova Quantidade *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={novaQuantidade}
                      onChange={(e) => setNovaQuantidade(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:border-blue-500 focus:outline-none text-2xl font-bold"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Motivo (opcional)
                    </label>
                    <input
                      type="text"
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ex: Cliente pediu para reduzir"
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      onClick={handleCancelar}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-zinc-100 text-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      onClick={handleConfirmarEdicao}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Check size={20} />}
                      <span>{loading ? 'Salvando...' : 'Confirmar'}</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ) : modo === 'remover' && itemSelecionado ? (
            // MODO REMOÇÃO
            <div className="space-y-6">
              <div className="bg-red-50 p-6 rounded-xl border-2 border-red-200">
                <h3 className="text-xl font-bold text-red-900 mb-4 flex items-center space-x-2">
                  <AlertTriangle size={24} />
                  <span>Remover Item</span>
                </h3>

                <div className="bg-white p-4 rounded-lg mb-4 border-2 border-red-200">
                  <p className="font-bold text-zinc-800 text-lg">{itemSelecionado.descricao}</p>
                  <p className="text-sm text-zinc-600">
                    Quantidade: {itemSelecionado.qtd} • Total: {formatCurrency(itemSelecionado.total)}
                  </p>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-4">
                  <p className="text-sm text-yellow-900 font-semibold">
                    ⚠️ Esta ação não pode ser desfeita! O item será permanentemente removido do pedido.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Motivo da Remoção *
                    </label>
                    <textarea
                      value={motivo}
                      onChange={(e) => setMotivo(e.target.value)}
                      placeholder="Ex: Cliente desistiu do item, erro no pedido..."
                      rows={3}
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:border-red-500 focus:outline-none"
                      autoFocus
                    />
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <motion.button
                      onClick={handleCancelar}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-zinc-100 text-zinc-700 py-3 rounded-lg font-semibold hover:bg-zinc-200 transition-all disabled:opacity-50"
                    >
                      Cancelar
                    </motion.button>
                    <motion.button
                      onClick={handleConfirmarRemocao}
                      disabled={loading}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <Trash2 size={20} />}
                      <span>{loading ? 'Removendo...' : 'Remover Item'}</span>
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

        </div>
      </motion.div>
    </ReactModal>
  );
}