// master-restaurante-v2/packages/frontend/src/components/ProdutoLista.tsx

import type { Produto } from '../types';
import { formatCurrency } from '../utils/helpers';
import { motion } from 'framer-motion';
import { PlusCircle } from 'lucide-react';

interface ProdutoListaProps {
  produtos: Produto[];
  onAdicionarProduto: (produto: Produto) => void;
}

const cardVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    hover: { scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)" },
    tap: { scale: 0.98 }
};


export default function ProdutoLista({ produtos, onAdicionarProduto }: ProdutoListaProps) {
  
  if (produtos.length === 0) {
    return (
      <div className="flex justify-center items-center h-full min-h-[400px] text-center">
        <p className="text-zinc-500 text-lg p-4 bg-white rounded-xl shadow-md">
          Nenhum produto encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {produtos.map((produto) => (
        <motion.div
          key={produto.codinterno}
          className="bg-white p-4 rounded-xl shadow-md flex justify-between items-center border border-zinc-200 cursor-pointer"
          variants={cardVariants}
          initial="initial"
          animate="animate"
          whileHover="hover"
          whileTap="tap"
          onClick={() => onAdicionarProduto(produto)}
        >
          <div className='flex-1 pr-4'>
            <h3 className="text-lg font-bold text-zinc-800 leading-tight">{produto.descricao}</h3>
            <p className="text-xl font-extrabold text-brand-blue-dark mt-1">
              {formatCurrency(Number(produto.preco))}
            </p>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdicionarProduto(produto);
            }}
            className="flex items-center space-x-2 bg-brand-accent text-white px-4 py-2 rounded-full font-bold hover:bg-brand-accent/80 transition-all shadow-md"
          >
            <PlusCircle size={20} />
            <span className='hidden sm:inline'>Adicionar</span>
          </button>
        </motion.div>
      ))}
    </div>
  );
}