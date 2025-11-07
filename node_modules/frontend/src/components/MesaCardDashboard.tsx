// master-restaurante-v2/packages/frontend/src/components/MesaCardDashboard.tsx

import type { Mesa } from '../types';
import { formatCurrency, getMesaStatus } from '../utils/helpers';
import { PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface MesaCardProps {
  mesa: Mesa;
  onClick: () => void; // Ação de clique para abrir o Modal de Detalhes
}

export function MesaCardDashboard({ mesa, onClick }: MesaCardProps) {
  const { status, bgColor, textColor, ringColor } = getMesaStatus(mesa);
  const isLivre = status === 'LIVRE';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.03, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' },
    tap: { scale: 0.98 }
  };

  if (isLivre) {
    return (
      <motion.button
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
        transition={{ duration: 0.2 }}
        onClick={onClick}
        className="bg-white border-2 border-dashed border-zinc-300 rounded-xl shadow-sm hover:border-brand-blue-light transition-all text-zinc-400 hover:text-brand-blue-light flex flex-col justify-center items-center h-36 ring-4 ring-transparent hover:ring-brand-blue-light/30"
      >
        <PlusCircle size={32} />
        <span className="text-2xl font-extrabold mt-3">Mesa {mesa.num_quiosque}</span>
        <span className="font-semibold text-sm">Livre (Abrir)</span>
      </motion.button>
    );
  }

  // Card para mesas OCUPADAS ou em PAGAMENTO
  return (
    <motion.button
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      whileTap="tap"
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={`rounded-xl shadow-lg ring-4 ${ringColor}/40 flex flex-col h-36 overflow-hidden ${bgColor} ${textColor} text-left`}
    >
      {/* Header do Card */}
      <div className="p-4 flex-1">
        <div className="flex justify-between items-center mb-1">
          <span className="text-3xl font-extrabold">
            Mesa {mesa.num_quiosque}
          </span>
          <span className="font-bold px-2 py-0.5 bg-white/30 rounded-full text-xs">
            {status}
          </span>
        </div>
      </div>

      {/* Rodapé com Valor */}
      <div className="p-4 bg-black/20 backdrop-blur-sm mt-auto">
        <p className="text-sm font-medium opacity-80">Total</p>
        <p className="text-2xl font-bold">
          {formatCurrency(mesa.total)}
        </p>
      </div>
    </motion.button>
  );
}