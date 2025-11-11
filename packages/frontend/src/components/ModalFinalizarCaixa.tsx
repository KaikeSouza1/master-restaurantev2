// packages/frontend/src/components/ModalFinalizarCaixa.tsx

import { useState, useRef } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Loader2, DollarSign, CreditCard, Smartphone, Banknote, Printer, CheckCircle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { finalizarMesaCaixa } from '../services/api';
import type { Mesa, EmpresaInfo } from '../types';
import { formatCurrency } from '../utils/helpers';
import { ReciboImpressao } from './ReciboImpressao';

const FORMAS_PAGAMENTO = [
  { id: 1, nome: 'Dinheiro', icon: Banknote },
  { id: 2, nome: 'PIX', icon: Smartphone },
  { id: 3, nome: 'Cartão (Débito)', icon: CreditCard },
  { id: 4, nome: 'Cartão (Crédito)', icon: CreditCard },
];

interface ModalProps {
  mesa: Mesa;
  empresaInfo: EmpresaInfo | null;
  onClose: () => void;
  onFinalizado: () => void;
}

export function ModalFinalizarCaixa({
  mesa,
  empresaInfo,
  onClose,
  onFinalizado,
}: ModalProps) {
  const [formaPagtoId, setFormaPagtoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  
  // --- LÓGICA DE IMPRESSÃO CORRIGIDA ---
  const [isPrinting, setIsPrinting] = useState(false); // Para o UI (texto do botão)
  const isPrintingRef = useRef(false); // <-- NOVO REF (Para a lógica síncrona)
  const componentRef = useRef<HTMLDivElement>(null);
  
 const handlePrint = useReactToPrint({
  contentRef: componentRef,
  pageStyle: `
    @page { 
      size: 80mm auto;
      margin: 0;
    } 
    body { 
      margin: 0;
      -webkit-print-color-adjust: exact;
      color-adjust: exact;
    }
  `,
  onBeforePrint: async () => {
    setIsPrinting(true); // Atualiza o UI
    isPrintingRef.current = true; // Atualiza a lógica IMEDIATAMENTE
  },
  onAfterPrint: async () => {
    setIsPrinting(false); // Atualiza o UI
    isPrintingRef.current = false; // Atualiza a lógica IMEDIATAMENTE
  },
});
  // --- Fim da Lógica de Impressão ---


  const handleSubmit = async () => {
    if (!formaPagtoId) {
      toast.error('Por favor, selecione uma forma de pagamento.');
      return;
    }

    setIsLoading(true);

    const promise = finalizarMesaCaixa(mesa.codseq, {
      cod_forma_pagto: formaPagtoId,
      num_caixa: 1,
    });

    toast.promise(promise, {
      loading: 'Registrando venda no caixa...',
      success: () => {
        onFinalizado();
        setSucesso(true);
        return 'Venda registrada e mesa finalizada!';
      },
      error: (err: any) => {
        console.error('Erro ao finalizar no caixa:', err);
        return `Erro: ${err.response?.data?.message || err.message}`;
      },
    });

    try {
      await promise;
    } catch (err) {
    } finally {
      setIsLoading(false);
    }
  };

  const formaPagtoSelecionada = FORMAS_PAGAMENTO.find(f => f.id === formaPagtoId);

  const handleCloseTotal = () => {
    onFinalizado();
    onClose();
  }

  // Função de fechar o modal que verifica o REF (síncrono)
  const handleModalClose = () => {
    if (isPrintingRef.current) return; // <-- CORREÇÃO: Verifica o REF, não o STATE
    handleCloseTotal();
  }

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={handleModalClose} // <-- USA A FUNÇÃO CORRIGIDA
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
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Finalizar no Caixa</h2>
            <p className="text-white/80 font-semibold">
              Mesa{' '}
              <span className="font-bold text-white text-lg bg-black/20 px-2 rounded-lg">
                {mesa.num_quiosque}
              </span>{' '}
              - Pedido #{mesa.codseq}
            </p>
          </div>
          <motion.button
            onClick={handleCloseTotal}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X size={28} />
          </motion.button>
        </div>

        {sucesso ? (
          // --- TELA DE SUCESSO E IMPRESSÃO ---
          <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-white flex flex-col justify-center items-center">
              <motion.div initial={{scale: 0}} animate={{scale: 1}} transition={{type: 'spring', delay: 0.2}}>
                <CheckCircle size={80} className="text-green-500" />
              </motion.div>
              <h3 className="text-2xl font-bold text-zinc-800">Venda Registrada!</h3>
              <p className="text-zinc-600 text-center">
                A Mesa {mesa.num_quiosque} foi finalizada e o valor lançado no caixa.
              </p>
              
              <motion.button
                onClick={handlePrint}
                disabled={isPrinting} // O state ainda controla o UI
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl transition-all flex items-center justify-center space-x-2 text-lg disabled:opacity-70"
              >
                <Printer size={24} />
                <span>{isPrinting ? 'Imprimindo...' : 'Imprimir Recibo (80mm)'}</span>
              </motion.button>

              <motion.button
                onClick={handleCloseTotal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-3 rounded-lg font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border border-zinc-300 transition-all"
              >
                Fechar
              </motion.button>
          </div>
        ) : (
          // --- TELA DE SELEÇÃO DE PAGAMENTO (COMO ANTES) ---
          <>
            <div className="p-6 flex-1 overflow-y-auto space-y-5 bg-white">
              <div className="text-center bg-zinc-100 p-4 rounded-xl">
                <p className="text-sm font-bold uppercase text-zinc-600">Valor Total a Pagar</p>
                <p className="text-6xl font-black text-blue-700">
                  {formatCurrency(mesa.total)}
                </p>
              </div>
              
              <p className="font-semibold text-zinc-700 text-center">
                Selecione a forma de pagamento:
              </p>

              <div className="grid grid-cols-2 gap-3">
                {FORMAS_PAGAMENTO.map((forma) => (
                  <motion.button
                    key={forma.id}
                    onClick={() => setFormaPagtoId(forma.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-4 rounded-xl transition-all border-4 flex flex-col items-center justify-center space-y-2
                      ${
                        formaPagtoId === forma.id
                          ? 'bg-blue-600 text-white border-blue-800 shadow-xl'
                          : 'bg-zinc-100 text-zinc-800 border-zinc-200 hover:bg-zinc-200'
                      }
                    `}
                  >
                    <forma.icon size={24} />
                    <span className="block text-lg font-bold">
                      {forma.nome}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer com Ações */}
            <div className="flex-shrink-0 p-4 bg-brand-gray-light border-t border-zinc-200 flex justify-end items-center space-x-3">
              <motion.button
                onClick={handleCloseTotal}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-5 py-3 rounded-lg font-semibold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 transition-all"
              >
                Cancelar
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading || !formaPagtoId}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 rounded-lg font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <DollarSign size={20} />
                )}
                <span>
                  {isLoading
                    ? 'Finalizando...'
                    : formaPagtoSelecionada
                      ? `Pagar com ${formaPagtoSelecionada.nome}`
                      : 'Confirmar Pagamento'}
                </span>
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
      
      {/* ========================================================== */}
      {/* <-- COMPONENTE DO RECIBO (ESCONDIDO) --> */}
      {/* =C:/master-restaurante-v2/packages/frontend/src/components/ModalFinalizarCaixa.tsx ========================================= */}
      <div style={{ display: "none" }}>
        <ReciboImpressao ref={componentRef} mesa={mesa} empresaInfo={empresaInfo} />
      </div>

    </ReactModal>
  );
}