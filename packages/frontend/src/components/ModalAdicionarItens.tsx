// packages/frontend/src/components/ModalAdicionarItens.tsx

import { useState, useEffect, useMemo } from 'react';
import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
import {
  X,
  Trash2,
  Send,
  Loader2,
  Search,
  PlusCircle,
  MinusCircle,
} from 'lucide-react';
import {
  getCategorias,
  // 💡 CORREÇÃO 1: Importando a função correta
  getProdutosPorCategoria,
  adicionarItensMesa,
} from '../services/api';
import type { Mesa, Produto, Categoria, PedidoItemDto } from '../types';
import { CategoriaSidebar } from './CategoriaSidebar';
import { ProdutoLista } from './ProdutoLista';
import { formatCurrency } from '../utils/helpers';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onItensAdd: () => void;
}

// Interface para o item no carrinho local
interface CarrinhoItem {
  codprod: number;
  descricao: string;
  qtd: number;
  preco: number; // Padronizado para 'preco'
  obs: string;
}

export function ModalAdicionarItens({ mesa, onClose, onItensAdd }: ModalProps) {
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Estados de Dados
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [todosProdutos, setTodosProdutos] = useState<Produto[]>([]);

  // Estados de Filtro
  const [catSelecionada, setCatSelecionada] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Estado do Carrinho
  const [carrinho, setCarrinho] = useState<CarrinhoItem[]>([]);

  // Efeito para buscar dados iniciais
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          getCategorias(),
          // 💡 CORREÇÃO 1: Chamando a função correta (0 = todos os produtos)
          getProdutosPorCategoria(0),
        ]);
        setCategorias(cats);
        setTodosProdutos(prods);
      } catch (error) {
        console.error('Falha ao buscar dados para o modal', error);
        alert('Erro ao carregar produtos. Tente novamente.');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Lógica de filtragem
  const produtosFiltrados = useMemo(() => {
    let produtos = todosProdutos;

    // 1. Filtra por categoria
    if (catSelecionada) {
      // Usando 'grupo' como definido em 'index.ts'
      produtos = produtos.filter((p) => p.grupo === catSelecionada);
    }

    // 2. Filtra pelo termo de busca
    const term = searchTerm.toLowerCase().trim();
    if (term) {
      produtos = produtos.filter(
        (p) =>
          p.descricao.toLowerCase().includes(term) ||
          String(p.codinterno).includes(term)
      );
    }

    return produtos;
  }, [todosProdutos, catSelecionada, searchTerm]);

  // Funções do Carrinho
  const handleAddItem = (produto: Produto) => {
    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.codprod === produto.codinterno && item.obs === '');
      if (itemExistente) {
        // Se já existe SEM observação, apenas incrementa
        return prev.map((item) =>
          item.codprod === produto.codinterno && item.obs === ''
            ? { ...item, qtd: item.qtd + 1 }
            : item
        );
      } else {
        // Adiciona como novo item
        return [
          ...prev,
          {
            codprod: produto.codinterno,
            descricao: produto.descricao,
            preco: produto.preco, // Usando 'preco' do tipo Produto
            qtd: 1,
            obs: '',
          },
        ];
      }
    });
  };
  
  const handleUpdateItem = (index: number, action: 'inc' | 'dec' | 'remove' | 'obs', value?: string) => {
    setCarrinho(prev => {
      const novoCarrinho = [...prev];
      const item = novoCarrinho[index];
      
      if (!item) return prev;

      switch (action) {
        case 'inc':
          item.qtd += 1;
          break;
        case 'dec':
          item.qtd -= 1;
          if (item.qtd <= 0) {
            novoCarrinho.splice(index, 1); // Remove se for 0
          }
          break;
        case 'remove':
          novoCarrinho.splice(index, 1);
          break;
        case 'obs':
          item.obs = value || '';
          break;
      }
      
      return novoCarrinho;
    });
  };

  const totalCarrinho = useMemo(() => {
    return carrinho.reduce((acc, item) => acc + item.preco * item.qtd, 0);
  }, [carrinho]);

  // Envio
  const handleSubmitItens = async () => {
    if (carrinho.length === 0) {
      alert('Adicione pelo menos um item.');
      return;
    }
    
    setSending(true);
    try {
      // Mapeia para o DTO 'PedidoItemDto'
      const itensParaApi: PedidoItemDto[] = carrinho.map(item => ({
        codprod: item.codprod,
        descricao: item.descricao,
        qtd: item.qtd,
        unitario: item.preco,
        obs: item.obs,
      }));
      
      // 💡 CORREÇÃO 2: Passando o array 'itensParaApi' diretamente
      await adicionarItensMesa(mesa.codseq, itensParaApi);
      
      onItensAdd(); // Chama a função de callback (para recarregar os dados da mesa)
      
    } catch (err: any) {
      console.error('Erro ao adicionar itens:', err);
      alert(`Erro: ${err.response?.data?.message || 'Não foi possível adicionar os itens.'}`);
    } finally {
      setSending(false);
    }
  };


  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      appElement={document.getElementById('root') || undefined}
      className="Modal bg-zinc-100 w-full h-full p-0 flex flex-col"
      overlayClassName="Overlay fixed inset-0 bg-black/80 z-50"
    >
      {/* 1. Header Fixo */}
      <header className="flex-shrink-0 bg-white p-4 border-b border-zinc-300 flex items-center justify-between shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-brand-blue-dark">
            Adicionar Itens
          </h2>
          <p className="text-zinc-600">
            Mesa {mesa.num_quiosque} (Pedido #{mesa.codseq})
          </p>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ scale: 1.1, rotate: 90 }}
          className="text-zinc-500 hover:text-red-600"
        >
          <X size={28} />
        </motion.button>
      </header>

      {/* 2. Conteúdo Principal (Layout de 3 Colunas) */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Coluna 1: Categorias */}
        <aside className="w-64 bg-white border-r border-zinc-200 overflow-y-auto scroll-hide">
          <CategoriaSidebar
            categorias={categorias}
            catSelecionada={catSelecionada}
            onSelectCategoria={setCatSelecionada}
          />
        </aside>

        {/* Coluna 2: Produtos e Pesquisa (Scrollável) */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de Pesquisa */}
          <div className="flex-shrink-0 p-4 bg-zinc-100 border-b border-zinc-200">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por nome ou código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-zinc-300 focus:border-brand-blue-light focus:ring-2 focus:ring-brand-blue-light/50 outline-none transition-all"
              />
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
            </div>
          </div>
          
          {/* Lista de Produtos */}
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 size={40} className="animate-spin text-brand-blue-dark" />
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4">
              <ProdutoLista 
                produtos={produtosFiltrados} 
                onAddItem={handleAddItem} 
              />
            </div>
          )}
        </main>

        {/* Coluna 3: Carrinho (Scrollável) */}
        <aside className="w-96 bg-white border-l border-zinc-300 flex flex-col shadow-lg">
          <div className="p-4 border-b">
            <h3 className="text-lg font-bold text-zinc-800">Itens para Adicionar</h3>
          </div>
          
          {/* Lista de Itens no Carrinho */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {carrinho.length === 0 ? (
              <p className="text-zinc-500 text-center py-10">
                Clique em um produto para adicionar.
              </p>
            ) : (
              carrinho.map((item, index) => (
                <div key={index} className="bg-zinc-50 p-3 rounded-lg border border-zinc-200">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-800">{item.descricao}</span>
                    <span className="font-bold text-lg text-brand-blue-dark">
                      {formatCurrency(item.preco * item.qtd)}
                    </span>
                  </div>
                  
                  {/* Controles */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2">
                      <button onClick={() => handleUpdateItem(index, 'dec')} className="text-red-500 hover:text-red-700 disabled:opacity-50" disabled={sending}>
                        <MinusCircle size={22} />
                      </button>
                      <span className="font-bold text-lg w-10 text-center">{item.qtd}</span>
                      <button onClick={() => handleUpdateItem(index, 'inc')} className="text-green-500 hover:text-green-700 disabled:opacity-50" disabled={sending}>
                        <PlusCircle size={22} />
                      </button>
                    </div>
                    <button onClick={() => handleUpdateItem(index, 'remove')} className="text-zinc-400 hover:text-red-600 disabled:opacity-50" disabled={sending}>
                      <Trash2 size={20} />
                    </button>
                  </div>
                  
                  {/* Observação */}
                  <input
                    type="text"
                    placeholder="Obs: (ex: sem cebola)"
                    value={item.obs}
                    onChange={(e) => handleUpdateItem(index, 'obs', e.target.value)}
                    className="w-full text-sm mt-2 px-2 py-1 rounded border border-zinc-300 focus:border-blue-500 outline-none"
                    disabled={sending}
                  />
                </div>
              ))
            )}
          </div>

          {/* Rodapé do Carrinho */}
          <div className="flex-shrink-0 p-4 bg-zinc-100 border-t border-zinc-300 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-zinc-700">Total:</span>
              <span className="text-3xl font-black text-brand-blue-dark">
                {formatCurrency(totalCarrinho)}
              </span>
            </div>
            <button
              onClick={handleSubmitItens}
              disabled={carrinho.length === 0 || sending}
              className="w-full bg-brand-accent text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center space-x-2 transition-all
                         hover:bg-green-700
                         disabled:bg-zinc-400 disabled:cursor-not-allowed"
            >
              {sending ? (
                <Loader2 size={24} className="animate-spin" />
              ) : (
                <Send size={24} />
              )}
              <span>Adicionar Itens</span>
            </button>
          </div>
        </aside>

      </div>
    </ReactModal>
  );
}