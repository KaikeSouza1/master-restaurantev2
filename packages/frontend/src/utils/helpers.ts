// packages/frontend/src/utils/helpers.ts
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
 * Retorna o status da mesa com cores e estilos aprimorados.
 */
export const getMesaStatus = (mesa: Mesa) => {
  // Mesa Livre (não existe no banco)
  if (mesa.codseq === 0) {
    return {
      status: 'LIVRE',
      bgColor: 'bg-white',
      ringColor: 'ring-zinc-300',
      textColor: 'text-zinc-500',
    };
  }

  const status = mesa.obs?.toUpperCase();

  // Mesa em Pagamento (Prioritário)
  if (status === 'PAGAMENTO') {
    return {
      status: 'PAGAMENTO',
      bgColor: 'bg-gradient-to-br from-yellow-500 to-amber-600', 
      ringColor: 'ring-yellow-400',
      textColor: 'text-white',
    };
  }
  
  // Mesa Ocupada (qualquer outro status com vda_finalizada = 'N')
  if (mesa.vda_finalizada === 'N') {
    return {
      status: 'ABERTA', 
      bgColor: 'bg-gradient-to-br from-red-600 to-rose-700', 
      ringColor: 'ring-red-400',
      textColor: 'text-white',
    };
  }

  // Fallback (não deveria acontecer)
  return {
    status: 'LIVRE',
    bgColor: 'bg-white', 
    ringColor: 'ring-zinc-300',
    textColor: 'text-zinc-500',
  };
};

/**
 * Formata a data ISO para mostrar apenas a hora (HH:MM).
 * CORREÇÃO: Converte string ISO para objeto Date corretamente
 */
export const formatTimeFromISO = (isoDate: string | undefined) => {
  if (!isoDate) return 'N/A';
  try {
    // Remove o 'Z' se existir e trata como horário local
    const dateStr = isoDate.replace('Z', '');
    const date = new Date(dateStr);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo' // Força timezone do Brasil
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Formata data completa para exibição amigável (DD/MM/YYYY HH:MM).
 * CORREÇÃO: Trata timezone corretamente
 */
export const formatDateTime = (isoDate: string | undefined) => {
  if (!isoDate) return 'N/A';
  try {
    // Remove o 'Z' se existir e trata como horário local
    const dateStr = isoDate.replace('Z', '');
    const date = new Date(dateStr);
    
    // Verifica se a data é válida
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo' // Força timezone do Brasil
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Formata apenas a data (DD/MM/YYYY) sem hora
 */
export const formatDate = (isoDate: string | undefined) => {
  if (!isoDate) return 'N/A';
  try {
    const dateStr = isoDate.replace('Z', '');
    const date = new Date(dateStr);
    
    if (isNaN(date.getTime())) return 'N/A';
    
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      timeZone: 'America/Sao_Paulo'
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Calcula o tempo decorrido desde a abertura da mesa.
 */
export const getTempoDecorrido = (dataAbertura: string | undefined): string => {
  if (!dataAbertura) return '0min';
  
  try {
    const dateStr = dataAbertura.replace('Z', '');
    const abertura = new Date(dateStr);
    const agora = new Date();
    const diffMs = agora.getTime() - abertura.getTime();
    const diffMinutos = Math.floor(diffMs / 60000);
    
    if (diffMinutos < 0) return '0min'; // Proteção contra datas futuras
    if (diffMinutos < 60) return `${diffMinutos}min`;
    
    const horas = Math.floor(diffMinutos / 60);
    const minutos = diffMinutos % 60;
    return `${horas}h ${minutos}min`;
  } catch {
    return '0min';
  }
};

/**
 * Formata data/hora de forma compacta (Hoje, Ontem, DD/MM)
 */
export const formatDateCompact = (isoDate: string | undefined): string => {
  if (!isoDate) return 'N/A';
  
  try {
    const dateStr = isoDate.replace('Z', '');
    const date = new Date(dateStr);
    const hoje = new Date();
    const ontem = new Date(hoje);
    ontem.setDate(ontem.getDate() - 1);
    
    // Verifica se é hoje
    if (date.toDateString() === hoje.toDateString()) {
      return `Hoje às ${formatTimeFromISO(isoDate)}`;
    }
    
    // Verifica se é ontem
    if (date.toDateString() === ontem.toDateString()) {
      return `Ontem às ${formatTimeFromISO(isoDate)}`;
    }
    
    // Data mais antiga
    return `${formatDate(isoDate)} às ${formatTimeFromISO(isoDate)}`;
  } catch {
    return 'N/A';
  }
};