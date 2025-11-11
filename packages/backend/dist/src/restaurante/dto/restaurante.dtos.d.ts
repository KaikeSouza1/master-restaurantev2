export declare class PedidoItemDto {
    codprod: number;
    descricao: string;
    qtd: number;
    unitario: number;
    obs?: string;
}
export declare class CreatePedidoDto {
    tipo: 'D';
    nome_cli_esp?: string;
    fone_esp?: string;
    cod_endereco?: number;
    val_taxa_entrega?: number;
    itens: PedidoItemDto[];
}
export declare class AbrirMesaDto {
    numMesa: number;
}
export declare class AdicionarItensDto {
    itens: PedidoItemDto[];
}
export declare class TransferirMesaDto {
    numMesaDestino: number;
}
export declare class AtualizarStatusDto {
    status: string;
}
export declare class JuntarMesasDto {
    codseqOrigem: number;
    codseqDestino: number;
}
export declare class FinalizarCaixaDto {
    cod_forma_pagto: number;
    num_caixa?: number;
}
