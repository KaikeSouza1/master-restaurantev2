// packages/frontend/src/components/CategoriaSidebar.tsx

import type { Categoria } from '../types';
import { Layers } from 'lucide-react';

interface Props {
  categorias: Categoria[];
  catSelecionada: number | null;
  onSelectCategoria: (id: number | null) => void;
}

export function CategoriaSidebar({
  categorias,
  catSelecionada,
  onSelectCategoria,
}: Props) {
  return (
    <nav className="p-3 space-y-1">
      {/* Botão para mostrar todas as categorias */}
      <button
        onClick={() => onSelectCategoria(null)}
        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-semibold text-left transition-all
          ${
            catSelecionada === null
              ? 'bg-brand-blue-light text-white shadow-lg'
              : 'text-zinc-700 hover:bg-zinc-100'
          }`}
      >
        <Layers size={20} />
        <span>Todas as Categorias</span>
      </button>
      
      {/* Lista de categorias */}
      {categorias.map((cat) => (
        <button
          key={cat.codcat}
          onClick={() => onSelectCategoria(cat.codcat)}
          className={`w-full px-4 py-3 rounded-lg font-semibold text-left transition-all
            ${
              catSelecionada === cat.codcat
                ? 'bg-brand-blue-light text-white shadow-lg'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
        >
          {cat.descricao}
        </button>
      ))}
    </nav>
  );
}