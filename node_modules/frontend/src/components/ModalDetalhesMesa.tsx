// master-restaurante-v2/packages/frontend/src/components/ModalDetalhesMesa.tsx

import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
import type { Mesa } from '../types';
import { formatCurrency, formatTimeFromISO } from '../utils/helpers';
import {
  X,
  PlusCircle,
  ArrowRight,
  Printer,
  CheckCircle,
  DollarSign,
  Info,
} from 'lucide-react';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onAdicionarItens: () => void;
  onTransferir: () => void;
  onFecharConta: () => void; // Solicita pagamento
  onFinalizarMesa: () => void; // Libera a mesa (NFCe)
}

export function ModalDetalhesMesa({
  mesa,
  onClose,
  onAdicionarItens,
  onTransferir,
  onFecharConta,
  onFinalizarMesa,
}: ModalProps) {
  const status = (mesa.obs || 'NOVO').toUpperCase();
  const isPagamento = status === 'PAGAMENTO';

  // 💡 CORREÇÃO (TS2322): Garante que o valor nunca seja 'null' para o textarea
  const observacaoAtual = (mesa.obs !== 'PAGAMENTO' && mesa.obs !== 'NOVO' ? mesa.obs : '') || '';

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined}
      className="Modal bg-brand-gray-light w-full max-w-2xl mx-auto my-auto rounded-xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="flex flex-col max-h-[90vh]" // Limita a altura total do modal
      >
        {/* Header Fixo */}
        <div className="flex-shrink-0 flex justify-between items-center p-5 border-b bg-white">
          <div>
            <h2 className="text-3xl font-bold text-brand-blue-dark">
              Mesa {mesa.num_quiosque}
            </h2>
            <span className="text-sm text-zinc-500">
              Pedido #{mesa.codseq} • Aberta às {formatTimeFromISO(mesa.data_hora_abertura)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-red-600 transition-all"
          >
            <X size={32} />
          </button>
        </div>

        {/* ========================================================== */}
        {/* 💡 CORREÇÃO (Layout Bugado): Área de Conteúdo com Scroll */}
        {/* ========================================================== */}
        <div className="p-6 flex-1 flex flex-col space-y-4 overflow-y-auto scroll-hide">
          {/* Valor Total */}
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <p className="text-sm font-semibold text-zinc-600">Valor Total</p>
            <p className="text-5xl font-extrabold text-brand-blue-dark">
              {formatCurrency(mesa.total)}
            </p>
          </div>

          {/* Lista de Itens Consumidos */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-zinc-800 mb-2 border-b pb-2">
              Consumo ({mesa.quitens.length} itens)
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2 scroll-hide pr-2">
              {mesa.quitens.length > 0 ? (
                mesa.quitens.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex-1">
                      <span className="font-bold">{item.qtd}x</span> {item.descricao}
                      {item.obs && <p className="text-xs text-red-500 italic pl-4"> - {item.obs}</p>}
                    </div>
                    <span className="font-semibold text-zinc-700">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-zinc-500 text-sm text-center py-4">Nenhum item lançado nesta mesa.</p>
              )}
            </div>
          </div>
          
          {/* Campo Observação (CORRIGIDO) */}
          <div className="bg-white p-4 rounded-lg shadow">
             <label className="text-lg font-semibold text-zinc-800 mb-2 flex items-center space-x-2">
                <Info size={18} />
                <span>Observações do Pedido</span>
            </label>
            <textarea
                className="w-full p-2 border border-brand-gray-mid rounded-lg text-sm focus:ring-brand-blue-light focus:border-brand-blue-light"
                rows={2}
                placeholder="Adicione uma observação aqui..." // Placeholder genérico
                disabled={isPagamento}
                // 💡 CORREÇÃO (Observação): Mostra o valor real (ou vazio)
                defaultValue={observacaoAtual}
                // TODO: Adicionar lógica de 'onChange' e botão 'Salvar Obs'
            >
            </textarea>
          </div>

          {/* Botões de Ação (Agora visíveis) */}
          <div className="grid grid-cols-2 gap-3">
            {isPagamento ? (
              <>
                <button
                  onClick={onFinalizarMesa}
                  className="col-span-2 bg-brand-accent text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-accent/80 transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <CheckCircle size={24} />
                  <span>Liberar Mesa (NFCe)</span>
                </button>
                <button
                  onClick={onAdicionarItens} // Reabre a conta
                  className="col-span-2 bg-zinc-500 text-white py-3 rounded-lg font-semibold hover:bg-zinc-600 transition-all flex items-center justify-center space-x-2"
                >
                  <PlusCircle size={18} />
                  <span>Reabrir / Adicionar Itens</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onAdicionarItens}
                  className="col-span-2 bg-brand-blue-light text-white py-4 rounded-lg font-bold text-lg hover:bg-brand-blue-dark transition-all flex items-center justify-center space-x-2 shadow-lg"
                >
                  <PlusCircle size={24} />
                  <span>Adicionar Itens</span>
                </button>
                <button
                  onClick={onTransferir}
                  className="bg-zinc-600 text-white py-3 rounded-lg font-semibold hover:bg-zinc-700 transition-all flex items-center justify-center space-x-2"
                >
                  <ArrowRight size={18} />
                  <span>Transferir</span>
                </button>
                <button
                  onClick={onFecharConta}
                  className="bg-red-700 text-white py-3 rounded-lg font-semibold hover:bg-red-800 transition-all flex items-center justify-center space-x-2"
                >
                  <DollarSign size={18} />
                  <span>Fechar Conta</span>
                </button>
                <button
                  disabled
                  className="col-span-2 bg-zinc-200 text-zinc-500 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  <Printer size={18} />
                  <span>Imprimir Conta (Breve)</span>
                </button>
              </>
            )}
          </div>
        </div>
        {/* Fim da Área de Scroll */}
      </motion.div>
    </ReactModal>
  );
}