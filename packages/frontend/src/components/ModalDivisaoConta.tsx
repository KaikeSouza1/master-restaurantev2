// packages/frontend/src/components/ModalDivisaoConta.tsx

import { useState, useEffect } from 'react';
import ReactModal from 'react-modal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { X, DollarSign, CreditCard, Smartphone, Banknote, Plus, Check, Loader2 } from 'lucide-react';
import type { Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';
import { obterStatusDivisao, registrarPagamentoParcial, finalizarPedidoDividido } from '../services/api';

const FORMAS_PAGAMENTO = [
  { id: 1, nome: 'Dinheiro', icon: Banknote, cor: 'from-green-500 to-green-600' },
  { id: 2, nome: 'PIX', icon: Smartphone, cor: 'from-cyan-500 to-cyan-600' },
  { id: 3, nome: 'Débito', icon: CreditCard, cor: 'from-blue-500 to-blue-600' },
  { id: 4, nome: 'Crédito', icon: CreditCard, cor: 'from-purple-500 to-purple-600' },
];

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onFinalizado: () => void;
}

interface Pagamento {
  pessoa_numero: number;
  nome_pessoa?: string;
  valor_pago: number;
  forma_pagamento: number;
  data_hora: string;
}

export function ModalDivisaoConta({ mesa, onClose, onFinalizado }: ModalProps) {
  const [loading, setLoading] = useState(true);
  const [totalConta, setTotalConta] = useState(0);
  const [totalPago, setTotalPago] = useState(0);
  const [totalRestante, setTotalRestante] = useState(0);
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [podeFinalizar, setPodeFinalizar] = useState(false);

  // Estado do formulário de novo pagamento
  const [nomePessoa, setNomePessoa] = useState('');
  const [valorPagar, setValorPagar] = useState('');
  const [formaSelecionada, setFormaSelecionada] = useState<number | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [finalizando, setFinalizando] = useState(false);

  const carregarStatus = async () => {
    setLoading(true);
    try {
      const status = await obterStatusDivisao(mesa.codseq);
      setTotalConta(status.total_conta);
      setTotalPago(status.total_pago);
      setTotalRestante(status.total_restante);
      setPagamentos(status.pagamentos || []);
      setPodeFinalizar(status.pode_finalizar);
    } catch (err: any) {
      console.error('Erro ao carregar status:', err);
      toast.error('Erro ao carregar divisão de conta');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarStatus();
  }, [mesa.codseq]);

  const handleRegistrarPagamento = async () => {
    const valor = parseFloat(valorPagar.replace(',', '.'));

    if (!valor || valor <= 0) {
      toast.error('Digite um valor válido');
      return;
    }

    if (valor > totalRestante) {
      toast.error(`Valor não pode ser maior que o restante (${formatCurrency(totalRestante)})`);
      return;
    }

    if (!formaSelecionada) {
      toast.error('Selecione uma forma de pagamento');
      return;
    }

    setEnviando(true);

    try {
      const proximaPessoa = pagamentos.length + 1;

      await registrarPagamentoParcial(mesa.codseq, {
        pessoa_numero: proximaPessoa,
        nome_pessoa: nomePessoa || undefined,
        valor_pago: valor,
        forma_pagamento: formaSelecionada,
      });

      toast.success(`Pagamento de ${formatCurrency(valor)} registrado!`);

      // Limpar formulário
      setNomePessoa('');
      setValorPagar('');
      setFormaSelecionada(null);

      // Recarregar status
      await carregarStatus();

    } catch (err: any) {
      console.error('Erro ao registrar pagamento:', err);
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const handleFinalizar = async () => {
    if (!podeFinalizar) {
      toast.error('Ainda falta pagar parte da conta!');
      return;
    }

    setFinalizando(true);

    try {
      await finalizarPedidoDividido(mesa.codseq);
      toast.success('Conta dividida e finalizada! Pode emitir no NFCe.');
      onFinalizado();
      onClose();
    } catch (err: any) {
      console.error('Erro ao finalizar:', err);
      toast.error(`Erro: ${err.response?.data?.message || err.message}`);
    } finally {
      setFinalizando(false);
    }
  };

  const formaPagtoNome = (id: number) => FORMAS_PAGAMENTO.find(f => f.id === id)?.nome || 'Desconhecido';

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
        exit={{ scale: 0.9, opacity: 0 }}
        className="h-full flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-purple-600 to-indigo-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-black">Dividir Conta</h2>
            <p className="text-white/80 font-semibold">
              Mesa {mesa.num_quiosque} - Pedido #{mesa.codseq}
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

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 size={48} className="animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Resumo Financeiro */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                <p className="text-sm font-bold text-blue-700">Total da Conta</p>
                <p className="text-3xl font-black text-blue-900">{formatCurrency(totalConta)}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-xl border-2 border-green-200">
                <p className="text-sm font-bold text-green-700">Total Pago</p>
                <p className="text-3xl font-black text-green-900">{formatCurrency(totalPago)}</p>
              </div>
              <div className={`p-4 rounded-xl border-2 ${
                totalRestante <= 0.01 
                  ? 'bg-emerald-50 border-emerald-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <p className={`text-sm font-bold ${
                  totalRestante <= 0.01 ? 'text-emerald-700' : 'text-red-700'
                }`}>
                  {totalRestante <= 0.01 ? '✅ Quitado!' : 'Restante'}
                </p>
                <p className={`text-3xl font-black ${
                  totalRestante <= 0.01 ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {formatCurrency(totalRestante)}
                </p>
              </div>
            </div>

            {/* Lista de Pagamentos Registrados */}
            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-200">
              <h3 className="text-lg font-bold text-zinc-800 mb-4">Pagamentos Registrados</h3>
              {pagamentos.length === 0 ? (
                <p className="text-zinc-500 text-center py-8">Nenhum pagamento registrado ainda</p>
              ) : (
                <div className="space-y-3">
                  {pagamentos.map((pag, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex justify-between items-center bg-white p-4 rounded-lg border border-zinc-200"
                    >
                      <div>
                        <p className="font-bold text-zinc-800">
                          Pessoa {pag.pessoa_numero}
                          {pag.nome_pessoa && <span className="text-zinc-500 font-normal"> ({pag.nome_pessoa})</span>}
                        </p>
                        <p className="text-sm text-zinc-600">
                          {formaPagtoNome(pag.forma_pagamento)} • {new Date(pag.data_hora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-green-700">{formatCurrency(pag.valor_pago)}</p>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Formulário de Novo Pagamento */}
            {totalRestante > 0.01 && (
              <div className="bg-purple-50 p-6 rounded-xl border-2 border-purple-200">
                <h3 className="text-xl font-bold text-purple-900 mb-4 flex items-center space-x-2">
                  <Plus size={24} />
                  <span>Registrar Novo Pagamento</span>
                </h3>

                <div className="space-y-4">
                  {/* Nome (opcional) */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Nome da Pessoa (opcional)
                    </label>
                    <input
                      type="text"
                      value={nomePessoa}
                      onChange={(e) => setNomePessoa(e.target.value)}
                      placeholder="Ex: João, Maria..."
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Valor */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Valor Pago *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={valorPagar}
                      onChange={(e) => setValorPagar(e.target.value)}
                      placeholder="0,00"
                      className="w-full px-4 py-3 border-2 border-zinc-300 rounded-lg focus:border-purple-500 focus:outline-none text-2xl font-bold"
                    />
                    <button
                      onClick={() => setValorPagar(totalRestante.toFixed(2))}
                      className="mt-2 text-sm text-purple-600 hover:text-purple-800 font-semibold"
                    >
                      💡 Preencher com valor restante ({formatCurrency(totalRestante)})
                    </button>
                  </div>

                  {/* Forma de Pagamento */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-700 mb-2">
                      Forma de Pagamento *
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {FORMAS_PAGAMENTO.map((forma) => (
                        <motion.button
                          key={forma.id}
                          onClick={() => setFormaSelecionada(forma.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`p-4 rounded-xl transition-all border-4 flex flex-col items-center space-y-2 ${
                            formaSelecionada === forma.id
                              ? `bg-gradient-to-r ${forma.cor} text-white border-white shadow-xl`
                              : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-300'
                          }`}
                        >
                          <forma.icon size={24} />
                          <span className="text-sm font-bold">{forma.nome}</span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Registrar */}
                  <motion.button
                    onClick={handleRegistrarPagamento}
                    disabled={enviando}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {enviando ? (
                      <Loader2 size={24} className="animate-spin" />
                    ) : (
                      <Plus size={24} />
                    )}
                    <span>{enviando ? 'Registrando...' : 'Registrar Pagamento'}</span>
                  </motion.button>
                </div>
              </div>
            )}

            {/* Botão de Finalizar (quando tudo pago) */}
            {podeFinalizar && (
              <motion.button
                onClick={handleFinalizar}
                disabled={finalizando}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-gradient-to-r from-green-600 to-emerald-700 text-white py-6 rounded-xl font-black text-2xl hover:shadow-2xl transition-all disabled:opacity-50 flex items-center justify-center space-x-3"
              >
                {finalizando ? (
                  <Loader2 size={32} className="animate-spin" />
                ) : (
                  <Check size={32} />
                )}
                <span>{finalizando ? 'Finalizando...' : 'Finalizar Conta (NFCe)'}</span>
              </motion.button>
            )}

          </div>
        )}
      </motion.div>
    </ReactModal>
  );
}