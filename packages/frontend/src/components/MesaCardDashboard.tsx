// packages/frontend/src/components/MesaCardDashboard.tsx

import type { Mesa } from '../types';
// 1. IMPORTAR A FUNÇÃO CORRETA E O ÍCONE
import { formatCurrency, getMesaStatus, getTempoDecorrido } from '../utils/helpers'; 
import {
  PlusCircle,
  Clock, // <-- Importar o Clock
  Users,
  ChefHat,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MesaCardProps {
  mesa: Mesa;
  onClick: () => void;
}

export function MesaCardDashboard({ mesa, onClick }: MesaCardProps) {
  // CORREÇÃO VERCEL (TS6133): Removido 'bgColor' e 'textColor' pois não estavam sendo usados.
  const { status, ringColor } = getMesaStatus(mesa);
  const isLivre = status === 'LIVRE';

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
    hover: {
      scale: 1.05,
      y: -8,
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.95 },
  };

  if (isLivre) {
    return (
      <motion.button
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        onClick={onClick}
        className="group relative bg-gradient-to-br from-white to-zinc-50 border-2 border-dashed border-zinc-300 rounded-2xl shadow-sm hover:shadow-2xl hover:border-brand-blue-light transition-all text-zinc-400 hover:text-brand-blue-light flex flex-col justify-center items-center h-48 overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(circle, currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          ></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            whileHover={{ rotate: 90 }}
            transition={{ duration: 0.3 }}
          >
            <PlusCircle size={48} strokeWidth={1.5} />
          </motion.div>
          <span className="text-3xl font-extrabold mt-4 tracking-tight">
            Mesa {mesa.num_quiosque}
          </span>
          <span className="font-semibold text-sm mt-2 px-3 py-1 bg-white/50 rounded-full">
            Disponível
          </span>
        </div>

        {/* Hover Glow Effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-light/0 via-brand-blue-light/0 to-brand-blue-light/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>
      </motion.button>
    );
  }

  // Cards para mesas OCUPADAS ou em PAGAMENTO
  const isPagamento = status === 'PAGAMENTO';
  const numItens = mesa.quitens.length;
  // 2. CHAMAR A FUNÇÃO DE TEMPO DECORRIDO
  const tempoDecorrido = getTempoDecorrido(mesa.data_hora_abertura);

  // Gradientes dinâmicos por status
  const gradientClass = isPagamento
    ? 'from-yellow-500 via-yellow-600 to-amber-600'
    : 'from-red-600 via-red-700 to-rose-800';

  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
      className={`group relative bg-gradient-to-br ${gradientClass} rounded-2xl shadow-xl hover:shadow-2xl ring-4 ${ringColor}/40 hover:ring-offset-4 hover:ring-offset-brand-gray-light flex flex-col h-48 overflow-hidden text-left transition-all`}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
          }}
        ></div>
      </div>

      {/* Status Badge - Floating */}
      <div className="absolute top-3 right-3 z-20">
        <motion.div
          animate={{
            scale: isPagamento ? [1, 1.1, 1] : 1,
          }}
          transition={{
            repeat: isPagamento ? Infinity : 0,
            duration: 2,
          }}
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm ${
            isPagamento
              ? 'bg-white/95 text-yellow-700 ring-2 ring-yellow-300'
              : 'bg-white/90 text-red-700'
          }`}
        >
          {isPagamento ? (
            <>
              <CreditCard size={12} />
              <span>Pagamento</span>
            </>
          ) : (
            <>
              <ChefHat size={12} />
              <span>Ocupada</span>
            </>
          )}
        </motion.div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 p-4 flex flex-col h-full justify-between">
        {/* Header - Número da Mesa */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-white/70 text-xs font-bold uppercase tracking-wider">
                Mesa
              </span>
              <motion.span
                className="text-4xl font-black text-white drop-shadow-lg"
                whileHover={{ scale: 1.1 }}
              >
                {mesa.num_quiosque}
              </motion.span>
            </div>
          </div>

          {/* 3. ADICIONAR O TEMPO DECORRIDO E ITENS AQUI */}
          <div className="flex items-center space-x-2">
            {/* Info - Itens */}
            <div className="flex items-center space-x-1 bg-black/20 px-2 py-1 rounded-full w-fit">
              <Users size={12} className="text-white/90" />
              <span className="font-semibold text-white/90 text-xs">
                {numItens} {numItens === 1 ? 'item' : 'itens'}
              </span>
            </div>
            {/* Info - Tempo Decorrido */}
            <div className="flex items-center space-x-1 bg-black/20 px-2 py-1 rounded-full w-fit">
              <Clock size={12} className="text-white/90" />
              <span className="font-semibold text-white/90 text-xs">
                {tempoDecorrido}
              </span>
            </div>
          </div>
        </div>

        {/* Footer - Valor Total */}
        <div className="bg-black/30 backdrop-blur-md -mx-4 -mb-4 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-white/70 text-xs font-bold uppercase tracking-wide">
              Total
            </span>
            <motion.span
              className="text-2xl font-black text-white drop-shadow-lg"
              whileHover={{ scale: 1.05 }}
            >
              {formatCurrency(mesa.total)}
            </motion.span>
          </div>
        </div>
      </div>

      {/* Hover Shine Effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ transform: 'translateX(-100%)' }}
        whileHover={{ x: '200%' }}
        transition={{ duration: 0.6 }}
      />

      {/* Corner Accent (se pagamento) */}
      {isPagamento && (
        <div className="absolute top-0 left-0 w-12 h-12">
          <div className="absolute top-2 left-2">
            <Sparkles size={16} className="text-yellow-300 animate-pulse" />
          </div>
        </div>
      )}
    </motion.button>
  );
}