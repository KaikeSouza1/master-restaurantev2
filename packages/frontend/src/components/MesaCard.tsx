// master-restaurante-v2/packages/frontend/src/components/MesaCard.tsx

import type { Mesa } from '../types';
import { formatCurrency, getMesaStatus, formatTimeFromISO } from '../utils/helpers';
import {
  Clock,
  User,
  ArrowRight,
  CheckCircle,
  PlusCircle,
  XCircle,
  Utensils,
} from 'lucide-react';
import { motion } from 'framer-motion';

interface MesaCardProps {
  mesa: Mesa;
  onAbrir: (numMesa: number) => void;
  onAdicionarItens: (mesa: Mesa) => void;
  onTransferir: (mesa: Mesa) => void;
  onFechar: (mesa: Mesa) => void;
  onLiberarMesa: (mesa: Mesa) => void;
}

export function MesaCard({
  mesa,
  onAbrir,
  onAdicionarItens,
  onTransferir,
  onFechar,
  onLiberarMesa,
}: MesaCardProps) {
  const { status, bgColor, textColor, ringColor } = getMesaStatus(mesa);
  const isLivre = status === 'LIVRE';

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    hover: { scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }
  };

  if (isLivre) {
    return (
      <motion.button
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        transition={{ duration: 0.2 }}
        onClick={() => onAbrir(mesa.num_quiosque!)}
        className="bg-white border-2 border-dashed border-zinc-300 rounded-xl shadow-sm hover:border-brand-blue-light transition-all text-zinc-400 hover:text-brand-blue-light flex flex-col justify-center items-center h-52 ring-4 ring-transparent hover:ring-brand-blue-light/30"
      >
        <PlusCircle size={36} />
        <span className="text-2xl font-extrabold mt-3">Mesa {mesa.num_quiosque}</span>
        <span className="font-semibold text-sm">Toque para Abrir</span>
      </motion.button>
    );
  }

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      transition={{ duration: 0.2 }}
      className={`rounded-xl shadow-lg ring-4 ${ringColor}/40 flex flex-col h-52 overflow-hidden ${bgColor} ${textColor}`}
    >
      {/* Header do Card */}
      <div className="p-4 border-b border-white/20">
        <div className="flex justify-between items-center mb-1">
          <span className="text-3xl font-extrabold">
            {mesa.num_quiosque}
          </span>
          <span className="font-bold px-2 py-0.5 bg-white/30 rounded-full text-xs">
            {status}
          </span>
        </div>
        <div className="text-xl font-bold">
          {formatCurrency(mesa.total)}
        </div>
      </div>

      {/* Detalhes */}
      <div className="p-4 bg-white/90 text-zinc-800 flex-1 space-y-1 text-sm">
        <div className="flex items-center space-x-2 truncate">
          <User size={16} className="text-brand-blue-dark"/>
          <span className='font-medium'>{mesa.nome_cli_esp || 'Cliente'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Clock size={16} className="text-brand-blue-dark" />
          <span>Aberto às {formatTimeFromISO(mesa.data_hora_abertura)}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Utensils size={16} className="text-brand-blue-dark" />
          <span>{mesa.quitens.length} Itens</span>
        </div>
      </div>

      {/* Ações */}
      <div className="flex flex-col">
        {status === 'PAGAMENTO' ? (
          <button
            onClick={() => onLiberarMesa(mesa)}
            className="w-full bg-brand-accent text-white font-bold p-3 hover:bg-brand-accent/80 transition-all flex justify-center items-center space-x-2 text-sm"
          >
            <CheckCircle size={18} />
            <span>Finalizar & Liberar</span>
          </button>
        ) : (
          <>
            <button
              onClick={() => onAdicionarItens(mesa)}
              className="w-full bg-brand-blue-light text-white font-bold p-3 hover:bg-brand-blue-dark transition-all flex justify-center items-center space-x-2 text-sm"
            >
              <PlusCircle size={18} />
              <span>Adicionar Itens</span>
            </button>
            <div className="flex">
              <button
                onClick={() => onTransferir(mesa)}
                className="w-1/2 bg-zinc-600 text-white font-medium p-2 hover:bg-zinc-700 transition-all flex justify-center items-center space-x-1 text-xs"
              >
                <ArrowRight size={16} />
                <span>Transferir</span>
              </button>
              <button
                onClick={() => onFechar(mesa)}
                className="w-1/2 bg-red-700 text-white font-medium p-2 hover:bg-red-800 transition-all flex justify-center items-center space-x-1 text-xs"
              >
                <XCircle size={16} />
                <span>Fechar Conta</span>
              </button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}