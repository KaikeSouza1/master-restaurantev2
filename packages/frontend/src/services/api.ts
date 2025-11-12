// packages/frontend/src/services/api.ts

import axios from 'axios';
import type {
  Categoria, 
  CreatePedidoDto, 
  LoginDto, 
  Mesa, 
  PedidoItemDto, 
  Produto, 
  Quiosque,
  EmpresaInfo,
  FinalizarCaixaDto,
} from '../types';

// ==========================================================
// CONFIGURAÇÃO DO AXIOS (MUDANÇA PARA VERCEL)
// ==========================================================

// 1. A API_URL agora é RELATIVA (vazia)
const API_URL = '';

export const apiClient = axios.create({
  // 2. A baseURL agora aponta para /api/restaurante
  //    O 'api' é o prefixo global que definimos no main.ts do backend
  baseURL: `${API_URL}/api/restaurante`, 
});

type LoginResponse = { access_token: string };

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


// ==========================================================
// FUNÇÕES DE AUTENTICAÇÃO (MUDANÇA PARA VERCEL)
// ==========================================================
export const login = async (credentials: LoginDto): Promise<LoginResponse> => {
  // 3. A rota de Auth agora é /api/auth/login
  const response = await axios.post(`${API_URL}/api/auth/login`, credentials);
  return response.data;
};

export const registrarCliente = async (dados: any) => {
  // 4. A rota de Auth agora é /api/auth/registrar
  const response = await axios.post(`${API_URL}/api/auth/registrar`, dados);
  return response.data;
};

// ==========================================================
// FUNÇÕES DO CARDÁPIO (Sem mudanças)
// ==========================================================
export const getEmpresaInfo = async (): Promise<EmpresaInfo> => {
  const response = await apiClient.get('/empresa');
  return response.data;
};

export const getCategorias = async (): Promise<Categoria[]> => {
  const response = await apiClient.get('/categorias');
  return response.data;
};

export const getProdutosPorCategoria = async (categoriaId: number): Promise<Produto[]> => {
  // Lógica para 'todos' os produtos (se a categoriaId for 0 ou null, dependendo do Front)
  const path = categoriaId === 0 || categoriaId === null ? '/produtos' : `/produtos/${categoriaId}`;
  const response = await apiClient.get(path);
  return response.data;
};

export const salvarPedidoDelivery = async (pedidoData: CreatePedidoDto): Promise<Quiosque> => {
  const response = await apiClient.post('/pedidos/delivery', pedidoData);
  return response.data;
};


// ==========================================================
// FUNÇÕES DO ADMIN (Sem mudanças)
// ==========================================================

// --- KDS ---
export const getKdsOrders = async (): Promise<Mesa[]> => {
  const response = await apiClient.get('/admin/kds');
  return response.data;
};

export const getFinalizadosOrders = async (): Promise<Mesa[]> => {
  const response = await apiClient.get('/admin/kds/finalizados');
  return response.data;
};

export const atualizarStatusKds = async (codseq: number, status: string): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/kds/status/${codseq}`, {
    status,
  });
  return response.data;
};

export const finalizarPedidoNfce = async (codseq: number): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/kds/finalizar/${codseq}`);
  return response.data;
};

// --- MESAS ---
export const getMesasStatus = async (): Promise<Mesa[]> => {
  const response = await apiClient.get('/admin/mesas');
  return response.data;
};

export const abrirMesa = async (numMesa: number): Promise<Mesa> => {
  const response = await apiClient.post('/admin/mesas/abrir', { numMesa });
  return response.data;
};

export const adicionarItensMesa = async (codseq: number, itens: PedidoItemDto[]): Promise<Mesa> => {
  const response = await apiClient.post(`/admin/mesas/adicionar/${codseq}`, { itens });
  return response.data;
};

export const transferirMesa = async (codseq: number, numMesaDestino: number): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/mesas/transferir/${codseq}`, { numMesaDestino });
  return response.data;
};

export const solicitarFechamento = async (codseq: number): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/mesas/fechar/${codseq}`);
  return response.data;
};

export const juntarMesas = async (codseqOrigem: number, codseqDestino: number): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/mesas/juntar`, { codseqOrigem, codseqDestino });
  return response.data;
};

export const liberarMesa = async (codseq: number): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/mesas/liberar/${codseq}`);
  return response.data;
};

export const finalizarMesaCaixa = async (codseq: number, dto: FinalizarCaixaDto): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/mesas/finalizar-caixa/${codseq}`, dto);
  return response.data;
};

// ==========================================================
// REMOÇÃO SIMPLIFICADA (MODIFICADO)
// ==========================================================
export const removerItemMesa = async (
  codseq: number, 
  codseqItem: number, 
  motivo?: string
): Promise<Mesa> => {
  const response = await apiClient.delete(`/admin/mesas/${codseq}/itens/${codseqItem}`, {
    data: motivo ? { motivo } : {}
  });
  return response.data;
};

export const editarQuantidadeItem = async (
  codseq: number, 
  codseqItem: number, 
  novaQuantidade: number, 
  motivo?: string
): Promise<Mesa> => {
  const response = await apiClient.patch(`/admin/mesas/${codseq}/itens/${codseqItem}/quantidade`, {
    nova_quantidade: novaQuantidade,
    motivo
  });
  return response.data;
};

// ==========================================================
// DIVISÃO SIMPLIFICADA (ADICIONADO)
// ==========================================================

export interface DivisaoSimplificada {
  codseq: number;
  total_conta: number;
  num_pessoas: number;
  divisao: Record<number, {
    itens: Array<{
      descricao: string;
      qtd: number;
      total: number;
    }>;
    total: number;
  }>;
}

export const calcularDivisao = async (
  codseq: number,
  numPessoas: number,
  itensPorPessoa: Array<{ codseq_item: number; pessoa: number }>
): Promise<DivisaoSimplificada> => {
  const response = await apiClient.post(`/admin/mesas/${codseq}/calcular-divisao`, {
    num_pessoas: numPessoas,
    itens_por_pessoa: itensPorPessoa
  });
  return response.data;
};

// ==========================================================
// DIVISÃO DE CONTA
// ==========================================================

export interface DivisaoContaStatus {
  codseq: number;
  total_conta: number;
  total_pago: number;
  total_restante: number;
  pagamentos: Array<{
    pessoa_numero: number;
    nome_pessoa?: string;
    valor_pago: number;
    forma_pagamento: number;
    data_hora: string;
  }>;
  pode_finalizar: boolean;
}

export const obterStatusDivisao = async (codseq: number): Promise<DivisaoContaStatus> => {
  const response = await apiClient.get(`/admin/mesas/${codseq}/divisao-status`);
  return response.data;
};

export const registrarPagamentoParcial = async (
  codseq: number,
  pagamento: {
    pessoa_numero: number;
    nome_pessoa?: string;
    valor_pago: number;
    forma_pagamento: number;
  }
): Promise<DivisaoContaStatus> => {
  const response = await apiClient.post(`/admin/mesas/${codseq}/registrar-pagamento-parcial`, pagamento);
  return response.data;
};

export const finalizarPedidoDividido = async (codseq: number): Promise<Mesa> => {
  const response = await apiClient.post(`/admin/mesas/${codseq}/finalizar-dividido`);
  return response.data;
};