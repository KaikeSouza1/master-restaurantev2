// packages/backend/src/restaurante/dto/restaurante.dtos.ts
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

// --- DTO para Itens ---
export class PedidoItemDto {
  @IsInt()
  codprod: number;

  @IsString()
  descricao: string;

  @IsNumber()
  @Min(0.01)
  qtd: number;

  @IsNumber()
  @Min(0)
  unitario: number;

  @IsString()
  @IsOptional()
  obs?: string;
}

// --- DTO para criar Pedido (Delivery) ---
export class CreatePedidoDto {
  @IsString()
  tipo: 'D'; // Apenas Delivery nesta rota

  @IsString()
  @IsOptional()
  nome_cli_esp?: string;

  @IsString()
  @IsOptional()
  fone_esp?: string;
  
  @IsInt()
  @IsOptional()
  cod_endereco?: number;

  @IsNumber()
  @IsOptional()
  val_taxa_entrega?: number = 0;

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  itens: PedidoItemDto[];
}

// --- DTOs do Admin ---

export class AbrirMesaDto {
  @IsInt()
  @Min(1)
  numMesa: number;
}

export class AdicionarItensDto {
  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  itens: PedidoItemDto[];
}

export class TransferirMesaDto {
  @IsInt()
  @Min(1)
  numMesaDestino: number;
}

export class AtualizarStatusDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

// ==========================================================
// <-- NOVOS DTOS AQUI -->
// ==========================================================

export class JuntarMesasDto {
  @IsInt()
  @IsNotEmpty()
  codseqOrigem: number;

  @IsInt()
  @IsNotEmpty()
  codseqDestino: number;
}

export class FinalizarCaixaDto {
  @IsInt()
  @IsNotEmpty()
  cod_forma_pagto: number;

  @IsInt()
  @IsOptional()
  num_caixa?: number;
}