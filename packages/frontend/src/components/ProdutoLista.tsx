// packages/frontend/src/components/ProdutoLista.tsx

import type { Produto } from '../types';
import { Plus, Info } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';
import { motion } from 'framer-motion';

interface Props {
  produtos: Produto[];
  onAddItem: (produto: Produto) => void;
}

export function ProdutoLista({ produtos, onAddItem }: Props) {
  if (produtos.length === 0) {
    return (
      <div className="text-center text-zinc-500 py-10">
        <Info size={40} className="mx-auto mb-2" />
        <p className="font-semibold">Nenhum produto encontrado</p>
        <p className="text-sm">Tente alterar o filtro ou o termo de busca.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {produtos.map((produto, index) => (
        <motion.div
          key={produto.codinterno} // Chave correta
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.02 }}
          className="bg-white rounded-xl shadow-lg border border-zinc-200 overflow-hidden flex flex-col"
        >
          {/* Imagem Placeholder - Adicione sua lógica de imagem aqui se tiver */}
          <div className="h-32 bg-zinc-200 flex items-center justify-center text-zinc-400">
            {/* <img src={produto.urlImagem} alt={produto.descricao} className="h-full w-full object-cover" /> */}
            <span>Imagem</span>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <div>
              <p className="font-bold text-lg text-zinc-800 leading-tight">
                {produto.descricao}
              </p>
              <p className="text-sm text-zinc-500">Cód: {produto.codinterno}</p>
            </div>

            <div className="mt-4 flex items-center justify-between">
              {/* CORREÇÃO: 'venda' -> 'vlr_venda' */}
              <span className="text-2xl font-black text-brand-blue-dark">
                {formatCurrency(produto.vlr_venda)}
              </span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onAddItem(produto)}
                className="bg-brand-accent text-white p-2 rounded-full shadow-lg hover:bg-green-700 transition-all"
              >
                <Plus size={24} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}