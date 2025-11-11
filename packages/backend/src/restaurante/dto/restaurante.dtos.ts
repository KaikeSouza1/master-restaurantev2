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

// ==========================================================
// DIVISÃO DE CONTA (CONTROLE WEB)
// ==========================================================

export class PagamentoParcialDto {
  @IsInt()
  @Min(1)
  pessoa_numero: number; // Pessoa 1, 2, 3...

  @IsString()
  @IsOptional()
  nome_pessoa?: string; // Ex: "João", "Maria" (opcional)

  @IsNumber()
  @Min(0.01)
  valor_pago: number; // Quanto essa pessoa pagou

  @IsInt()
  forma_pagamento: number; // ID da forma de pagamento (1=Dinheiro, 2=PIX...)
}

export class RegistrarPagamentoParcialDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PagamentoParcialDto)
  pagamentos: PagamentoParcialDto[];
}

// Response do controle de divisão
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
  pode_finalizar: boolean; // true quando total_restante = 0
}

// ==========================================================
// REMOÇÃO DE ITENS
// ==========================================================

export class RemoverItemDto {
  @IsInt()
  @IsNotEmpty()
  codseq_item: number; // ID do item em quitens

  @IsString()
  @IsNotEmpty()
  motivo: string; // Ex: "Cliente desistiu", "Erro no pedido"
}

export class EditarQuantidadeItemDto {
  @IsInt()
  @IsNotEmpty()
  codseq_item: number;

  @IsNumber()
  @Min(0.01)
  nova_quantidade: number;

  @IsString()
  @IsOptional()
  motivo?: string;
}