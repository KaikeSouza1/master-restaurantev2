// packages/frontend/src/pages/MobileSelecaoMesa.tsx

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getMesasStatus, abrirMesa } from '../services/api';
import type { Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Loader2, AlertTriangle, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Total de mesas (igual ao seu dashboard)
const TOTAL_MESAS = 40; 

export function MobileSelecaoMesa() {
  const [mesasAtivas, setMesasAtivas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [opening, setOpening] = useState<number | null>(null); // Qual mesa está abrindo
  const navigate = useNavigate();

  // Busca as mesas (igual ao dashboard)
  const fetchMesas = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await getMesasStatus();
      setMesasAtivas(data);
    } catch (err) {
      setError('Falha ao carregar o status das mesas.');
      toast.error('Falha ao carregar as mesas.');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMesas(true);
    // Intervalo para atualizar as mesas
    const intervalId = setInterval(() => fetchMesas(false), 10000); 
    return () => clearInterval(intervalId);
  }, [fetchMesas]);

  // Lógica para abrir ou selecionar uma mesa
  const handleMesaClick = async (mesa: Mesa) => {
    // Se a mesa está livre (codseq === 0)
    if (mesa.codseq === 0) {
      if (opening) return; // Já está abrindo uma
      setOpening(mesa.num_quiosque);

      try {
        const novaMesa = await abrirMesa(mesa.num_quiosque!);
        toast.success(`Mesa ${novaMesa.num_quiosque} aberta!`);
        // Navega para a tela de cardápio com o NOVO codseq
        navigate(`/mobile/mesa/${novaMesa.codseq}`);
      } catch (err: any) {
        toast.error(`Erro ao abrir mesa: ${err.response?.data?.message || err.message}`);
        setOpening(null);
      }
      
    } else {
      // Se a mesa já está ocupada, apenas navega
      navigate(`/mobile/mesa/${mesa.codseq}`);
    }
  };

  // Gera a lista completa de mesas
  const mesasMapeadas = new Map(mesasAtivas.map((m) => [m.num_quiosque, m]));
  const mesasCompletas: Mesa[] = [];
  for (let i = 1; i <= TOTAL_MESAS; i++) {
    const ativa = mesasMapeadas.get(i);
    if (ativa) {
      mesasCompletas.push(ativa);
    } else {
      mesasCompletas.push({
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
      });
    }
  }

  // Loading inicial
  if (loading && mesasAtivas.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-zinc-100">
        <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
        <p className="text-zinc-600 font-semibold mt-4">Carregando mesas...</p>
      </div>
    );
  }
  
  // Erro
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-red-50 p-4">
        <AlertTriangle size={48} className="text-red-600" />
        <p className="text-red-700 font-semibold mt-4 text-center">{error}</p>
        <button
          onClick={() => fetchMesas(true)}
          className="mt-6 px-6 py-2 bg-red-600 text-white font-bold rounded-lg shadow-lg"
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="min-h-screen bg-brand-gray-light p-3">
      {/* Header Simples */}
      <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-xl shadow-md">
        <div>
          <h1 className="text-2xl font-black text-brand-blue-dark">Comanda Mobile</h1>
          <p className="text-zinc-600 font-medium">Selecione a mesa</p>
        </div>
        <Users size={28} className="text-brand-blue-light" />
      </div>

      {/* Grid de Mesas Otimizado para Mobile */}
      <motion.div 
        layout
        className="grid grid-cols-3 sm:grid-cols-4 gap-3"
      >
        <AnimatePresence>
          {mesasCompletas.map((mesa) => {
            const isLivre = mesa.codseq === 0;
            const isPagamento = mesa.obs === 'PAGAMENTO';
            const isLoading = opening === mesa.num_quiosque;

            let statusBg = 'bg-green-500 hover:bg-green-600'; // Livre
            if (isPagamento) {
              statusBg = 'bg-yellow-500 hover:bg-yellow-600'; // Pagamento
            } else if (!isLivre) {
              statusBg = 'bg-red-600 hover:bg-red-700'; // Ocupada
            }

            return (
              <motion.button
                key={mesa.num_quiosque}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={() => handleMesaClick(mesa)}
                disabled={isLoading}
                className={`relative w-full aspect-square rounded-2xl
                            text-white font-black text-center
                            flex flex-col items-center justify-center
                            transition-all duration-300 shadow-lg
                            ${statusBg}
                            ${isLoading ? 'opacity-50' : ''}`}
              >
                {/* Número da Mesa */}
                <span className="text-5xl drop-shadow-md">{mesa.num_quiosque}</span>
                
                {/* Status (Livre, Total, Pagando) */}
                <div className="h-6">
                  {isLoading ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : isLivre ? (
                    <span className="text-lg font-bold">Livre</span>
                  ) : (
                    <span className="text-lg font-bold drop-shadow-sm">
                      {isPagamento ? 'Pagando' : formatCurrency(mesa.total)}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}