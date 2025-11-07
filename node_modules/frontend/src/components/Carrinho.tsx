// master-restaurante-v2/packages/frontend/src/components/Carrinho.tsx

import type { ItemCarrinho } from '../types';
import { formatCurrency } from '../utils/helpers';
import { Trash2, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';

interface CarrinhoProps {
  itens: ItemCarrinho[];
  onFinalizar: () => void;
  onAumentar: (codprod: number) => void;
  onDiminuir: (codprod: number) => void;
  onRemover: (codprod: number) => void;
  titulo?: string;
  textoBotao?: string;
  isCheckout?: boolean; // Define a cor do botão (Azul ou Verde/Accent)
}

function BotaoQtd({ onClick, children }: { onClick: () => void, children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="bg-brand-gray-mid text-brand-blue-dark font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all hover:bg-brand-blue-dark hover:text-white text-base leading-none"
    >
      {children}
    </button>
  );
}

export function Carrinho({
  itens,
  onFinalizar,
  onAumentar,
  onDiminuir,
  onRemover,
  titulo = 'Meu Pedido',
  textoBotao = 'Finalizar Pedido',
  isCheckout = false,
}: CarrinhoProps) {
  const subtotal = itens.reduce(
    (acc, item) => acc + Number(item.preco) * item.qtd,
    0,
  );
  
  const taxaEntrega = isCheckout ? 5.00 : 0;
  const total = subtotal + taxaEntrega;
  
  const mainButtonClasses = isCheckout 
    ? "bg-brand-blue-light hover:bg-brand-blue-dark"
    : "bg-brand-accent hover:bg-brand-accent/80";

  return (
    <div className="bg-white p-5 rounded-xl shadow-2xl flex flex-col h-full sticky top-4">
      <h2 className="text-2xl font-bold mb-4 text-brand-blue-dark border-b border-brand-gray-mid pb-3 flex items-center space-x-2">
        <ShoppingCart size={24} />
        <span>{titulo}</span>
      </h2>

      {itens.length === 0 ? (
        <div className="flex-1 flex items-center justify-center h-full">
          <p className="text-zinc-500 text-center py-8">
            Nenhum item adicionado.
          </p>
        </div>
      ) : (
        <>
          {/* Lista de Itens */}
          <div className="flex-1 flex flex-col space-y-4 overflow-y-auto max-h-[calc(100vh-200px)] pr-2 scroll-hide">
            {itens.map((item) => (
              <motion.div
                key={item.codinterno}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0"
              >
                <div className="flex-1 pr-2">
                  <h4 className="font-semibold text-zinc-800 leading-tight">{item.descricao}</h4>
                  <p className="text-xs text-zinc-500">{formatCurrency(Number(item.preco))} / und</p>
                  
                  <div className="flex items-center space-x-2 mt-1">
                    <BotaoQtd onClick={() => onDiminuir(item.codinterno)}>
                      -
                    </BotaoQtd>
                    <span className="font-bold text-zinc-800 w-5 text-center">
                      {item.qtd}
                    </span>
                    <BotaoQtd onClick={() => onAumentar(item.codinterno)}>
                      +
                    </BotaoQtd>
                    <button
                      onClick={() => onRemover(item.codinterno)}
                      className="text-red-500 hover:text-red-700 ml-2"
                      title="Remover Item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="text-right flex flex-col">
                  <p className="font-bold text-lg text-brand-blue-dark">
                    {formatCurrency(Number(item.preco) * item.qtd)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* --- RESUMO E BOTÃO DE FINALIZAR --- */}
          <div className="border-t border-brand-gray-mid pt-4 mt-auto">
             <div className="flex justify-between text-base mb-1">
                <span className="text-zinc-600">Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              
              {isCheckout && (
                <div className="flex justify-between text-base mb-3">
                  <span className="text-zinc-600">Taxa de Entrega:</span>
                  <span className="font-semibold">{formatCurrency(taxaEntrega)}</span>
                </div>
              )}

            <div className="flex justify-between font-extrabold text-xl mb-4 border-t pt-2">
              <span>Total:</span>
              <span className="text-brand-blue-dark">{formatCurrency(total)}</span>
            </div>

            <button
              onClick={onFinalizar}
              className={`w-full text-white py-3 rounded-lg font-bold text-lg transition-all disabled:opacity-50 shadow-md hover:shadow-lg ${mainButtonClasses}`}
              disabled={itens.length === 0}
            >
              {textoBotao}
            </button>
          </div>
        </>
      )}
    </div>
  );
}