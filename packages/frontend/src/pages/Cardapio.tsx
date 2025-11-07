// master-restaurante-v2/packages/frontend/src/pages/Cardapio.tsx

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmpresaInfo, getCategorias, getProdutosPorCategoria, salvarPedidoDelivery } from '../services/api';
// CORREÇÃO TS1484: Usando 'import type' para importar apenas tipos
import type { EmpresaInfo, Categoria, Produto, ItemCarrinho, CreatePedidoDto, PedidoItemDto } from '../types'; 
import CategoriaSidebar from '../components/CategoriaSidebar';
import ProdutoLista from '../components/ProdutoLista';
import { Carrinho } from '../components/Carrinho';
import Header from '../components/Header';
import { Loader2, AlertTriangle } from 'lucide-react';

type CategoriaAtivaTipo = number | null;

export function CardapioPage() {
  const { user } = useAuth();
  // Mantemos o estado, mas ele é usado implicitamente no Header, então não removemos.
  const [empresaInfo, setEmpresaInfo] = useState<EmpresaInfo | null>(null); 
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [categoriaAtiva, setCategoriaAtiva] = useState<CategoriaAtivaTipo>(null);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Carregar dados iniciais (Empresa e Categorias)
  useEffect(() => {
    Promise.all([
      getEmpresaInfo(),
      getCategorias(),
    ])
    .then(([empresa, cats]) => {
      setEmpresaInfo(empresa);
      setCategorias(cats);
      const defaultCat = cats.length > 0 ? cats[0].codigo : null;
      setCategoriaAtiva(defaultCat);
      
      // Carrega os produtos da categoria padrão
      if (defaultCat !== null) {
        getProdutosPorCategoria(defaultCat).then(setProdutos).catch(() => setProdutos([]));
      } else {
          getProdutosPorCategoria(0).then(setProdutos).catch(() => setProdutos([]));
      }
    })
    .catch((err) => {
      console.error("Erro ao carregar dados iniciais:", err);
      setError("Não foi possível carregar o cardápio. Verifique a conexão.");
    })
    .finally(() => setLoading(false));
  }, []);

  // 2. Recarregar produtos ao mudar a categoria
  useEffect(() => {
    if (categoriaAtiva === null && !loading) {
        getProdutosPorCategoria(0).then(setProdutos).catch(() => setProdutos([]));
        return;
    }
    if (typeof categoriaAtiva === 'number') {
      getProdutosPorCategoria(categoriaAtiva)
        .then(setProdutos)
        .catch(() => setProdutos([]));
    }
  }, [categoriaAtiva, loading]);


  // --- Lógica do Carrinho ---
  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const itemExistente = prev.find((i) => i.codinterno === produto.codinterno);
      if (itemExistente) {
        return prev.map((i) =>
          i.codinterno === produto.codinterno ? { ...i, qtd: i.qtd + 1 } : i,
        );
      }
      // O preço vem como Number, então o mapeamento é seguro
      return [...prev, { ...produto, qtd: 1 }];
    });
  };
  
  const handleAumentar = (codprod: number) => {
      setCarrinho((prev) =>
        prev.map((i) =>
          i.codinterno === codprod ? { ...i, qtd: i.qtd + 1 } : i,
        ),
      );
  };
  const handleDiminuir = (codprod: number) => {
      setCarrinho((prev) =>
        prev
          .map((i) =>
            i.codinterno === codprod ? { ...i, qtd: i.qtd - 1 } : i,
          )
          .filter((i) => i.qtd > 0),
      );
  };
  const handleRemover = (codprod: number) => {
      setCarrinho((prev) => prev.filter((i) => i.codinterno !== codprod));
  };
  
  // --- Finalizar Pedido (Delivery) ---
  const handleFinalizarPedido = async () => {
    if (carrinho.length === 0) {
      alert('Seu carrinho está vazio!');
      return;
    }
    if (!user) {
      alert('Você precisa estar logado para finalizar um pedido.');
      return;
    }

    const itensDto: PedidoItemDto[] = carrinho.map((item) => ({
      codprod: Number(item.codinterno),
      descricao: item.descricao,
      qtd: item.qtd,
      unitario: Number(item.preco),
      obs: item.obs
    }));

    try {
      const pedidoData: CreatePedidoDto = {
        tipo: 'D', 
        nome_cli_esp: user.nome,
        fone_esp: '999999999',
        val_taxa_entrega: 5.0, 
        cod_endereco: 1, 
        itens: itensDto,
      };

      const novoQuiosque = await salvarPedidoDelivery(pedidoData);
      
      alert(
        `Pedido #${novoQuiosque.codseq} registrado com sucesso!\nStatus: ${novoQuiosque.obs}`,
      );
      setCarrinho([]);

    } catch (err: any) {
      console.error('Falha ao salvar pedido:', err);
      alert(`Erro ao finalizar pedido: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
        <div className='min-h-screen bg-brand-gray-light flex items-center justify-center'>
            <Loader2 className="animate-spin text-brand-blue-dark" size={64} />
        </div>
    );
  }
  
  if (error) {
     return (
        <div className='min-h-screen bg-red-100 flex flex-col items-center justify-center p-10'>
            <AlertTriangle size={48} className="text-red-600 mb-4" />
            <h1 className="text-2xl font-bold text-red-800">Erro de Conexão</h1>
            <p className="text-red-700 mt-2">{error}</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-gray-light">
      <Header />
      <main className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Coluna 1: Categorias */}
        <div className="md:col-span-1">
          <CategoriaSidebar
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            onSelectCategoria={setCategoriaAtiva}
          />
        </div>
        
        {/* Coluna 2 e 3: Produtos */}
        <div className="md:col-span-2">
          <ProdutoLista
            produtos={produtos}
            onAdicionarProduto={adicionarAoCarrinho}
          />
        </div>
        
        {/* Coluna 4: Carrinho */}
        <div className="md:col-span-1">
          <Carrinho
            itens={carrinho}
            onFinalizar={handleFinalizarPedido}
            onAumentar={handleAumentar}
            onDiminuir={handleDiminuir}
            onRemover={handleRemover}
            titulo={`Seu Pedido (${user ? user.nome : 'Delivery'})`}
            textoBotao="Confirmar Pedido"
            isCheckout={true}
          />
        </div>
      </main>
    </div>
  );
}