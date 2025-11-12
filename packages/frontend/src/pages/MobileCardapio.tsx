// packages/frontend/src/pages/MobileCardapio.tsx

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  getCategorias,
  getProdutosPorCategoria,
  getMesasStatus,
  adicionarItensMesa,
} from '../services/api';
import type { Categoria, Produto, ItemCarrinho, PedidoItemDto, Mesa } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Loader2, Plus, Minus, Send, ListOrdered, X, MessageSquare, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileHeader } from '../components/MobileHeader'; // Importa o header

// Modal simples para OBS (componente local, não precisa de export)
function ModalObs({
  item,
  onClose,
  onSave,
}: {
  item: ItemCarrinho;
  onClose: () => void;
  onSave: (obs: string) => void;
}) {
  const [obs, setObs] = useState(item.obs || '');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-6"
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-zinc-800">Observação</h3>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-zinc-100">
            <X size={20} />
          </button>
        </div>
        <p className="text-zinc-600 mb-2 font-semibold">{item.descricao}</p>
        <textarea
          className="w-full p-3 border-2 border-zinc-300 rounded-lg focus:ring-2 focus:ring-brand-blue-light"
          rows={3}
          value={obs}
          onChange={(e) => setObs(e.target.value)}
          placeholder="Ex: Sem cebola, ponto da carne..."
        />
        <button
          onClick={() => onSave(obs)}
          className="mt-4 w-full py-3 bg-brand-blue-dark text-white font-bold rounded-lg"
        >
          Salvar Observação
        </button>
      </motion.div>
    </motion.div>
  );
}

// ==========================================================
// CORREÇÃO AQUI: export function (named export)
// ==========================================================
export function MobileCardapio() {
  const { codseq } = useParams(); // Pega o CODESEQ (ID do pedido) da URL
  const navigate = useNavigate();

  const [mesa, setMesa] = useState<Mesa | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [catSelecionada, setCatSelecionada] = useState<number | null>(null);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  
  const [loadingProdutos, setLoadingProdutos] = useState(false);
  const [loadingMesa, setLoadingMesa] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [modalObsItem, setModalObsItem] = useState<ItemCarrinho | null>(null);

  // Busca info da mesa (para saber o número) e as categorias
  useEffect(() => {
    async function carregarDados() {
      if (!codseq) return;
      try {
        setLoadingMesa(true);
        // Busca a mesa
        const mesas = await getMesasStatus();
        const mesaAtual = mesas.find(m => m.codseq === Number(codseq));
        if (mesaAtual) {
          setMesa(mesaAtual);
        } else {
          toast.error('Mesa não encontrada.');
          navigate('/mobile');
        }
        
        // Busca categorias
        const cats = await getCategorias();
        setCategorias([{ codigo: 0, nome: 'Todos' }, ...cats]); // Adiciona "Todos"
        setCatSelecionada(0); // Seleciona "Todos" por padrão
        
      } catch (err) {
        toast.error('Erro ao carregar dados.');
      } finally {
        setLoadingMesa(false);
      }
    }
    carregarDados();
  }, [codseq, navigate]);

  // Busca produtos ao mudar de categoria
  useEffect(() => {
    async function carregarProdutos() {
      if (catSelecionada === null) return;
      try {
        setLoadingProdutos(true);
        const prods = await getProdutosPorCategoria(catSelecionada);
        setProdutos(prods);
      } catch (err) {
        toast.error('Erro ao buscar produtos.');
      } finally {
        setLoadingProdutos(false);
      }
    }
    carregarProdutos();
  }, [catSelecionada]);


  // --- Funções do Carrinho ---

  const adicionarAoCarrinho = (produto: Produto) => {
    setCarrinho((prev) => {
      const itemExistente = prev.find((item) => item.codinterno === produto.codinterno && !item.obs);
      if (itemExistente) {
        return prev.map((item) =>
          item.codinterno === produto.codinterno && !item.obs
            ? { ...item, qtd: item.qtd + 1 }
            : item
        );
      } else {
        return [...prev, { ...produto, qtd: 1, obs: '' }];
      }
    });
  };

  const atualizarQtd = (codinterno: number, obs: string | undefined, novaQtd: number) => {
    setCarrinho((prev) => {
      if (novaQtd <= 0) {
        // Remove o item
        return prev.filter(item => !(item.codinterno === codinterno && item.obs === obs));
      } else {
        // Atualiza a qtd
        return prev.map(item => 
          item.codinterno === codinterno && item.obs === obs
            ? { ...item, qtd: novaQtd }
            : item
        );
      }
    });
  };
  
  const handleSalvarObs = (obs: string) => {
    if (!modalObsItem) return;
    
    // Se o item já tem obs, atualiza
    if (modalObsItem.obs) {
       setCarrinho(prev => prev.map(item => 
         item.codinterno === modalObsItem.codinterno && item.obs === modalObsItem.obs
           ? { ...item, obs }
           : item
       ));
    } else {
      // Se é um item novo (sem obs), remove o antigo e adiciona um novo com obs
      setCarrinho(prev => [
        ...prev.filter(item => item.codinterno !== modalObsItem.codinterno || item.obs !== modalObsItem.obs),
        { ...modalObsItem, obs }
      ]);
    }
    
    setModalObsItem(null);
  };

  // --- Enviar Pedido ---

  const handleEnviarPedido = async () => {
    if (carrinho.length === 0) {
      toast.error('Carrinho vazio!');
      return;
    }
    
    setEnviando(true);
    
    const itensDto: PedidoItemDto[] = carrinho.map(item => ({
      codprod: item.codinterno,
      descricao: item.descricao,
      qtd: item.qtd,
      unitario: item.preco,
      obs: item.obs,
    }));
    
    try {
      await adicionarItensMesa(Number(codseq), itensDto);
      toast.success('Itens lançados!');
      setCarrinho([]); // Limpa o carrinho
      
    } catch (err: any) {
      toast.error(`Erro ao lançar: ${err.response?.data?.message || err.message}`);
    } finally {
      setEnviando(false);
    }
  };

  const totalCarrinho = carrinho.reduce((acc, item) => acc + (item.preco * item.qtd), 0);
  
  if (loadingMesa || !mesa) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-zinc-100">
        <Loader2 className="animate-spin text-brand-blue-dark" size={48} />
        <p className="text-zinc-600 font-semibold mt-4">Carregando mesa...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-brand-gray-light">
      <MobileHeader 
        title={`Mesa ${mesa.num_quiosque}`} 
        subtitle="Lançar Itens" 
        canGoBack={true} 
      />
      
      {/* Botão para Revisar Itens Lançados */}
      <div className="p-3">
        <button
          onClick={() => navigate(`/mobile/mesa/${codseq}/revisao`)}
          className="w-full flex items-center justify-center space-x-2 py-3 bg-white text-zinc-700 font-bold rounded-xl shadow-md border border-zinc-200"
        >
          <ListOrdered size={20} />
          <span>Ver Itens / Remover</span>
        </button>
      </div>

      {/* Layout Principal (Categorias e Produtos) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Categorias */}
        <nav className="w-28 flex-shrink-0 overflow-y-auto bg-white shadow-inner">
          {categorias.map(cat => (
            <button
              key={cat.codigo}
              onClick={() => setCatSelecionada(cat.codigo)}
              className={`w-full text-left p-3 font-semibold text-sm border-r-4
                ${cat.codigo === catSelecionada 
                  ? 'bg-brand-gray-light border-brand-blue-dark text-brand-blue-dark' 
                  : 'border-transparent text-zinc-600'
                }`}
            >
              {cat.nome}
            </button>
          ))}
        </nav>

        {/* Produtos */}
        <main className="flex-1 overflow-y-auto p-3">
          {loadingProdutos ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="animate-spin text-brand-blue-dark" size={32} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {produtos.map(prod => (
                <motion.div
                  key={prod.codinterno}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col"
                >
                  <div className="p-3 flex-1">
                    <h4 className="font-bold text-zinc-800 leading-tight">{prod.descricao}</h4>
                    <p className="font-black text-brand-blue-dark text-lg mt-1">
                      {formatCurrency(prod.preco)}
                    </p>
                  </div>
                  <button 
                    onClick={() => adicionarAoCarrinho(prod)}
                    className="w-full py-2 bg-brand-blue-dark text-white font-bold flex items-center justify-center space-x-1"
                  >
                    <Plus size={18} />
                    <span>Adicionar</span>
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer do Carrinho Fixo */}
      <AnimatePresence>
        {carrinho.length > 0 && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 bg-white border-t-2 border-brand-blue-dark shadow-2xl"
          >
            <div className="p-4 max-h-60 overflow-y-auto">
              <h3 className="font-black text-xl text-zinc-800 mb-3">Carrinho</h3>
              <div className="space-y-3">
                {carrinho.map((item) => (
                  <div key={`${item.codinterno}-${item.obs}`} className="flex items-center space-x-3">
                    <div className="flex-1">
                      <p className="font-semibold text-zinc-800">{item.descricao}</p>
                      {item.obs && (
                        <p className="text-xs text-red-600 italic">OBS: {item.obs}</p>
                      )}
                      <p className="font-bold text-sm text-brand-blue-dark">
                        {formatCurrency(item.preco)}
                      </p>
                    </div>
                    
                    <button onClick={() => setModalObsItem(item)} className="p-2 rounded-full hover:bg-zinc-100">
                      <MessageSquare size={18} className="text-zinc-600" />
                    </button>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => atualizarQtd(item.codinterno, item.obs || '', item.qtd - 1)}
                        className="p-2 bg-zinc-200 rounded-full"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="font-bold text-lg w-8 text-center">{item.qtd}</span>
                      <button 
                        onClick={() => atualizarQtd(item.codinterno, item.obs || '', item.qtd + 1)}
                        className="p-2 bg-zinc-200 rounded-full"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 bg-brand-gray-light border-t border-zinc-200">
              <button
                onClick={handleEnviarPedido}
                disabled={enviando}
                className="w-full py-4 bg-brand-accent text-white font-black text-lg rounded-xl shadow-lg flex items-center justify-center space-x-3 disabled:opacity-50"
              >
                {enviando ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <>
                    <Send size={20} />
                    <span>Lançar {carrinho.length} Iten(s) ({formatCurrency(totalCarrinho)})</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer Vazio (só para mostrar o carrinho) */}
      {carrinho.length === 0 && (
        <div className="flex-shrink-0 p-4 bg-white border-t border-zinc-200 flex items-center justify-center space-x-2 text-zinc-500">
          <ShoppingCart size={20} />
          <span className="font-semibold">Carrinho vazio</span>
        </div>
      )}

      {/* Modal de Observação */}
      <AnimatePresence>
        {modalObsItem && (
          <ModalObs 
            item={modalObsItem}
            onClose={() => setModalObsItem(null)}
            onSave={handleSalvarObs}
          />
        )}
      </AnimatePresence>
    </div>
  );
}