// master-restaurante-v2/packages/frontend/src/utils/helpers.ts
import type { Mesa } from '../types';

/**
 * Formata um número para a moeda BRL (Real Brasileiro).
 */
export const formatCurrency = (value: number | undefined | null) => {
  return (value || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

/**
 * Retorna o status (string) e as cores de UI com base no objeto Mesa.
 */
export const getMesaStatus = (mesa: Mesa) => {
  // 1. MESA LIVRE (Não está no banco de dados)
  if (mesa.codseq === 0) {
    return {
      status: 'LIVRE',
      bgColor: 'bg-white',
      ringColor: 'ring-zinc-300',
      textColor: 'text-zinc-500',
    };
  }

  const status = mesa.obs?.toUpperCase();

  // 2. MESA EM PAGAMENTO
  if (status === 'PAGAMENTO') {
    return {
      status: 'PAGAMENTO',
      bgColor: 'bg-yellow-500', 
      ringColor: 'ring-yellow-700',
      textColor: 'text-white',
    };
  }
  
  // 3. MESA ABERTA (Qualquer outro status: NOVO, PREPARANDO, etc.)
  if (mesa.vda_finalizada === 'N') {
    // 💡 CORREÇÃO: Mostra "ABERTA" em vez do status interno do KDS ("NOVO")
    return {
      status: 'ABERTA', 
      bgColor: 'bg-red-600', // Cor de ocupada
      ringColor: 'ring-red-800',
      textColor: 'text-white',
    };
  }

  // Fallback (não deve acontecer)
  return {
    status: 'LIVRE',
    bgColor: 'bg-white', 
    ringColor: 'ring-zinc-300',
    textColor: 'text-zinc-500',
  };
};

/**
 * Formata a data de abertura para mostrar apenas a hora.
 */
export const formatTimeFromISO = (isoDate: string | undefined) => {
    if (!isoDate) return 'N/A';
    try {
        const date = new Date(isoDate);
        return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return 'N/A';
    }
}