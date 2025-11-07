// master-restaurante-v2/packages/frontend/src/components/ModalAdicionarItens.tsx

import { useState, useEffect, useCallback } from 'react';
import ReactModal from 'react-modal';
import { motion } from 'framer-motion';
// CORREÇÃO TS1484: Usando 'import type'
import type { 
  Mesa,
  Categoria,
  Produto,
  ItemCarrinho,
  PedidoItemDto,
} from '../types';
import {
  getProdutosPorCategoria,
  getCategorias,
  adicionarItensMesa,
} from '../services/api';
// Os imports abaixo são componentes (valores)
import CategoriaSidebar from './CategoriaSidebar';
import ProdutoLista from './ProdutoLista';
import { Carrinho } from './Carrinho';
import { Loader2 } from 'lucide-react';

interface ModalProps {
  mesa: Mesa;
  onClose: () => void;
  onItensAdd: () => void; // Função para recarregar as mesas na dashboard
}

type CategoriaAtivaTipo = number | null;

export function ModalAdicionarItens({
  mesa,
  onClose,
  onItensAdd,
}: ModalProps) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAtivaTipo>(null);
  const [loadingProds, setLoadingProds] = useState(false);
  const [loadingCats, setLoadingCats] = useState(true);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 1. Carrega as categorias ao montar o modal
  useEffect(() => {
    getCategorias()
      .then(data => {
        setCategorias(data);
        if (data.length > 0) {
          setCategoriaAtiva(data[0].codigo); // Seleciona a primeira categoria
        } else {
          setLoadingProds(false);
        }
      })
      .catch((err) => {
        console.error('Erro ao buscar categorias:', err);
        setError('Falha ao carregar as categorias.');
      })
      .finally(() => setLoadingCats(false));
  }, []);

  // 2. Carrega os produtos quando a categoria ativa muda
  const fetchProdutos = useCallback(async (id: number | null) => {
    setLoadingProds(true);
    setError(null);
    setProdutos([]);
    
    try {
        const categoriaId = id === null ? 0 : id; // 0 para "Todos"
        const data = await getProdutosPorCategoria(categoriaId);
        setProdutos(data);
    } catch (err) {
        console.error('Erro ao buscar produtos:', err);
        setError('Falha ao carregar os produtos desta categoria.');
    } finally {
        setLoadingProds(false);
    }
  }, []);
  
  useEffect(() => {
      fetchProdutos(categoriaAtiva);
  }, [categoriaAtiva, fetchProdutos]);

  // --- Lógica do Carrinho ---
  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const itemExistente = prev.find(
        (i) => i.codinterno === produto.codinterno,
      );
      if (itemExistente) {
        return prev.map((i) =>
          i.codinterno === produto.codinterno ? { ...i, qtd: i.qtd + 1 } : i,
        );
      }
      return [...prev, { ...produto, qtd: 1 }];
    });
  };
  
  const aumentarQtd = (codprod: number) => {
    setCarrinho((prev) =>
      prev.map((i) =>
        i.codinterno === codprod ? { ...i, qtd: i.qtd + 1 } : i,
      ),
    );
  };
  const diminuirQtd = (codprod: number) => {
    setCarrinho((prev) =>
      prev
        .map((i) =>
          i.codinterno === codprod ? { ...i, qtd: i.qtd - 1 } : i,
        )
        .filter((i) => i.qtd > 0),
    );
  };
  const removerItem = (codprod: number) => {
    setCarrinho((prev) => prev.filter((i) => i.codinterno !== codprod));
  };
  
  // --- Ação Principal: Salvar Itens ---
  const handleSalvarNovosItens = async () => {
    if (carrinho.length === 0) {
      alert('Nenhum item selecionado para adicionar.');
      return;
    }
    if (!mesa.codseq) {
        alert('Erro: ID do pedido não encontrado.');
        return;
    }
    
    const itensDto: PedidoItemDto[] = carrinho.map((item) => ({
      codprod: Number(item.codinterno),
      descricao: item.descricao,
      qtd: item.qtd,
      unitario: Number(item.preco),
      obs: item.obs || '',
    }));
    
    setLoadingProds(true); 

    try {
      await adicionarItensMesa(mesa.codseq, itensDto);
      
      alert('Itens adicionados com sucesso!');
      onItensAdd(); // Recarrega as mesas na dashboard
      onClose(); // Fecha o modal
    } catch (err: any) {
      console.error(err);
      alert(
        `Erro ao adicionar itens: ${err.response?.data?.message || err.message}`,
      );
      setLoadingProds(false);
    }
  };


  return (
    <ReactModal
      isOpen={true}
      onRequestClose={onClose}
      // CORREÇÃO: Prop para evitar o warning da imagem
      appElement={document.getElementById('root') || undefined} 
      className="Modal bg-brand-gray-light w-full max-w-7xl mx-auto my-6 rounded-xl shadow-2xl h-[90vh] flex flex-col overflow-hidden"
      overlayClassName="Overlay fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className='h-full flex flex-col'
      >
        <div className="flex justify-between items-center p-4 border-b border-brand-gray-mid bg-white text-brand-blue-dark rounded-t-xl shadow-md">
          <h2 className="text-2xl font-bold">
            Adicionar Itens à Mesa {mesa.num_quiosque} (Pedido #{mesa.codseq})
          </h2>
          <button
            onClick={onClose}
            className="text-2xl font-bold text-zinc-500 hover:text-red-600 transition-transform hover:rotate-90"
            disabled={loadingProds}
          >
            &times;
          </button>
        </div>

        <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-hidden">
          {/* Coluna 1: Categorias (Fixa) */}
          <div className="md:col-span-1 lg:col-span-1 h-full flex flex-col sticky top-6 self-start">
            <CategoriaSidebar
                categorias={categorias}
                categoriaAtiva={categoriaAtiva}
                onSelectCategoria={setCategoriaAtiva}
            />
          </div>

          {/* Coluna 2/3/4: Produtos */}
          <div className="md:col-span-3 lg:col-span-3 h-full overflow-y-auto scroll-hide">
            {loadingProds ? (
              <div className="flex justify-center items-center h-full min-h-[500px] bg-white rounded-xl shadow-lg">
                <Loader2 className="animate-spin text-brand-blue-dark" size={32} />
                <p className="text-zinc-500 ml-3">Carregando produtos...</p>
              </div>
            ) : error ? (
              <p className="text-red-500 text-center p-10 bg-white rounded-xl shadow-lg">{error}</p>
            ) : (
              <ProdutoLista
                produtos={produtos}
                onAdicionarProduto={adicionarAoCarrinho}
              />
            )}
          </div>

          {/* Coluna 5: Carrinho */}
          <div className="md:col-span-1 lg:col-span-1 h-full flex flex-col sticky top-6 self-start">
            <Carrinho
              itens={carrinho}
              onFinalizar={handleSalvarNovosItens}
              onAumentar={aumentarQtd}
              onDiminuir={diminuirQtd}
              onRemover={removerItem}
              titulo={`Itens para Mesa ${mesa.num_quiosque}`}
              textoBotao='Adicionar Itens'
            />
          </div>
        </div>
      </motion.div>
    </ReactModal>
  );
}