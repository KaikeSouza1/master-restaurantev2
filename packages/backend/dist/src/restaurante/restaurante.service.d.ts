import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto, JuntarMesasDto, PedidoItemDto, FinalizarCaixaDto } from './dto/restaurante.dtos';
import { Prisma } from '@prisma/client';
interface AuthenticatedUser {
    id: number;
    email: string;
    role: 'admin' | 'cliente';
    nome: string;
}
export declare class RestauranteService {
    private prisma;
    constructor(prisma: PrismaService);
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
        codinterno: Prisma.Decimal;
        preco: Prisma.Decimal | null;
    }[]>;
    getProductosPorCategoria(categoriaId: number): Promise<{
        descricao: string | null;
        codinterno: Prisma.Decimal;
        preco: Prisma.Decimal | null;
    }[]>;
    criarPedidoDelivery(dto: CreatePedidoDto, user: AuthenticatedUser): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    getKdsOrders(): Promise<({
        quitens: {
            descricao: string | null;
            qtd: Prisma.Decimal | null;
            obs: string | null;
            total: Prisma.Decimal | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    getFinalizadosOrders(): Promise<({
        quitens: {
            descricao: string | null;
            qtd: Prisma.Decimal | null;
            obs: string | null;
            total: Prisma.Decimal | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    atualizarStatusKds(codseq: number, novoStatus: string): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    finalizarPedidoNfce(codseq: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    } | null>;
    private calcularTotais;
    getMesasStatus(): Promise<({
        quitens: {
            descricao: string | null;
            qtd: Prisma.Decimal | null;
            unitario: Prisma.Decimal | null;
            obs: string | null;
            codseq: number;
            total: Prisma.Decimal | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    abrirMesa(numMesa: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    adicionarItensMesa(codseq: number, itens: PedidoItemDto[]): Promise<({
        quitens: {
            codprod: Prisma.Decimal | null;
            descricao: string | null;
            qtd: Prisma.Decimal | null;
            unitario: Prisma.Decimal | null;
            obs: string | null;
            codseq: number;
            total: Prisma.Decimal | null;
            codseq_qu: number | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }) | null>;
    transferirMesa(codseq: number, numMesaDestino: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
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
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
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
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    } | null>;
    juntarMesas(dto: JuntarMesasDto): Promise<({
        quitens: {
            codprod: Prisma.Decimal | null;
            descricao: string | null;
            qtd: Prisma.Decimal | null;
            unitario: Prisma.Decimal | null;
            obs: string | null;
            codseq: number;
            total: Prisma.Decimal | null;
            codseq_qu: number | null;
        }[];
    } & {
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }) | null>;
    finalizarMesaCaixa(codseq: number, dto: FinalizarCaixaDto, user: AuthenticatedUser): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    removerItem(codseq: number, codseqItem: number, motivo?: string): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    editarQuantidadeItem(codseq: number, codseqItem: number, novaQtd: number, motivo?: string): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    calcularDivisaoSimplificada(codseq: number, numPessoas: number, itensPorPessoa: Array<{
        codseq_item: number;
        pessoa: number;
    }>): Promise<{
        codseq: number;
        total_conta: number;
        num_pessoas: number;
        divisao: Record<number, {
            itens: any[];
            total: number;
        }>;
    }>;
    registrarPagamentoParcial(codseq: number, pagamentos: Array<{
        pessoa_numero: number;
        nome_pessoa?: string;
        valor_pago: number;
        forma_pagamento: number;
    }>): Promise<{
        codseq: number;
        total_conta: number;
        total_pago: any;
        total_restante: number;
        pagamentos: any[];
        pode_finalizar: boolean;
    }>;
    obterStatusDivisao(codseq: number): Promise<{
        codseq: number;
        total_conta: number;
        total_pago: any;
        total_restante: number;
        pagamentos: any[];
        pode_finalizar: boolean;
    }>;
    private extrairPagamentos;
    finalizarPedidoDividido(codseq: number): Promise<{
        obs: string | null;
        tipo: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        codseq: number;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    } | null>;
}
export {};
