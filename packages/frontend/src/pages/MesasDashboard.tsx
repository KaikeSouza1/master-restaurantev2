// packages/frontend/src/pages/MesasDashboard.tsx

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  getMesasStatus,
  abrirMesa,
  solicitarFechamento,
  liberarMesa,
} from '../services/api';
import type { Mesa } from '../types';
import { MesaCardDashboard } from '../components/MesaCardDashboard';
import { ModalDetalhesMesa } from '../components/ModalDetalhesMesa';
import { ModalAdicionarItens } from '../components/ModalAdicionarItens';
import { ModalTransferirMesa } from '../components/ModalTransferirMesa';
import { ModalConfirmacao } from '../components/ModalConfirmacao'; // Importado
import { Loader2, AlertTriangle, LayoutGrid, Filter } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const TOTAL_MESAS = 20;

type FiltroStatus = 'TODAS' | 'LIVRE' | 'OCUPADA' | 'PAGAMENTO';

const filtros: {
  label: string;
  valor: FiltroStatus;
  icon: string;
  cor: string;
}[] = [
  { label: 'Todas', valor: 'TODAS', icon: '🏠', cor: 'from-zinc-500 to-zinc-600' },
  {
    label: 'Ocupadas',
    valor: 'OCUPADA',
    icon: '🔴',
    cor: 'from-red-600 to-red-700',
  },
  {
    label: 'Livres',
    valor: 'LIVRE',
    icon: '✅',
    cor: 'from-green-500 to-green-600',
  },
  {
    label: 'Pagamento',
    valor: 'PAGAMENTO',
    icon: '💳',
    cor: 'from-yellow-500 to-amber-600',
  },
];

export function MesasDashboard() {
  const [mesasAtivas, setMesasAtivas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalAdicionar, setModalAdicionar] = useState(false);

  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODAS');

  const [isConfirmLoading, setIsConfirmLoading] = useState(false);
  const [confirmModalProps, setConfirmModalProps] = useState<{
    isOpen: boolean;
    title: string;
    message: React.ReactNode;
    onConfirm: () => Promise<void>;
    variant?: 'danger' | 'success' | 'default';
  } | null>(null);

  // Função helper para abrir o modal de confirmação
  const askForConfirmation = (
    title: string,
    message: React.ReactNode,
    onConfirm: () => Promise<void>,
    variant: 'danger' | 'success' | 'default' = 'default',
  ) => {
    setConfirmModalProps({ isOpen: true, title, message, onConfirm, variant });
  };

  const fetchMesas = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getMesasStatus();
      setMesasAtivas(data);
    } catch (err) {
      setError('Falha ao carregar o status das mesas.');
      console.error(err);
      toast.error('Falha ao carregar o status das mesas.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMesas(true);
    const intervalId = setInterval(() => fetchMesas(false), 15000);
    return () => clearInterval(intervalId);
  }, [fetchMesas]);

  const handleAbrirMesa = async (numMesa: number) => {
    if (loading) return;
    setLoading(true);
    setError(null);

    const promise = abrirMesa(numMesa);

    toast.promise(promise, {
      loading: `Abrindo mesa ${numMesa}...`,
      success: (novaMesaApi) => {
        const novaMesaSegura: Mesa = {
          ...novaMesaApi,
          quitens: novaMesaApi.quitens || [],
        };

        setMesasAtivas((prev) => {
          const mesasAtualizadas = prev.filter(
            (m) => m.num_quiosque !== numMesa,
          );
          return [...mesasAtualizadas, novaMesaSegura];
        });

        setMesaSelecionada(novaMesaSegura);
        setModalDetalhes(true);

        setTimeout(() => {
          fetchMesas(false);
        }, 500);

        return `Mesa ${numMesa} aberta!`;
      },
      error: (err: any) => {
        console.error('Erro ao abrir mesa:', err);
        return `Erro ao abrir mesa: ${
          err.response?.data?.message || err.message
        }`;
      },
    });

    try {
      await promise;
    } catch (err) {
      // O toast.promise já cuida do erro
    } finally {
      setLoading(false);
    }
  };

  const handleSolicitarFechamento = async () => {
    if (!mesaSelecionada || !mesaSelecionada.codseq) return;

    const codseq = mesaSelecionada.codseq;

    const onConfirm = async () => {
      setLoading(true);
      const promise = solicitarFechamento(codseq);

      toast.promise(promise, {
        loading: 'Solicitando fechamento...',
        success: (mesaAtualizadaApi) => {
          setMesaSelecionada((mesaAntiga) => {
            if (!mesaAntiga) return null;
            const mesaSegura: Mesa = {
              ...mesaAntiga,
              ...mesaAtualizadaApi,
              quitens: mesaAntiga.quitens || [],
            };
            setMesasAtivas((prev) =>
              prev.map((m) =>
                m.codseq === mesaSegura.codseq ? mesaSegura : m,
              ),
            );
            return mesaSegura;
          });
          fetchMesas(false);
          return 'Conta solicitada!';
        },
        error: (err: any) =>
          `Erro: ${err.response?.data?.message || err.message}`,
      });

      try {
        await promise;
      } catch (err) {
        // Erro tratado
      } finally {
        setLoading(false);
      }
    };

    askForConfirmation(
      'Solicitar Conta?',
      `Confirmar a solicitação de fechamento da Mesa ${mesaSelecionada.num_quiosque}?`,
      onConfirm,
      'success',
    );
  };

  const handleLiberarMesa = async () => {
    if (!mesaSelecionada || !mesaSelecionada.codseq) return;

    const codseq = mesaSelecionada.codseq;
    const numQuiosque = mesaSelecionada.num_quiosque;

    const onConfirm = async () => {
      setLoading(true);
      const promise = liberarMesa(codseq);

      toast.promise(promise, {
        loading: 'Finalizando pedido...',
        success: () => {
          setMesasAtivas((prev) => prev.filter((m) => m.codseq !== codseq));
          setModalDetalhes(false);
          setMesaSelecionada(null);
          setTimeout(() => {
            fetchMesas(false);
          }, 500);
          return 'Mesa finalizada com sucesso!';
        },
        error: (err: any) => {
          console.error('Erro ao liberar mesa:', err);
          return `Erro: ${err.response?.data?.message || err.message}`;
        },
      });

      try {
        await promise;
      } catch (err) {
        // Erro tratado
      } finally {
        setLoading(false);
      }
    };

    // ==========================================================
    // <-- ÚNICA ALTERAÇÃO AQUI
    // Mensagem de confirmação mais explícita para o NFCe
    // ==========================================================
    askForConfirmation(
      `Finalizar Pedido (NFCe)?`, // Título atualizado
      <div className="space-y-3">
        <p>Confirmar a finalização da Mesa {numQuiosque}?</p>

        {/* Bloco destacado */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-3 text-center">
          <p className="font-semibold text-yellow-900">
            Para finalizar no Emissor NFCe, utilize o Pedido Nº:
          </p>
          <p className="text-3xl font-black text-yellow-900 mt-1">
            {codseq}
          </p>
        </div>
      </div>,
      onConfirm,
      'danger',
    );
  };

  const handleFecharMesaVazia = async () => {
    if (!mesaSelecionada || !mesaSelecionada.codseq) return;

    if (mesaSelecionada.quitens.length > 0) {
      toast.error(
        'Esta mesa possui itens! Use a opção "Solicitar Conta" ou "Liberar Mesa".',
      );
      return;
    }

    const codseq = mesaSelecionada.codseq;
    const numQuiosque = mesaSelecionada.num_quiosque;

    const onConfirm = async () => {
      setLoading(true);
      const promise = liberarMesa(codseq);

      toast.promise(promise, {
        loading: 'Fechando mesa vazia...',
        success: () => {
          setMesasAtivas((prev) => prev.filter((m) => m.codseq !== codseq));
          setModalDetalhes(false);
          setMesaSelecionada(null);
          setTimeout(() => {
            fetchMesas(false);
          }, 500);
          return 'Mesa fechada com sucesso!';
        },
        error: (err: any) => {
          console.error('Erro ao fechar mesa:', err);
          return `Erro: ${err.response?.data?.message || err.message}`;
        },
      });

      try {
        await promise;
      } catch (err) {
        // Erro tratado
      } finally {
        setLoading(false);
      }
    };

    askForConfirmation(
      `Fechar Mesa ${numQuiosque}?`,
      <p>
        Use esta opção apenas se a mesa foi aberta por engano ou para teste.
      </p>,
      onConfirm,
      'danger',
    );
  };

  const handleAbrirDetalhes = (mesa: Mesa) => {
    if (mesa.codseq === 0) {
      askForConfirmation(
        `Abrir Mesa ${mesa.num_quiosque}?`,
        'Você confirma a abertura desta mesa?',
        () => handleAbrirMesa(mesa.num_quiosque!),
        'success',
      );
    } else {
      setMesaSelecionada(mesa);
      setModalDetalhes(true);
    }
  };

  const handleAbrirAdicionarItens = () => {
    setModalAdicionar(true);
  };

  const handleAbrirTransferir = () => {
    setModalTransferir(true);
  };

  // Lógica de Geração das Mesas
  const mesasMapeadas = new Map(
    mesasAtivas.map((m) => [m.num_quiosque, m]),
  );
  const mesasCompletas: Mesa[] = [];
  const mesasLivres: Mesa[] = [];

  for (let i = 1; i <= TOTAL_MESAS; i++) {
    const ativa = mesasMapeadas.get(i);
    if (ativa) {
      mesasCompletas.push(ativa);
    } else {
      const livre: Mesa = {
        codseq: 0,
        num_quiosque: i,
        tipo: 'M',
        vda_finalizada: 'N',
        obs: 'LIVRE',
        data_hora_abertura: '',
        sub_total_geral: 0,
        total: 0,
        quitens: [],
        nome_cli_esp: null,
        fone_esp: null,
      };
      mesasCompletas.push(livre);
      mesasLivres.push(livre);
    }
  }

  const mesasFiltradas = mesasCompletas.filter((mesa) => {
    if (filtroStatus === 'TODAS') return true;
    if (filtroStatus === 'LIVRE') return mesa.codseq === 0;
    if (filtroStatus === 'OCUPADA')
      return mesa.codseq !== 0 && mesa.obs !== 'PAGAMENTO';
    if (filtroStatus === 'PAGAMENTO') return mesa.obs === 'PAGAMENTO';
    return true;
  });

  // Estatísticas
  const stats = {
    total: mesasCompletas.length,
    ocupadas: mesasCompletas.filter(
      (m) => m.codseq !== 0 && m.obs !== 'PAGAMENTO',
    ).length,
    livres: mesasCompletas.filter((m) => m.codseq === 0).length,
    pagamento: mesasCompletas.filter((m) => m.obs === 'PAGAMENTO').length,
  };

  if (loading && mesasAtivas.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-10 bg-red-100 rounded-lg shadow-lg">
        <AlertTriangle size={24} className="text-red-600 mr-3" />
        <p className="text-red-700">
          Erro: {error}. Tente recarregar a página.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Loading Indicator */}
      <AnimatePresence>
        {loading && !isConfirmLoading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-6 right-6 z-50 p-4 bg-white rounded-2xl shadow-2xl border-2 border-brand-blue-light"
          >
            <Loader2 className="animate-spin text-brand-blue-dark" size={32} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header com Estatísticas */}
      <div className="bg-gradient-to-br from-white to-brand-gray-light p-6 rounded-2xl shadow-xl border border-zinc-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-blue-dark p-3 rounded-xl">
              <LayoutGrid size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-brand-blue-dark">
                Painel de Mesas
              </h1>
              <p className="text-zinc-600 font-medium">Gestão em tempo real</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg"
            >
              <p className="text-xs font-bold uppercase">Ocupadas</p>
              <p className="text-2xl font-black">{stats.ocupadas}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-green-600 text-white px-4 py-2 rounded-xl shadow-lg"
            >
              <p className="text-xs font-bold uppercase">Livres</p>
              <p className="text-2xl font-black">{stats.livres}</p>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-yellow-500 text-white px-4 py-2 rounded-xl shadow-lg"
            >
              <p className="text-xs font-bold uppercase">Pagamento</p>
              <p className="text-2xl font-black">{stats.pagamento}</p>
            </motion.div>
          </div>
        </div>

        {/* Filtros Modernos */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-zinc-600">
            <Filter size={20} />
            <span className="font-semibold">Filtrar:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {filtros.map((filtro) => (
              <motion.button
                key={filtro.valor}
                onClick={() => setFiltroStatus(filtro.valor)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 font-bold rounded-xl transition-all text-sm flex items-center space-x-2 ${
                  filtroStatus === filtro.valor
                    ? `bg-gradient-to-r ${filtro.cor} text-white shadow-xl ring-4 ring-offset-2 ring-offset-white`
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 shadow-md border border-zinc-200'
                }`}
              >
                <span className="text-base">{filtro.icon}</span>
                <span>{filtro.label}</span>
                {filtroStatus === filtro.valor && (
                  <span className="bg-white/30 px-2 py-0.5 rounded-full text-xs font-black">
                    {mesasFiltradas.length}
                  </span>
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Mesas com Animação */}
      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-5"
      >
        <AnimatePresence mode="popLayout">
          {mesasFiltradas.length > 0 ? (
            mesasFiltradas.map((mesa) => (
              <MesaCardDashboard
                key={mesa.num_quiosque}
                mesa={mesa}
                onClick={() => handleAbrirDetalhes(mesa)}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-center p-12 bg-white rounded-2xl shadow-lg border-2 border-dashed border-zinc-300"
            >
              <p className="text-zinc-500 text-lg font-semibold">
                Nenhuma mesa encontrada para o filtro "{filtroStatus}".
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Modais */}
      <AnimatePresence>
        {/* Modal de Detalhes */}
        {modalDetalhes && mesaSelecionada && (
          <ModalDetalhesMesa
            mesa={mesaSelecionada}
            onClose={() => setModalDetalhes(false)}
            onAdicionarItens={handleAbrirAdicionarItens}
            onTransferir={handleAbrirTransferir}
            onFecharConta={handleSolicitarFechamento}
            onFinalizarMesa={handleLiberarMesa}
            onFecharMesaVazia={handleFecharMesaVazia}
          />
        )}

        {/* Modal de Adicionar Itens */}
        {modalAdicionar && mesaSelecionada && (
          <ModalAdicionarItens
            mesa={mesaSelecionada}
            onClose={() => setModalAdicionar(false)}
            onItensAdd={async () => {
              setModalAdicionar(false);
              await fetchMesas(false);
              const mesasAtualizadas = await getMesasStatus();
              if (!mesaSelecionada?.codseq) {
                console.warn('Callback onItensAdd sem mesa selecionada.');
                setModalDetalhes(false);
                setMesaSelecionada(null);
                return;
              }
              const mesaAtualizada = mesasAtualizadas.find(
                (m) => m.codseq === mesaSelecionada.codseq,
              );
              if (mesaAtualizada) {
                setMesasAtivas(mesasAtualizadas);
                setMesaSelecionada(mesaAtualizada);
              } else {
                setModalDetalhes(false);
                setMesaSelecionada(null);
              }
            }}
          />
        )}

        {/* Modal de Transferir Mesa */}
        {modalTransferir && mesaSelecionada && (
          <ModalTransferirMesa
            mesa={mesaSelecionada}
            mesasLivres={mesasLivres}
            onClose={() => setModalTransferir(false)}
            onTransferido={async () => {
              setModalTransferir(false);
              setModalDetalhes(false);
              setMesaSelecionada(null);
              await fetchMesas(false);
            }}
          />
        )}

        {/* Modal de Confirmação (NOVO) */}
        {confirmModalProps?.isOpen && (
          <ModalConfirmacao
            isOpen={true}
            title={confirmModalProps.title}
            message={confirmModalProps.message}
            variant={confirmModalProps.variant}
            isLoading={isConfirmLoading}
            onClose={() => setConfirmModalProps(null)}
            onConfirm={async () => {
              setIsConfirmLoading(true);
              try {
                await confirmModalProps.onConfirm();
              } catch (e) {
                console.error('Erro ao executar confirmação:', e);
                toast.error('Ocorreu um erro inesperado.');
              } finally {
                setIsConfirmLoading(false);
                setConfirmModalProps(null);
              }
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}