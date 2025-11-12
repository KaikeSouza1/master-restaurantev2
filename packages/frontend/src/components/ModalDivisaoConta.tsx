// packages/frontend/src/components/ModalDivisaoConta.tsx

import React, { useState, useEffect } from 'react'; // <-- IMPORTADO O REACT
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Users, Calculator, Check, Spline, CheckCircle, XCircle } from 'lucide-react';
import type { Mesa, ItemDoPedido } from '../types';
import { formatCurrency } from '../utils/helpers';
import { finalizarPedidoNfce } from '../services/api'; 

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onFinalizado: () => void;
  // --- INÍCIO DA CORREÇÃO ---
  // Adiciona a função para chamar o modal de confirmação do Dashboard
  askForConfirmation: (
    title: string,
    message: React.ReactNode,
    onConfirm: () => Promise<void>,
    variant?: 'danger' | 'success' | 'default'
  ) => void;
  // --- FIM DA CORREÇÃO ---
}

// Interface para o item "desempacotado" ou "dividido"
interface DivisibleItem extends ItemDoPedido {
  unitario: number;
  originalCodseq: number;
  uniqueKey: string;
  isSplittable: boolean;
  isSplitChild: boolean;
  splitCount?: number;
}

export function ModalDivisaoConta({ 
  mesa, 
  onClose, 
  onFinalizado,
  askForConfirmation // <-- Recebe a função
}: ModalProps) {
  const [numPessoas, setNumPessoas] = useState(2);
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [divisibleItens, setDivisibleItens] = useState<DivisibleItem[]>([]);
  const [itensPorPessoa, setItensPorPessoa] = useState<Record<string, number>>({});
  const [splittingKey, setSplittingKey] = useState<string | null>(null);
  const [splitInputValue, setSplitInputValue] = useState<string>('2');

  // Efeito para carregar e "desempacotar" os itens da mesa
  useEffect(() => {
    const newDivisibleList: DivisibleItem[] = [];
    mesa.quitens.forEach(item => {
      if (!item.codseq) return;

      // Prioriza 'item.unitario' (ex: 80.00) sobre 'item.total' (ex: 80.01)
      const unitPrice = (item.unitario && item.unitario > 0)
        ? item.unitario
        : (item.total / item.qtd);

      if (item.qtd > 1) {
        // Desempacota
        for (let i = 0; i < item.qtd; i++) {
          newDivisibleList.push({
            ...item,
            qtd: 1,
            total: unitPrice,
            unitario: unitPrice,
            originalCodseq: item.codseq,
            uniqueKey: `${item.codseq}-${i}`,
            isSplittable: false,
            isSplitChild: false,
          });
        }
      } else {
        // Adiciona como "divisível"
        newDivisibleList.push({
          ...item,
          qtd: 1,
          total: unitPrice,
          unitario: unitPrice,
          originalCodseq: item.codseq,
          uniqueKey: `${item.codseq}-0`,
          isSplittable: true,
          isSplitChild: false,
        });
      }
    });
    setDivisibleItens(newDivisibleList);
    setItensPorPessoa({});
    setResultado(null);
  }, [mesa.quitens]);

  // Atribuir item para pessoa
  const handleAtribuirItem = (uniqueKey: string, pessoa: number) => {
    if (splittingKey) return; 
    setItensPorPessoa(prev => ({
      ...prev,
      [uniqueKey]: pessoa,
    }));
    setResultado(null);
  };

  // Funções para "Dividir 🤝"
  const handleStartSplit = (uniqueKey: string) => {
    setSplittingKey(uniqueKey);
    setSplitInputValue('2');
  };
  
  const handleCancelSplit = () => {
    setSplittingKey(null);
  };

  const handleConfirmSplit = () => {
    if (!splittingKey) return;
    const numSplit = parseInt(splitInputValue, 10);
    if (isNaN(numSplit) || numSplit < 2) {
      toast.error('Número inválido. Insira pelo menos 2.');
      return;
    }

    setDivisibleItens(prevItens => {
      const newItensList: DivisibleItem[] = [];
      const itemIndex = prevItens.findIndex(i => i.uniqueKey === splittingKey);
      if (itemIndex === -1) return prevItens;

      const itemToSplit = prevItens[itemIndex];
      const newDesc = `(1/${numSplit}) ${itemToSplit.descricao}`;

      // LÓGICA DE CÁLCULO DE CENTAVOS (corrigida)
      const totalInCents = Math.round(itemToSplit.total * 100);
      const basePriceInCents = Math.floor(totalInCents / numSplit);
      const remainderCents = totalInCents % numSplit;

      const newSplitChildren: DivisibleItem[] = [];
      for (let i = 0; i < numSplit; i++) {
        const currentPriceInCents = basePriceInCents + (i < remainderCents ? 1 : 0);
        const newPrice = currentPriceInCents / 100.0;

        newSplitChildren.push({
          ...itemToSplit,
          qtd: 1,
          total: newPrice,
          unitario: newPrice,
          descricao: newDesc,
          uniqueKey: `${itemToSplit.uniqueKey}-split-${i}`,
          isSplittable: false,
          isSplitChild: true,
          splitCount: numSplit,
        });
      }

      return [
        ...prevItens.slice(0, itemIndex),
        ...newSplitChildren,
        ...prevItens.slice(itemIndex + 1),
      ];
    });

    setItensPorPessoa({});
    setSplittingKey(null);
  };

  // CÁLCULO 100% LOCAL (FRONTEND)
  const handleCalcular = async () => {
    const todosAtribuidos = divisibleItens.length === Object.keys(itensPorPessoa).length;
    if (!todosAtribuidos) {
      toast.error('Atribua todos os itens para as pessoas!');
      return;
    }
    setLoading(true);
    try {
      const newResultado: any = {
        codseq: mesa.codseq,
        total_conta: mesa.total,
        num_pessoas: numPessoas,
        divisao: {},
      };
      for (let i = 1; i <= numPessoas; i++) {
        newResultado.divisao[i] = { itens: [], total: 0 };
      }
      for (const [uniqueKey, pessoa] of Object.entries(itensPorPessoa)) {
        const item = divisibleItens.find(i => i.uniqueKey === uniqueKey);
        if (!item) continue;
        const pessoaBucket = newResultado.divisao[pessoa];
        pessoaBucket.itens.push({
          descricao: item.descricao,
          qtd: 1,
          total: item.total,
        });
        pessoaBucket.total += item.total;
      }
      for (let i = 1; i <= numPessoas; i++) {
        let totalPessoaCents = 0;
        newResultado.divisao[i].itens.forEach((it: any) => {
            totalPessoaCents += Math.round(it.total * 100);
        });
        newResultado.divisao[i].total = totalPessoaCents / 100.0;
      }
      setResultado(newResultado);
      toast.success('Divisão calculada!');
    } catch (err: any) {
      toast.error(`Erro ao calcular: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };


  // ==========================================================
  // FUNÇÃO ATUALIZADA - Usa o 'askForConfirmation' (ModalConfirmacao)
  // ==========================================================
  const handleFinalizar = async () => {
    if (!resultado) {
      toast.error('Calcule a divisão primeiro!');
      return;
    }

    // Ação de confirmação que será executada se o usuário clicar "OK"
    const onConfirm = async () => {
      setLoading(true);
      try {
        await finalizarPedidoNfce(mesa.codseq);
        // Agora sim, usamos o toast para SUCESSO
        toast.success(`Pedido ${mesa.codseq} finalizado! Pode emitir no NFCe.`);
        onFinalizado();
        onClose();
      } catch (err: any)
      {
        toast.error(`Erro: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    // Chama o Modal de Confirmação que veio do Dashboard
    askForConfirmation(
      `Finalizar Pedido (NFCe)?`,
      // Este é o mesmo layout do outro modal de finalizar
      <div className="space-y-3">
        <p>Confirmar a finalização da Mesa {mesa.num_quiosque}?</p>
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-center">
          <p className="font-semibold text-yellow-900">
            Para finalizar no Emissor NFCe, utilize o Pedido Nº:
          </p>
          <p className="text-3xl font-black text-yellow-900 mt-1">
            {mesa.codseq}
          </p>
        </div>
      </div>,
      onConfirm,
      'danger' // Usa o estilo de botão vermelho/perigo
    );
  };
  // ==========================================================
  // FIM DA FUNÇÃO ATUALIZADA
  // ==========================================================

  const cores = [
    'bg-blue-500', 'bg-green-500', 'bg-red-500', 'bg-yellow-500',
    'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-orange-500',
    'bg-teal-500', 'bg-cyan-500'
  ];

  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined}
      className="Modal bg-white w-full max-w-4xl mx-auto my-auto rounded-2xl shadow-2xl overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="h-full flex flex-col max-h-[90vh]"
      >
        {/* Header AZUL */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">💰 Dividir Conta</h2>
            <p className="text-white/80 font-semibold">
              Mesa {mesa.num_quiosque} - Total: {formatCurrency(mesa.total)}
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

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Número de Pessoas */}
          <div className="bg-blue-50 p-5 rounded-xl border-2 border-blue-200">
            <label className="flex items-center space-x-2 text-lg font-bold text-blue-900 mb-3">
              <Users size={24} />
              <span>Quantas pessoas vão dividir?</span>
            </label>
            <input
              type="number"
              min="2"
              max="10"
              value={numPessoas}
              onChange={(e) => {
                setNumPessoas(Number(e.target.value));
                setItensPorPessoa({});
                setResultado(null);
              }}
              className="w-full px-4 py-3 text-3xl font-black text-center border-2 border-blue-300 rounded-lg focus:border-blue-600 focus:outline-none"
            />
          </div>

          {/* Lista de Itens */}
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
            <h3 className="text-lg font-bold text-zinc-800 mb-4">
              👇 Clique em cada item para escolher quem vai pagar
            </h3>
            <div className="space-y-3">
              {divisibleItens.map((item) => {
                const pessoaSelecionada = itensPorPessoa[item.uniqueKey];
                const isBeingSplit = splittingKey === item.uniqueKey;

                return (
                  <div
                    key={item.uniqueKey}
                    className={`p-4 rounded-lg border-2 transition-all
                      ${isBeingSplit ? 'bg-purple-50 border-purple-400 ring-4 ring-purple-200' :
                       item.isSplitChild ? 'bg-purple-50 border-purple-300' : 
                       'bg-white border-zinc-200'}
                    `}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className={`font-bold ${item.isSplitChild ? 'text-purple-700' : 'text-zinc-800'}`}>
                          {item.isSplitChild ? '' : '1x '} {item.descricao}
                        </p>
                        {item.obs && <p className="text-xs text-zinc-500 italic">{item.obs}</p>}
                      </div>
                      <p className={`text-xl font-black ${item.isSplitChild ? 'text-purple-700' : 'text-blue-700'}`}>
                        {formatCurrency(item.total)}
                      </p>
                    </div>

                    {/* MODO DIVISÃO (INPUT) */}
                    {isBeingSplit ? (
                      <motion.div 
                        initial={{opacity: 0, height: 0}} 
                        animate={{opacity: 1, height: 'auto'}} 
                        className="flex items-center space-x-2 pt-2"
                      >
                        <span className="font-semibold text-purple-800">Dividir em</span>
                        <input
                          type="number"
                          value={splitInputValue}
                          onChange={(e) => setSplitInputValue(e.target.value)}
                          className="w-20 px-3 py-2 text-center font-bold text-lg border-2 border-purple-300 rounded-lg focus:border-purple-600"
                          autoFocus
                          onKeyDown={(e) => e.key === 'Enter' && handleConfirmSplit()}
                        />
                        <span className="font-semibold text-purple-800">pessoas?</span>
                        <motion.button
                          onClick={handleConfirmSplit}
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                        >
                          <CheckCircle size={20} />
                        </motion.button>
                        <motion.button
                          onClick={handleCancelSplit}
                          whileHover={{ scale: 1.1 }}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                        >
                          <XCircle size={20} />
                        </motion.button>
                      </motion.div>
                    
                    ) : (
                    
                      // MODO NORMAL (BOTÕES DE PESSOA)
                      <div className="flex flex-wrap gap-2 items-center">
                        {Array.from({ length: numPessoas }, (_, i) => i + 1).map(pessoa => (
                          <motion.button
                            key={pessoa}
                            onClick={() => handleAtribuirItem(item.uniqueKey, pessoa)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`px-4 py-2 rounded-lg font-bold transition-all ${
                              pessoaSelecionada === pessoa
                                ? `${cores[pessoa - 1]} text-white shadow-lg ring-4 ring-offset-2`
                                : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                            }`}
                          >
                            Pessoa {pessoa}
                          </motion.button>
                        ))}

                        {/* Botão "Dividir 🤝" */}
                        {item.isSplittable && (
                          <motion.button
                            onClick={() => handleStartSplit(item.uniqueKey)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-3 py-2 rounded-lg font-bold transition-all bg-purple-600 text-white hover:bg-purple-700 flex items-center space-x-2 ml-auto"
                          >
                            <Spline size={18} />
                            <span>Dividir 🤝</span>
                          </motion.button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Resultado da Divisão */}
          {resultado && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 p-5 rounded-xl border-2 border-green-300"
            >
              <h3 className="text-xl font-bold text-green-900 mb-4 flex items-center space-x-2">
                <Check size={24} />
                <span>Resumo da Divisão</span>
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(resultado.divisao).map(([pessoa, dados]: [string, any]) => (
                  <div
                    key={pessoa}
                    className={`${cores[Number(pessoa) - 1]} text-white p-4 rounded-xl shadow-lg`}
                  >
                    <p className="font-bold text-sm">Pessoa {pessoa}</p>
                    <p className="text-3xl font-black">{formatCurrency(dados.total)}</p>
                    <p className="text-xs mt-1 opacity-80">{dados.itens.length} itens</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Botões de Ação */}
          <div className="flex gap-3">
            <motion.button
              onClick={handleCalcular}
              disabled={loading || !!splittingKey || Object.keys(itensPorPessoa).length !== divisibleItens.length}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Calculator size={24} />
              <span>Calcular Divisão</span>
            </motion.button>

            {resultado && (
              <motion.button
                onClick={handleFinalizar}
                disabled={loading}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Check size={24} />
                <span>Finalizar (NFCe)</span>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </ReactModal>
  );
}