// packages/frontend/src/components/ModalFinalizarCaixa.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Loader2, DollarSign, CreditCard, Smartphone, Banknote, Printer, CheckCircle, ExternalLink } from 'lucide-react';
import { finalizarMesaCaixa } from '../services/api';
import type { Mesa, EmpresaInfo } from '../types';
import { formatCurrency } from '../utils/helpers';

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
  onFinalizado: () => void; // SÓ chama quando fechar o modal
}

// Função para gerar HTML do recibo - OTIMIZADO PARA 80MM
const gerarHtmlRecibo = (mesa: Mesa, empresaInfo: EmpresaInfo | null): string => {
  const agora = new Date();
  const dataFormatada = agora.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const horaFormatada = agora.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const itensHtml = mesa.quitens.map((item) => `
    <tr>
      <td style="padding: 8px 0; border-bottom: 1px dotted #ccc;">
        <div style="font-weight: bold; font-size: 13px; margin-bottom: 2px;">
          ${item.qtd}x ${item.descricao}
        </div>
        ${item.obs ? `<div style="font-size: 11px; color: #555; font-style: italic; margin-left: 15px;">* ${item.obs}</div>` : ''}
      </td>
      <td style="padding: 8px 0; text-align: right; font-weight: bold; font-size: 13px; white-space: nowrap; border-bottom: 1px dotted #ccc;">
        ${formatCurrency(item.total)}
      </td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comprovante</title>
      <style>
        @page {
          size: 80mm auto;
          margin: 0;
        }
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          width: 302px;
          font-family: 'Courier New', Courier, monospace;
          color: #000;
          padding: 8mm;
          background: white;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .header {
          text-align: center;
          margin-bottom: 15px;
          padding-bottom: 12px;
          border-bottom: 2px solid #000;
        }
        .header h1 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
          text-transform: uppercase;
        }
        .header p {
          font-size: 11px;
          line-height: 1.4;
          margin: 2px 0;
        }
        .separador {
          border-top: 1px dashed #000;
          margin: 12px 0;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          margin: 5px 0;
        }
        .info-row strong {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .total-section {
          border-top: 2px solid #000;
          margin-top: 15px;
          padding-top: 12px;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          font-size: 18px;
          font-weight: bold;
          margin: 8px 0;
        }
        .footer {
          text-align: center;
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px dashed #000;
        }
        .footer p {
          font-size: 12px;
          margin: 3px 0;
        }
        .btn-container {
          text-align: center;
          margin: 30px 0;
          padding: 25px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
        .btn-imprimir {
          background: white;
          color: #667eea;
          border: none;
          padding: 18px 40px;
          font-size: 18px;
          font-weight: bold;
          border-radius: 10px;
          cursor: pointer;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .btn-imprimir:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.3);
        }
        .btn-imprimir:active {
          transform: translateY(0);
        }
        .instrucao {
          color: white;
          font-size: 13px;
          margin-top: 12px;
          font-weight: 500;
        }
        @media print {
          body {
            padding: 5mm;
          }
          .btn-container {
            display: none !important;
          }
        }
      </style>
    </head>
    <body>
      
      <!-- CABEÇALHO -->
      <div class="header">
        <h1>${empresaInfo?.nome || 'RESTAURANTE'}</h1>
        <p>${empresaInfo?.endere}, ${empresaInfo?.num}</p>
        <p>${empresaInfo?.bairro} - ${empresaInfo?.cidade}/${empresaInfo?.estado}</p>
        <p>Tel: ${empresaInfo?.fone}</p>
      </div>

      <!-- BOTÃO DE IMPRESSÃO -->
      <div class="btn-container">
        <button class="btn-imprimir" onclick="window.print()">
          🖨️ IMPRIMIR AGORA
        </button>
        <p class="instrucao">Clique no botão acima para imprimir</p>
      </div>

      <!-- INFORMAÇÕES DO PEDIDO -->
      <div class="info-row">
        <span>Data:</span>
        <strong>${dataFormatada}</strong>
      </div>
      <div class="info-row">
        <span>Hora:</span>
        <strong>${horaFormatada}</strong>
      </div>

      <div class="separador"></div>

      <!-- ITENS DO PEDIDO -->
      <table>
        <tbody>
          ${itensHtml}
        </tbody>
      </table>

      <!-- TOTAL -->
      <div class="total-section">
        <div class="total-row">
          <span>TOTAL A PAGAR:</span>
          <span>${formatCurrency(mesa.total)}</span>
        </div>
      </div>

      <!-- RODAPÉ -->
      <div class="footer">
        <p><strong>★★★ OBRIGADO PELA PREFERÊNCIA! ★★★</strong></p>
        <p style="margin-top: 8px; font-size: 10px;">Documento não fiscal</p>
      </div>

    </body>
    </html>
  `;
};

export function ModalFinalizarCaixa({
  mesa,
  empresaInfo,
  onClose,
  onFinalizado,
}: ModalProps) {
  const [formaPagtoId, setFormaPagtoId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const handleSubmit = async () => {
    if (!formaPagtoId) {
      toast.error('Por favor, selecione uma forma de pagamento.');
      return;
    }

    setIsLoading(true);

    try {
      await finalizarMesaCaixa(mesa.codseq, {
        cod_forma_pagto: formaPagtoId,
        num_caixa: 1,
      });
      
      toast.success('✅ Venda registrada no caixa!');
      setSucesso(true);
      // NÃO CHAMA onFinalizado() AQUI! Só na hora de fechar o modal
      
    } catch (err: any) {
      console.error('Erro ao finalizar no caixa:', err);
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImprimirNovaAba = () => {
    const htmlRecibo = gerarHtmlRecibo(mesa, empresaInfo);
    const novaAba = window.open('', '_blank');
    
    if (novaAba) {
      novaAba.document.write(htmlRecibo);
      novaAba.document.close();
      toast.success('📄 Recibo aberto em nova aba!');
    } else {
      toast.error('❌ Não foi possível abrir nova aba. Verifique se pop-ups não estão bloqueados.');
    }
  };

  // FUNÇÃO QUE FECHA O MODAL E ATUALIZA O DASHBOARD
  const handleFecharModal = () => {
    onFinalizado(); // Atualiza o dashboard
    onClose(); // Fecha o modal
  };

  const formaPagtoSelecionada = FORMAS_PAGAMENTO.find(f => f.id === formaPagtoId);

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={handleFecharModal} // Usa a função de fechar
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
            <h2 className="text-3xl font-black tracking-tight">
              {sucesso ? '✅ Pagamento Concluído' : 'Finalizar no Caixa'}
            </h2>
            <p className="text-white/80 font-semibold">
              Mesa{' '}
              <span className="font-bold text-white text-lg bg-black/20 px-2 rounded-lg">
                {mesa.num_quiosque}
              </span>{' '}
              - Pedido #{mesa.codseq}
            </p>
          </div>
          <motion.button
            onClick={handleFecharModal}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            className="text-white hover:bg-white/20 rounded-full p-2 transition-all"
          >
            <X size={28} />
          </motion.button>
        </div>

        {sucesso ? (
          // ========================================
          // TELA DE SUCESSO - FICA ABERTA ATÉ FECHAR
          // ========================================
          <div className="p-8 flex-1 overflow-y-auto space-y-6 bg-white flex flex-col justify-center items-center">
              <motion.div 
                initial={{scale: 0}} 
                animate={{scale: 1}} 
                transition={{type: 'spring', delay: 0.2}}
              >
                <CheckCircle size={100} className="text-green-500" />
              </motion.div>
              
              <h3 className="text-3xl font-black text-zinc-800 text-center">
                Venda Registrada com Sucesso!
              </h3>
              
              <div className="w-full bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200">
                <p className="text-center text-zinc-700 text-lg">
                  Mesa <span className="font-black text-green-700">{mesa.num_quiosque}</span> finalizada
                </p>
                <p className="text-center text-4xl font-black text-green-700 mt-2">
                  {formatCurrency(mesa.total)}
                </p>
                <p className="text-center text-sm text-zinc-600 mt-1">
                  Valor lançado no caixa
                </p>
              </div>
              
              {/* BOTÃO DE IMPRESSÃO - GRANDE E VISÍVEL */}
              <motion.button
                onClick={handleImprimirNovaAba}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-6 rounded-xl font-black text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:shadow-2xl transition-all flex items-center justify-center space-x-3 text-2xl border-4 border-blue-800"
              >
                <Printer size={32} />
                <span>IMPRIMIR RECIBO (80mm)</span>
              </motion.button>

              <div className="w-full p-4 bg-blue-50 border-2 border-blue-300 rounded-xl">
                <p className="text-sm text-blue-900 text-center font-semibold">
                  💡 O recibo será aberto em uma nova aba. Clique no botão de impressão que aparecerá lá!
                </p>
              </div>

              {/* BOTÃO DE FECHAR - SECUNDÁRIO */}
              <motion.button
                onClick={handleFecharModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full px-8 py-4 rounded-xl font-bold text-zinc-700 bg-zinc-100 hover:bg-zinc-200 border-2 border-zinc-300 transition-all text-lg"
              >
                Fechar e Voltar ao Dashboard
              </motion.button>
          </div>
        ) : (
          // ========================================
          // TELA DE SELEÇÃO DE PAGAMENTO
          // ========================================
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
                onClick={onClose} // Fecha SEM chamar onFinalizado
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
    </ReactModal>
  );
}