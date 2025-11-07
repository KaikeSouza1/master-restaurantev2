import { RestauranteService } from './restaurante.service';
import { CreatePedidoDto, AbrirMesaDto, AdicionarItensDto, TransferirMesaDto, AtualizarStatusDto } from './dto/restaurante.dtos';
import type { Request } from 'express';
export declare class RestauranteController {
    private readonly restauranteService;
    constructor(restauranteService: RestauranteService);
    getEmpresaInfo(): Promise<{
        nome: string | null;
        endere: string | null;
        num: number | null;
        bairro: string | null;
        cidade: string | null;
        estado: string | null;
        fone: string | null;
    } | null>;
    getCategorias(): Promise<{
        nome: string | null;
        codigo: number;
    }[]>;
    getTodosProdutos(): Promise<{
        grupo: number | null;
        descricao: string | null;
        codinterno: import("@prisma/client/runtime/library").Decimal;
        preco: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    getProdutosPorCategoria(categoriaId: number): Promise<{
        descricao: string | null;
        codinterno: import("@prisma/client/runtime/library").Decimal;
        preco: import("@prisma/client/runtime/library").Decimal | null;
    }[]>;
    criarPedidoDelivery(pedidoDto: CreatePedidoDto, req: Request): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    listarPedidosKds(): Promise<({
        quitens: {
            descricao: string | null;
            qtd: import("@prisma/client/runtime/library").Decimal | null;
            obs: string | null;
            total: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    listarPedidosFinalizados(): Promise<({
        quitens: {
            descricao: string | null;
            qtd: import("@prisma/client/runtime/library").Decimal | null;
            obs: string | null;
            total: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    atualizarStatusKds(codseq: number, dto: AtualizarStatusDto): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    finalizarNfce(codseq: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    getMesasStatus(): Promise<({
        quitens: {
            descricao: string | null;
            qtd: import("@prisma/client/runtime/library").Decimal | null;
            unitario: import("@prisma/client/runtime/library").Decimal | null;
            obs: string | null;
            codseq: number;
            total: import("@prisma/client/runtime/library").Decimal | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    abrirMesa(dto: AbrirMesaDto): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    adicionarItensMesa(codseq: number, dto: AdicionarItensDto): Promise<{
        quitens: {
            codprod: import("@prisma/client/runtime/library").Decimal | null;
            descricao: string | null;
            qtd: import("@prisma/client/runtime/library").Decimal | null;
            unitario: import("@prisma/client/runtime/library").Decimal | null;
            obs: string | null;
            codseq: number;
            total: import("@prisma/client/runtime/library").Decimal | null;
            codseq_qu: number | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    transferirMesa(codseq: number, dto: TransferirMesaDto): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    solicitarFechamento(codseq: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    liberarMesa(codseq: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: import("@prisma/client/runtime/library").Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: import("@prisma/client/runtime/library").Decimal | null;
        total: import("@prisma/client/runtime/library").Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
}
