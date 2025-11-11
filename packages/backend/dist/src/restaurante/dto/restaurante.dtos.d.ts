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
export declare class PagamentoParcialDto {
    pessoa_numero: number;
    nome_pessoa?: string;
    valor_pago: number;
    forma_pagamento: number;
}
export declare class RegistrarPagamentoParcialDto {
    pagamentos: PagamentoParcialDto[];
}
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
export declare class RemoverItemDto {
    codseq_item: number;
    motivo: string;
}
export declare class EditarQuantidadeItemDto {
    codseq_item: number;
    nova_quantidade: number;
    motivo?: string;
}
