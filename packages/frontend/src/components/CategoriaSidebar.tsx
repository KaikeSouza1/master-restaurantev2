// packages/frontend/src/components/CategoriaSidebar.tsx

import type { Categoria } from '../types';
import { List } from 'lucide-react';

interface Props {
  categorias: Categoria[];
  catSelecionada: number | null; // Nome da prop conforme usado em ModalAdicionarItens.tsx
  onSelectCategoria: (id: number | null) => void;
}

// Componente de botão interno para manter a estilização consistente
const BotaoCategoria = ({
  onClick,
  label,
  isActive,
}: {
  onClick: () => void;
  label: string;
  isActive: boolean;
}) => {
  const baseClasses = "w-full text-left px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2";
  const activeClasses = "bg-brand-blue-dark text-white shadow-lg";
  const inactiveClasses = "text-zinc-600 hover:bg-zinc-200 hover:text-zinc-800";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
    >
      <span>{label}</span>
    </button>
  );
};

export function CategoriaSidebar({
  categorias,
  catSelecionada,
  onSelectCategoria,
}: Props) {
  return (
    <aside className="bg-white p-4 rounded-xl shadow-lg h-full">
      <h3 className="text-xl font-bold text-zinc-800 mb-4 flex items-center space-x-2">
        <List size={22} />
        <span>Categorias</span>
      </h3>
      <nav className="space-y-2">
        {/* Botão "Todos" */}
        <BotaoCategoria
          onClick={() => onSelectCategoria(null)}
          label="Todos os Produtos"
          isActive={catSelecionada === null}
        />

        {/* Lista de Categorias */}
        {categorias.map((cat) => (
          <BotaoCategoria
            // 💡 CORREÇÃO: 'cat.codcat' -> 'cat.codigo'
            key={cat.codigo}
            // 💡 CORREÇÃO: 'cat.codcat' -> 'cat.codigo'
            onClick={() => onSelectCategoria(cat.codigo)}
            // 💡 CORREÇÃO: 'cat.descricao' -> 'cat.nome'
            label={cat.nome}
            // 💡 CORREÇÃO: 'cat.codcat' -> 'cat.codigo'
            isActive={catSelecionada === cat.codigo}
          />
        ))}
      </nav>
    </aside>
  );
}