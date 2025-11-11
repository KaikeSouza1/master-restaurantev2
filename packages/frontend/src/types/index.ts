// packages/frontend/src/types/index.ts

// ==========================================================
// TIPOS DE AUTENTICAÇÃO
// ==========================================================

export interface User {
  id: number;
  email: string;
  nome: string;
  role: 'admin' | 'cliente';
  iat?: number;
  exp?: number;
}

export interface LoginDto {
  login: string; 
  senha: string;
}

export interface RegistrarClienteDto {
  nome: string;
  email: string;
  cpf: string;
  telefone: string;
  senha: string;
}

// ==========================================================
// TIPOS DE DADOS (Cardápio, Pedidos)
// ==========================================================

export interface EmpresaInfo {
  nome: string;
  endere: string;
  num: string;
  bairro: string;
  cidade: string;
  estado: string;
  fone: string;
}

export interface Categoria {
  codigo: number;
  nome: string;
}

export interface Produto {
  codinterno: number;
  descricao: string;
  preco: number; 
  grupo: number; 
}

export interface ItemCarrinho extends Produto {
  qtd: number;
  obs?: string;
}

export interface PedidoItemDto {
  codprod: number;
  descricao: string;
  qtd: number;
  unitario: number;
  obs?: string;
}

export interface CreatePedidoDto {
  tipo: 'D' | 'M';
  nome_cli_esp?: string;
  fone_esp?: string;
  val_taxa_entrega?: number;
  num_quiosque?: number;
  cod_endereco?: number;
  itens: PedidoItemDto[];
}

// ==========================================================
// TIPOS DE RESPOSTA DA API (Mesa/KDS)
// ==========================================================

export interface ItemDoPedido {
  codseq?: number; 
  descricao: string;
  qtd: number;
  unitario?: number; 
  total: number;
  obs?: string | null;
}

export interface Mesa {
  codseq: number; 
  tipo: 'M' | 'D'; 
  num_quiosque: number | null; 
  data_hora_abertura: string;
  vda_finalizada: 'N' | 'S'; 
  obs: string | null; 
  
  nome_cli_esp: string | null;
  fone_esp: string | null;
  
  sub_total_geral: number;
  total: number;
  
  quitens: ItemDoPedido[]; 
  
  data_hora_finalizada?: string;
}

export type Quiosque = Mesa;
export type KdsPedido = Mesa;

export interface AdicionarItensDto {
  itens: PedidoItemDto[];
}

export interface FinalizarCaixaDto {
  cod_forma_pagto: number;
  num_caixa?: number;
}