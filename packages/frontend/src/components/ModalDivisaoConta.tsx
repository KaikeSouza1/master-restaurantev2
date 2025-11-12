// packages/frontend/src/components/ModalDivisaoConta.tsx

import { useState } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, Users, Calculator, Check } from 'lucide-react';
import type { Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';
import { calcularDivisao, finalizarPedidoNfce } from '../services/api';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onFinalizado: () => void;
}

export function ModalDivisaoConta({ mesa, onClose, onFinalizado }: ModalProps) {
  const [numPessoas, setNumPessoas] = useState(2);
  const [itensPorPessoa, setItensPorPessoa] = useState<Record<number, number>>({});
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Atribuir item para pessoa
  const handleAtribuirItem = (codseqItem: number, pessoa: number) => {
    setItensPorPessoa(prev => ({
      ...prev,
      [codseqItem]: pessoa
    }));
    setResultado(null); // Limpa resultado anterior
  };

  // Calcular divisão
  const handleCalcular = async () => {
    // Verificar se todos itens foram atribuídos
    const todosAtribuidos = mesa.quitens.every(item => 
      item.codseq && itensPorPessoa[item.codseq]
    );

    if (!todosAtribuidos) {
      toast.error('Atribua todos os itens para as pessoas!');
      return;
    }

    setLoading(true);

    try {
      const itensArray = Object.entries(itensPorPessoa).map(([codseq, pessoa]) => ({
        codseq_item: Number(codseq),
        pessoa
      }));

      const res = await calcularDivisao(mesa.codseq, numPessoas, itensArray);
      setResultado(res);
      toast.success('Divisão calculada!');
    } catch (err: any) {
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Finalizar no NFCe
  const handleFinalizar = async () => {
    if (!resultado) {
      toast.error('Calcule a divisão primeiro!');
      return;
    }

    setLoading(true);

    try {
      await finalizarPedidoNfce(mesa.codseq);
      toast.success('Finalizado! Pode emitir no NFCe.');
      onFinalizado();
      onClose();
    } catch (err: any) {
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Cores por pessoa
  const cores = [
    'bg-blue-500',
    'bg-green-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-orange-500',
    'bg-teal-500',
    'bg-cyan-500'
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
              {mesa.quitens.map((item, index) => {
                const pessoaSelecionada = item.codseq ? itensPorPessoa[item.codseq] : null;
                
                return (
                  <div key={item.codseq || index} className="bg-white p-4 rounded-lg border-2 border-zinc-200">
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-bold text-zinc-800">
                          {item.qtd}x {item.descricao}
                        </p>
                        {item.obs && (
                          <p className="text-xs text-zinc-500 italic">{item.obs}</p>
                        )}
                      </div>
                      <p className="text-xl font-black text-blue-700">
                        {formatCurrency(item.total)}
                      </p>
                    </div>

                    {/* Botões de Pessoa */}
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: numPessoas }, (_, i) => i + 1).map(pessoa => (
                        <motion.button
                          key={pessoa}
                          onClick={() => item.codseq && handleAtribuirItem(item.codseq, pessoa)}
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
                    </div>
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
              disabled={loading || Object.keys(itensPorPessoa).length !== mesa.quitens.length}
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