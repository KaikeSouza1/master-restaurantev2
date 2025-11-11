// packages/frontend/src/components/ModalDetalhesMesa.tsx

import ReactModal from 'react-modal';
import { motion, AnimatePresence } from 'framer-motion';
import type { Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';
import {
  X,
  PlusCircle,
  ArrowRight,
  Printer, 
  CheckCircle,
  DollarSign,
  Info,
  Clock,
  Package,
  Sparkles,
  ChefHat,
  Combine, 
} from 'lucide-react';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onAdicionarItens: () => void;
  onTransferir: () => void;
  onJuntar: () => void; 
  onFecharConta: () => void;
  onFinalizarMesa: () => void; // (NFCe)
  onFinalizarCaixa: () => void; // (Imprimir/Caixa)
  onFecharMesaVazia: () => void;
  onDividirConta: () => void; // NOVO
  onEditarItens: () => void; // NOVO
}

export function ModalDetalhesMesa({
  mesa,
  onClose,
  onAdicionarItens,
  onTransferir,
  onJuntar,
  onFecharConta,
  onFinalizarMesa,
  onFinalizarCaixa, 
  onFecharMesaVazia,
}: ModalProps) {
  const status = (mesa.obs || 'NOVO').toUpperCase();
  const isPagamento = status === 'PAGAMENTO';
  const observacaoAtual = (mesa.obs !== 'PAGAMENTO' && mesa.obs !== 'NOVO' ? mesa.obs : '') || '';
  const mesaVazia = mesa.quitens.length === 0;

  const statusConfig = isPagamento 
    ? { bg: 'bg-gradient-to-r from-yellow-500 to-amber-600', text: 'Aguardando Pagamento', icon: DollarSign }
    : { bg: 'bg-gradient-to-r from-red-600 to-rose-700', text: 'Mesa Ocupada', icon: ChefHat };

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined}
      className="Modal bg-brand-gray-light w-full max-w-3xl mx-auto my-auto rounded-2xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: "spring", duration: 0.5 }}
        className="h-full flex flex-col max-h-[90vh]"
      >
        {/* Header Moderno com Gradiente */}
        <div className={`flex-shrink-0 ${statusConfig.bg} text-white p-6 relative overflow-hidden`}>
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)'
            }}></div>
          </div>

          <div className="relative z-10 flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <motion.div
                  animate={{ rotate: isPagamento ? [0, 10, -10, 0] : 0 }}
                  transition={{ repeat: isPagamento ? Infinity : 0, duration: 2 }}
                >
                  <statusConfig.icon size={32} className="drop-shadow-lg" />
                </motion.div>
                <div>
                  <h2 className="text-4xl font-black tracking-tight drop-shadow-lg">
                    Mesa {mesa.num_quiosque}
                  </h2>
                  <p className="text-white/80 text-sm font-semibold flex items-center space-x-2 mt-1">
                    <span className="bg-white/20 px-2 py-0.5 rounded-full">{statusConfig.text}</span>
                    <span>•</span>
                    <span>Pedido #{mesa.codseq}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-white/90 bg-black/20 backdrop-blur-sm px-3 py-2 rounded-lg inline-flex">
                <div className="flex items-center space-x-1">
                  <Clock size={16} />
                  <span className="font-semibold">
                    {mesa.data_hora_abertura 
                      ? new Date(mesa.data_hora_abertura).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'Agora'
                    }
                  </span>
                </div>
                <span>•</span>
                <div className="flex items-center space-x-1">
                  <Package size={16} />
                  <span className="font-semibold">{mesa.quitens.length} itens</span>
                </div>
              </div>
            </div>

            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
            >
              <X size={28} strokeWidth={2.5} />
            </motion.button>
          </div>

          {/* Decorative Element */}
          <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        </div>

        {/* Content Area com Scroll */}
        <div className="p-6 flex-1 flex flex-col space-y-5 overflow-y-auto scroll-hide bg-gradient-to-b from-white to-brand-gray-light">
          
          {/* Card do Valor Total - Destaque */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-brand-blue-dark via-brand-blue-light to-blue-600 text-white p-6 rounded-2xl shadow-2xl text-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full -ml-16 -mb-16"></div>
            
            <div className="relative z-10">
              <p className="text-sm font-bold uppercase tracking-widest text-white/80 mb-2">Valor Total da Conta</p>
              <motion.p 
                className="text-6xl font-black drop-shadow-2xl"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {formatCurrency(mesa.total)}
              </motion.p>
            </div>
          </motion.div>

          {/* Lista de Itens com Design Moderno */}
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-zinc-200">
            <h3 className="text-xl font-bold text-zinc-800 mb-4 flex items-center space-x-2 border-b pb-3">
              <Package size={24} className="text-brand-blue-dark" />
              <span>Itens Consumidos</span>
              <span className="bg-brand-blue-light text-white text-xs font-bold px-3 py-1 rounded-full ml-auto">
                {mesa.quitens.length}
              </span>
            </h3>
            
            <div className="max-h-60 overflow-y-auto space-y-3 scroll-hide pr-2">
              <AnimatePresence>
                {mesa.quitens.length > 0 ? (
                  mesa.quitens.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex justify-between items-start p-3 bg-gradient-to-r from-zinc-50 to-white rounded-xl border border-zinc-200 hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="bg-brand-blue-light text-white text-sm font-bold px-2 py-1 rounded-lg min-w-[2.5rem] text-center">
                            {item.qtd}x
                          </span>
                          <span className="font-semibold text-zinc-800">{item.descricao}</span>
                        </div>
                        {item.obs && (
                          <p className="text-xs text-red-600 italic mt-1 ml-12 bg-red-50 px-2 py-1 rounded">
                            💬 {item.obs}
                          </p>
                        )}
                      </div>
                      <span className="font-bold text-lg text-brand-blue-dark ml-4 whitespace-nowrap">
                        {formatCurrency(item.total)}
                      </span>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-zinc-500 text-center py-8">Nenhum item lançado.</p>
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* Campo Observação Redesenhado */}
          <div className="bg-white p-5 rounded-2xl shadow-lg border border-zinc-200">
            <label className="text-lg font-bold text-zinc-800 mb-3 flex items-center space-x-2">
              <Info size={20} className="text-brand-blue-dark" />
              <span>Observações do Pedido</span>
            </label>
            <textarea
              className="w-full p-4 border-2 border-zinc-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-blue-light focus:border-brand-blue-light transition-all bg-zinc-50 font-medium"
              rows={2}
              placeholder="Ex: Cliente prefere bebidas sem gelo..."
              disabled={isPagamento}
              defaultValue={observacaoAtual}
            />
          </div>

          {/* Botões de Ação - Grid Responsivo */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {isPagamento ? (
              <>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFinalizarMesa}
                  className="col-span-2 bg-gradient-to-r from-brand-accent to-green-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 relative overflow-hidden group"
                >
                  <CheckCircle size={24} />
                  <span>Finalizar (Emissor NFCe)</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFinalizarCaixa}
                  className="col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 relative overflow-hidden group"
                >
                  <Printer size={24} />
                  <span>Finalizar (Imprimir/Caixa)</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAdicionarItens}
                  className="col-span-2 bg-zinc-500 text-white py-3 rounded-xl font-semibold hover:bg-zinc-600 transition-all flex items-center justify-center space-x-2 mt-2"
                >
                  <PlusCircle size={20} />
                  <span>Reabrir / Adicionar Itens</span>
                </motion.button>
              </>
            ) : (
              <>
                {/* Botão de Fechar Mesa Vazia */}
                {mesaVazia && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onFecharMesaVazia}
                    className="col-span-2 bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 rounded-xl font-bold hover:shadow-xl transition-all flex items-center justify-center space-x-2"
                  >
                    <X size={20} />
                    <span>Fechar Mesa (Aberta por Engano)</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onAdicionarItens}
                  className="col-span-2 bg-gradient-to-r from-brand-blue-light to-blue-600 text-white py-5 rounded-xl font-bold text-lg hover:shadow-2xl transition-all flex items-center justify-center space-x-3 relative overflow-hidden group"
                >
                  <PlusCircle size={28} />
                  <span>Adicionar Mais Itens</span>
                  <div className="absolute inset-0 bg-white/20 translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onTransferir}
                  className="bg-zinc-600 text-white py-3 rounded-xl font-semibold hover:bg-zinc-700 transition-all flex items-center justify-center space-x-2 shadow-md"
                >
                  <ArrowRight size={20} />
                  <span>Transferir Mesa</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onJuntar}
                  disabled={mesaVazia}
                  className="bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-all flex items-center justify-center space-x-2 shadow-md disabled:opacity-50"
                >
                  <Combine size={20} />
                  <span>Juntar Mesa</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onFecharConta}
                  disabled={mesaVazia}
                  className="col-span-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <DollarSign size={20} />
                  <span>Solicitar Conta</span>
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled
                  className="col-span-2 bg-zinc-200 text-zinc-500 py-3 rounded-xl font-semibold cursor-not-allowed flex items-center justify-center space-x-2 opacity-60"
                >
                  <Printer size={20} />
                  <span>Imprimir Conta (Em Breve)</span>
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </ReactModal>
  );
}