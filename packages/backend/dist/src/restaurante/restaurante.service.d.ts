import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto, PedidoItemDto } from './dto/restaurante.dtos';
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
        codigo: number;
        nome: string | null;
    }[]>;
    getTodosProdutos(): Promise<{
        grupo: number | null;
        codinterno: Prisma.Decimal;
        descricao: string | null;
        preco: Prisma.Decimal | null;
    }[]>;
    getProductosPorCategoria(categoriaId: number): Promise<{
        codinterno: Prisma.Decimal;
        descricao: string | null;
        preco: Prisma.Decimal | null;
    }[]>;
    criarPedidoDelivery(dto: CreatePedidoDto, user: AuthenticatedUser): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    getKdsOrders(): Promise<({
        quitens: {
            descricao: string | null;
            obs: string | null;
            total: Prisma.Decimal | null;
            qtd: Prisma.Decimal | null;
        }[];
    } & {
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    getFinalizadosOrders(): Promise<({
        quitens: {
            descricao: string | null;
            obs: string | null;
            total: Prisma.Decimal | null;
            qtd: Prisma.Decimal | null;
        }[];
    } & {
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    atualizarStatusKds(codseq: number, novoStatus: string): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    finalizarPedidoNfce(codseq: number): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    getMesasStatus(): Promise<({
        quitens: {
            descricao: string | null;
            codseq: number;
            obs: string | null;
            total: Prisma.Decimal | null;
            qtd: Prisma.Decimal | null;
            unitario: Prisma.Decimal | null;
        }[];
    } & {
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    })[]>;
    abrirMesa(numMesa: number): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    adicionarItensMesa(codseq: number, itens: PedidoItemDto[]): Promise<{
        quitens: {
            descricao: string | null;
            codseq: number;
            obs: string | null;
            total: Prisma.Decimal | null;
            codseq_qu: number | null;
            codprod: Prisma.Decimal | null;
            qtd: Prisma.Decimal | null;
            unitario: Prisma.Decimal | null;
        }[];
    } & {
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    transferirMesa(codseq: number, numMesaDestino: number): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    solicitarFechamento(codseq: number): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
    liberarMesa(codseq: number): Promise<{
        codseq: number;
        tipo: string | null;
        num_quiosque: number | null;
        data_hora_abertura: Date | null;
        vda_finalizada: string | null;
        obs: string | null;
        nome_cli_esp: string | null;
        fone_esp: string | null;
        cod_endereco: number | null;
        val_taxa_entrega: Prisma.Decimal | null;
        sub_total_geral: Prisma.Decimal | null;
        total: Prisma.Decimal | null;
        data_hora_finalizada: Date | null;
        ean: string;
        loja_virtual: boolean | null;
    }>;
}
export {};
