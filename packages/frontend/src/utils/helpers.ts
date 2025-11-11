// packages/frontend/src/utils/helpers.ts
import type { Mesa } from '../types';

/**
 * =========================================================================
 * NOVA FUNÇÃO INTERNA (MAIS ROBUSTA) PARA CORRIGIR "Invalid Date"
 * =========================================================================
 * Tenta converter uma string de data (potencialmente de formatos diferentes,
 * como SQL Server) para um objeto Date válido.
 */
function parseISODate(dateString: string | undefined | null): Date | null {
  // ==========================================================
  // ESTA É A CORREÇÃO FINAL:
  // Verifica explicitamente se a entrada é uma string e não está vazia.
  // Isso impede o erro 'formattedStr.replace is not a function'
  // se a data for um objeto, null, ou undefined.
  // ==========================================================
  if (typeof dateString !== 'string' || dateString.length === 0) {
    return null;
  }

  try {
    let formattedStr = dateString; // Agora sabemos que é uma string não vazia

    // 1. Substitui espaço por 'T' (ex: '2025-11-10 17:00:00')
    formattedStr = formattedStr.replace(' ', 'T');

    // 2. Substitui vírgula de milissegundos por ponto (ex: '...:00,000Z')
    // Esta é outra causa comum do erro "Invalid Date"
    formattedStr = formattedStr.replace(',', '.');

    // 3. Trunca milissegundos excessivos (SQL Server pode ter 7 dígitos)
    const dotIndex = formattedStr.lastIndexOf('.');
    if (dotIndex > -1) {
      let tzIndex = formattedStr.lastIndexOf('Z');
      if (tzIndex === -1) {
        tzIndex = formattedStr.length;
      }
      const msPart = formattedStr.substring(dotIndex + 1, tzIndex);
      if (msPart.length > 3) {
        const timezonePart = formattedStr.substring(tzIndex);
        formattedStr = formattedStr.substring(0, dotIndex + 4) + timezonePart;
      }
    }

    // 4. Tenta criar a data
    const date = new Date(formattedStr);

    // 5. Verifica se a data é válida
    if (isNaN(date.getTime())) {
      console.warn(
        'Data inválida (pós-formatação):',
        dateString,
        '->',
        formattedStr,
      );
      return null;
    }

    return date;
  } catch (e) {
    console.error('Erro ao parsear data:', e, dateString);
    return null;
  }
}

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
 */
export const formatTimeFromISO = (isoDate: string | undefined) => {
  const date = parseISODate(isoDate); // <-- Agora usa a função robusta
  if (!date) return 'N/A';

  try {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Formata data completa para exibição amigável (DD/MM/YYYY HH:MM).
 */
export const formatDateTime = (isoDate: string | undefined) => {
  const date = parseISODate(isoDate); // <-- Agora usa a função robusta
  if (!date) return 'Data Inválida';

  try {
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return 'N/A';
  }
};

/**
 * Calcula o tempo decorrido desde a abertura da mesa.
 */
export const getTempoDecorrido = (dataAbertura: string | undefined): string => {
  const abertura = parseISODate(dataAbertura); // <-- Agora usa a função robusta
  if (!abertura) return '0min';

  try {
    const agora = new Date();
    const diffMs = agora.getTime() - abertura.getTime();

    // Se a data for no futuro (relógio do servidor/cliente dessincronizado)
    if (diffMs < 0) {
      return '0min';
    }

    const diffMinutos = Math.floor(diffMs / 60000);

    if (diffMinutos < 60) {
      return `${diffMinutos}min`;
    }

    const horas = Math.floor(diffMinutos / 60);
    const minutos = diffMinutos % 60;
    return `${horas}h ${minutos}min`;
  } catch {
    return '0min';
  }
};