// master-restaurante-v2/packages/frontend/src/pages/MesasDashboard.tsx

import { useState, useEffect, useCallback } from 'react';
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
import { Loader2, AlertTriangle } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

const TOTAL_MESAS = 20; // Número fixo de mesas para exibição

type FiltroStatus = 'TODAS' | 'LIVRE' | 'OCUPADA' | 'PAGAMENTO';

const filtros: { label: string; valor: FiltroStatus }[] = [
  { label: 'Todas', valor: 'TODAS' },
  { label: 'Ocupadas', valor: 'OCUPADA' },
  { label: 'Livres', valor: 'LIVRE' },
  { label: 'Pagamento', valor: 'PAGAMENTO' },
];

export function MesasDashboard() {
  const [mesasAtivas, setMesasAtivas] = useState<Mesa[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados dos Modais
  const [mesaSelecionada, setMesaSelecionada] = useState<Mesa | null>(null);
  const [modalDetalhes, setModalDetalhes] = useState(false);
  const [modalTransferir, setModalTransferir] = useState(false);
  const [modalAdicionar, setModalAdicionar] = useState(false);
  
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>('TODAS');

  const fetchMesas = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const data = await getMesasStatus();
      setMesasAtivas(data);
    } catch (err) {
      setError('Falha ao carregar o status das mesas.');
      console.error(err);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  // Efeito de Atualização Automática e Carga Inicial
  useEffect(() => {
    fetchMesas(true); // Carga inicial com loading
    const intervalId = setInterval(() => fetchMesas(false), 15000); // Atualização silenciosa
    return () => clearInterval(intervalId);
  }, [fetchMesas]);

  // --- Lógica de Abertura de Mesa ---
  const handleAbrirMesa = async (numMesa: number) => {
    if (loading) return;
    setLoading(true);
    try {
      const novaMesa = await abrirMesa(numMesa);
      await fetchMesas(false); // Atualiza a lista
      setMesaSelecionada(novaMesa);
      setModalDetalhes(true);
    } catch (err: any) {
      alert(`Erro ao abrir mesa: ${err.response?.data?.message || err.message}`);
    } finally {
        setLoading(false);
    }
  };
  
  // --- Handlers dos Modais de Ação (Chamados de dentro do ModalDetalhes) ---

  const handleSolicitarFechamento = async () => {
    if (!mesaSelecionada || !mesaSelecionada.codseq) return;

    if (confirm(`Solicitar fechamento da Mesa ${mesaSelecionada.num_quiosque}?`)) {
      setLoading(true);
      try {
        const mesaAtualizada = await solicitarFechamento(mesaSelecionada.codseq);
        setMesaSelecionada(mesaAtualizada); // Atualiza o modal de detalhes
        await fetchMesas(false); // Atualiza a dashboard
      } catch (err: any) {
        alert(`Erro: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  // ==========================================================
  // CORREÇÃO DA CONFIRMAÇÃO DA NFCe (PEDIDO #)
  // ==========================================================
  const handleLiberarMesa = async () => {
    if (!mesaSelecionada || !mesaSelecionada.codseq) return;

    // CORREÇÃO: Mostra o Pedido (codseq) no alerta de confirmação
    const confirmMessage = `
    FINALIZAR PEDIDO #${mesaSelecionada.codseq} (Mesa ${mesaSelecionada.num_quiosque})?

    Este é o número que você usará no seu Emissor NFCe.
    `;

    if (confirm(confirmMessage)) {
      setLoading(true);
      try {
        await liberarMesa(mesaSelecionada.codseq);
        setModalDetalhes(false); // Fecha o modal
        setMesaSelecionada(null);
        await fetchMesas(false); // Atualiza a dashboard
      } catch (err: any) {
        alert(`Erro: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    }
  };
  
  // --- Handlers de Abertura dos Modais ---
  
  const handleAbrirDetalhes = (mesa: Mesa) => {
      if (mesa.codseq === 0) {
          handleAbrirMesa(mesa.num_quiosque!);
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

  // --- Lógica de Geração das Listas ---
  const mesasMapeadas = new Map(mesasAtivas.map(m => [m.num_quiosque, m]));
  const mesasCompletas: Mesa[] = [];
  const mesasLivres: Mesa[] = []; 

  for (let i = 1; i <= TOTAL_MESAS; i++) {
    const ativa = mesasMapeadas.get(i);
    if (ativa) {
        mesasCompletas.push(ativa);
    } else {
        const livre: Mesa = {
            codseq: 0, num_quiosque: i, tipo: 'M', vda_finalizada: 'N', obs: 'LIVRE',
            data_hora_abertura: '', sub_total_geral: 0, total: 0, quitens: [],
            nome_cli_esp: null, fone_esp: null,
        };
        mesasCompletas.push(livre);
        mesasLivres.push(livre);
    }
  }

  const mesasFiltradas = mesasCompletas.filter((mesa) => {
    if (filtroStatus === 'TODAS') return true;
    if (filtroStatus === 'LIVRE') return mesa.codseq === 0;
    if (filtroStatus === 'OCUPADA') return (mesa.codseq !== 0 && mesa.obs !== 'PAGAMENTO');
    if (filtroStatus === 'PAGAMENTO') return mesa.obs === 'PAGAMENTO';
    return true;
  });

  // --- Renderização ---

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
        <p className="text-red-700">Erro: {error}. Tente recarregar a página.</p>
      </div>
    );
  }

  return (
    <div>
      {loading && (
        <div className="fixed top-4 right-4 z-50 p-2 bg-white rounded-full shadow-xl">
          <Loader2 className="animate-spin text-brand-blue-dark" size={32} />
        </div>
      )}

      {/* Título e Filtros */}
      <div className="mb-6 bg-white p-4 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold text-brand-blue-dark mb-4">
          Painel de Mesas ({mesasCompletas.length} no total)
        </h1>
        <div className="flex flex-wrap gap-2">
          {filtros.map((filtro) => (
            <button
              key={filtro.valor}
              onClick={() => setFiltroStatus(filtro.valor)}
              className={`px-4 py-2 font-semibold rounded-full transition-all text-sm
                ${
                  filtroStatus === filtro.valor
                    ? 'bg-brand-blue-dark text-white shadow-lg'
                    : 'bg-brand-gray-mid text-zinc-700 hover:bg-zinc-300'
                }`}
            >
              {filtro.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8 gap-4 md:gap-5">
        <AnimatePresence>
            {mesasFiltradas.length > 0 ? (
                mesasFiltradas.map((mesa) => (
                    <MesaCardDashboard
                      key={mesa.num_quiosque}
                      mesa={mesa}
                      onClick={() => handleAbrirDetalhes(mesa)}
                    />
                ))
            ) : (
                <p className="text-zinc-500 col-span-full text-center p-8 bg-white rounded-xl">
                    Nenhuma mesa encontrada para o filtro "{filtroStatus}".
                </p>
            )}
        </AnimatePresence>
      </div>

      {/* Modais */}
      <AnimatePresence>
        {/* Modal 1: Detalhes da Mesa (O que abre primeiro) */}
        {modalDetalhes && mesaSelecionada && (
          <ModalDetalhesMesa
            mesa={mesaSelecionada}
            onClose={() => setModalDetalhes(false)}
            onAdicionarItens={handleAbrirAdicionarItens}
            onTransferir={handleAbrirTransferir}
            onFecharConta={handleSolicitarFechamento}
            onFinalizarMesa={handleLiberarMesa}
          />
        )}

        {/* Modal 2: Adicionar Itens (Abre por cima do Modal 1) */}
        {modalAdicionar && mesaSelecionada && (
          <ModalAdicionarItens
            mesa={mesaSelecionada}
            onClose={() => setModalAdicionar(false)}
            onItensAdd={async () => {
              setModalAdicionar(false);
              await fetchMesas(false); 
              // Atualiza os dados do modal de detalhes que está aberto atrás
              const mesaAtualizada = await getMesasStatus().then(mesas => mesas.find(m => m.codseq === mesaSelecionada.codseq));
              if (mesaAtualizada) { 
                setMesaSelecionada(mesaAtualizada);
              } else {
                // Se a mesa foi fechada/não encontrada, fecha tudo
                setModalDetalhes(false);
              }
            }}
          />
        )}
        
        {/* Modal 3: Transferir Mesa (Abre por cima do Modal 1) */}
        {modalTransferir && mesaSelecionada && (
          <ModalTransferirMesa
            mesa={mesaSelecionada}
            mesasLivres={mesasLivres}
            onClose={() => setModalTransferir(false)}
            onTransferido={() => {
              setModalTransferir(false);
              setModalDetalhes(false); // Fecha os dois
              fetchMesas(false); // Atualiza a dashboard
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}