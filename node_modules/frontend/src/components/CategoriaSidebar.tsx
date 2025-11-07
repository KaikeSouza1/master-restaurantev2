// master-restaurante-v2/packages/frontend/src/components/CategoriaSidebar.tsx

import { useRef } from 'react';
import type { Categoria } from '../types';
import { ChevronLeft, ChevronRight, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

type CategoriaAtivaTipo = number | null;

interface CategoriaSidebarProps {
  categorias: Categoria[]; 
  onSelectCategoria: (id: CategoriaAtivaTipo) => void;
  categoriaAtiva: CategoriaAtivaTipo;
}

function ScrollButton({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`absolute top-0 bottom-0 z-10 bg-white/80 p-1 rounded-full shadow-md text-gray-600 hover:bg-gray-100 backdrop-blur-sm ${
        direction === 'left' ? '-left-3' : '-right-3'
      }`}
    >
      {direction === 'left' ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
    </button>
  );
}

// Este componente pode ser usado de duas formas:
// 1. Horizontal (scroll-x) como no Cardápio.
// 2. Vertical (flex-col) como no ModalAdicionarItens.
// O código abaixo é a versão VERTICAL para o MODAL.
export default function CategoriaSidebar({
  categorias,
  onSelectCategoria,
  categoriaAtiva,
}: CategoriaSidebarProps) {

  const baseClasses = "py-2 px-4 rounded-lg font-semibold text-left transition-all w-full";
  const activeClasses = "bg-brand-blue-light text-white shadow-md";
  const inactiveClasses = "bg-brand-gray-mid text-zinc-700 hover:bg-zinc-300";

  return (
    <div className='p-4 bg-white rounded-xl shadow-lg'>
         <h3 className='text-xl font-semibold mb-3 text-zinc-800'>Categorias</h3>
            <div className='flex flex-col space-y-2'>
                <button
                    onClick={() => onSelectCategoria(null)}
                    className={`
                        ${baseClasses} 
                        ${categoriaAtiva === null ? activeClasses : inactiveClasses}
                    `}
                >
                    Todos
                </button>
                {categorias.map(cat => (
                    <button
                        key={cat.codigo}
                        onClick={() => onSelectCategoria(cat.codigo)}
                        className={`
                            ${baseClasses} 
                            ${cat.codigo === categoriaAtiva ? activeClasses : inactiveClasses}
                        `}
                    >
                        {cat.nome}
                    </button>
                ))}
            </div>
    </div>
  );
}