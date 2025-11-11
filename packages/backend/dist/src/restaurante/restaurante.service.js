"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestauranteService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const library_1 = require("@prisma/client/runtime/library");
let RestauranteService = class RestauranteService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEmpresaInfo() {
        return this.prisma.empresa.findFirst({
            select: {
                nome: true,
                endere: true,
                num: true,
                bairro: true,
                cidade: true,
                estado: true,
                fone: true,
            },
        });
    }
    async getCategorias() {
        return this.prisma.grupo.findMany({
            select: {
                codigo: true,
                nome: true,
            },
            orderBy: [{ seq_loja_virtual: 'asc' }, { nome: 'asc' }],
        });
    }
    async getTodosProdutos() {
        return this.prisma.produtos.findMany({
            where: {
                inativo: null,
            },
            select: {
                codinterno: true,
                descricao: true,
                preco: true,
                grupo: true,
            },
            orderBy: [{ descricao: 'asc' }],
        });
    }
    async getProductosPorCategoria(categoriaId) {
        const id = categoriaId === 0 ? undefined : categoriaId;
        return this.prisma.produtos.findMany({
            where: {
                grupo: id,
                inativo: null,
            },
            select: {
                codinterno: true,
                descricao: true,
                preco: true,
            },
            orderBy: [{ descricao: 'asc' }],
        });
    }
    async criarPedidoDelivery(dto, user) {
        const subTotal = dto.itens.reduce((acc, item) => {
            return acc + (Number(item.unitario) || 0) * (Number(item.qtd) || 0);
        }, 0);
        const taxaEntrega = Number(dto.val_taxa_entrega) || 0;
        const totalGeral = subTotal + taxaEntrega;
        try {
            return await this.prisma.$transaction(async (tx) => {
                const maxQuiosque = await tx.quiosque.aggregate({
                    _max: { codseq: true },
                });
                const proximoCodseqQuiosque = (maxQuiosque._max.codseq || 0) + 1;
                const maxQuitens = await tx.quitens.aggregate({
                    _max: { codseq: true },
                });
                let proximoCodseqQuitens = maxQuitens._max.codseq || 0;
                const novoQuiosque = await tx.quiosque.create({
                    data: {
                        codseq: proximoCodseqQuiosque,
                        tipo: 'D',
                        num_quiosque: null,
                        loja_virtual: true,
                        data_hora_abertura: new Date(),
                        vda_finalizada: 'N',
                        obs: 'NOVO',
                        codcli: user.id,
                        nome_cli_esp: user.nome,
                        fone_esp: dto.fone_esp,
                        cod_endereco: dto.cod_endereco,
                        val_taxa_entrega: taxaEntrega,
                        sub_total_geral: subTotal,
                        total: totalGeral,
                        ean: String(proximoCodseqQuiosque),
                    },
                });
                const itensParaSalvar = dto.itens.map((item) => {
                    proximoCodseqQuitens++;
                    return {
                        codseq: proximoCodseqQuitens,
                        codseq_qu: novoQuiosque.codseq,
                        codprod: item.codprod,
                        descricao: item.descricao,
                        qtd: item.qtd,
                        unitario: item.unitario,
                        total: (Number(item.unitario) || 0) * (Number(item.qtd) || 0),
                        obs: item.obs,
                    };
                });
                await tx.quitens.createMany({
                    data: itensParaSalvar,
                });
                return novoQuiosque;
            });
        }
        catch (error) {
            console.error('Erro ao salvar pedido na transação:', error);
            throw new common_1.InternalServerErrorException(`Erro ao salvar pedido: ${error.message}`);
        }
    }
    async getKdsOrders() {
        return this.prisma.quiosque.findMany({
            where: {
                vda_finalizada: 'N',
            },
            include: {
                quitens: {
                    select: { descricao: true, qtd: true, total: true, obs: true },
                    orderBy: { codseq: 'asc' },
                },
            },
            orderBy: { data_hora_abertura: 'asc' },
        });
    }
    async getFinalizadosOrders() {
        const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
        return this.prisma.quiosque.findMany({
            where: {
                vda_finalizada: 'S',
                data_hora_finalizada: {
                    gte: vinteQuatroHorasAtras,
                },
            },
            include: {
                quitens: {
                    select: { descricao: true, qtd: true, total: true, obs: true },
                },
            },
            orderBy: { data_hora_finalizada: 'desc' },
        });
    }
    async atualizarStatusKds(codseq, novoStatus) {
        const statusValidos = ['NOVO', 'PREPARANDO', 'PRONTO', 'PAGAMENTO'];
        if (!statusValidos.includes(novoStatus.toUpperCase())) {
            throw new common_1.ConflictException('Status inválido.');
        }
        return this.prisma.quiosque.update({
            where: { codseq },
            data: { obs: novoStatus.toUpperCase() },
        });
    }
    async finalizarPedidoNfce(codseq) {
        console.log(`Finalizando pedido ${codseq} para emissor NFCe...`);
        return this.prisma.quiosque.update({
            where: { codseq },
            data: {
                vda_finalizada: 'S',
                data_hora_finalizada: new Date(),
                obs: 'FINALIZADO',
            },
        });
    }
    async getMesasStatus() {
        return this.prisma.quiosque.findMany({
            where: {
                tipo: 'M',
                vda_finalizada: 'N',
            },
            include: {
                quitens: {
                    select: {
                        codseq: true,
                        descricao: true,
                        qtd: true,
                        unitario: true,
                        total: true,
                        obs: true,
                    },
                    orderBy: { codseq: 'asc' },
                },
            },
            orderBy: { num_quiosque: 'asc' },
        });
    }
    async abrirMesa(numMesa) {
        const mesaExistente = await this.prisma.quiosque.findFirst({
            where: {
                num_quiosque: numMesa,
                tipo: 'M',
                vda_finalizada: 'N',
            },
        });
        if (mesaExistente) {
            throw new common_1.ConflictException(`A mesa ${numMesa} já está aberta (Pedido #${mesaExistente.codseq}).`);
        }
        try {
            return await this.prisma.$transaction(async (tx) => {
                const maxQuiosque = await tx.quiosque.aggregate({
                    _max: { codseq: true },
                });
                const proximoCodseqQuiosque = (maxQuiosque._max.codseq || 0) + 1;
                const novaMesa = await tx.quiosque.create({
                    data: {
                        codseq: proximoCodseqQuiosque,
                        tipo: 'M',
                        num_quiosque: numMesa,
                        loja_virtual: true,
                        data_hora_abertura: new Date(),
                        vda_finalizada: 'N',
                        obs: 'NOVO',
                        val_taxa_entrega: 0,
                        sub_total_geral: 0,
                        total: 0,
                        ean: String(proximoCodseqQuiosque),
                    },
                });
                return novaMesa;
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Erro ao abrir mesa: ${error.message}`);
        }
    }
    async adicionarItensMesa(codseq, itens) {
        if (itens.length === 0) {
            throw new common_1.ConflictException('Nenhum item para adicionar.');
        }
        const quiosque = await this.prisma.quiosque.findUnique({
            where: { codseq },
        });
        if (!quiosque) {
            throw new common_1.NotFoundException(`Pedido (Mesa) com ID ${codseq} não encontrado.`);
        }
        if (quiosque.vda_finalizada !== 'N') {
            throw new common_1.ConflictException(`Pedido ${codseq} não está aberto.`);
        }
        const subTotalItensNovos = itens.reduce((acc, item) => {
            return acc + (Number(item.unitario) || 0) * (Number(item.qtd) || 0);
        }, 0);
        try {
            return await this.prisma.$transaction(async (tx) => {
                const maxQuitens = await tx.quitens.aggregate({
                    _max: { codseq: true },
                });
                let proximoCodseqQuitens = maxQuitens._max.codseq || 0;
                const itensParaSalvar = itens.map((item) => {
                    proximoCodseqQuitens++;
                    return {
                        codseq: proximoCodseqQuitens,
                        codseq_qu: codseq,
                        codprod: item.codprod,
                        descricao: item.descricao,
                        qtd: item.qtd,
                        unitario: item.unitario,
                        total: (Number(item.unitario) || 0) * (Number(item.qtd) || 0),
                        obs: item.obs || null,
                    };
                });
                await tx.quitens.createMany({
                    data: itensParaSalvar,
                });
                const subTotalAtual = Number(quiosque.sub_total_geral);
                const totalAtual = Number(quiosque.total);
                const novoSubTotal = subTotalAtual + subTotalItensNovos;
                const novoTotal = totalAtual + subTotalItensNovos;
                const quiosqueAtualizado = await tx.quiosque.update({
                    where: { codseq: codseq },
                    data: {
                        sub_total_geral: new library_1.Decimal(novoSubTotal.toFixed(2)),
                        total: new library_1.Decimal(novoTotal.toFixed(2)),
                        obs: 'NOVO',
                    },
                    include: { quitens: true },
                });
                return quiosqueAtualizado;
            });
        }
        catch (error) {
            throw new common_1.InternalServerErrorException(`Erro ao salvar itens: ${error.message}`);
        }
    }
    async transferirMesa(codseq, numMesaDestino) {
        const mesaOrigem = await this.prisma.quiosque.findUnique({
            where: { codseq },
        });
        if (!mesaOrigem || mesaOrigem.vda_finalizada !== 'N') {
            throw new common_1.NotFoundException(`Mesa de origem (Pedido #${codseq}) não está aberta.`);
        }
        const mesaDestinoOcupada = await this.prisma.quiosque.findFirst({
            where: {
                num_quiosque: numMesaDestino,
                tipo: 'M',
                vda_finalizada: 'N',
            },
        });
        if (mesaDestinoOcupada) {
            throw new common_1.ConflictException(`Mesa de destino ${numMesaDestino} já está ocupada (Pedido #${mesaDestinoOcupada.codseq}).`);
        }
        return this.prisma.quiosque.update({
            where: { codseq },
            data: {
                num_quiosque: numMesaDestino,
            },
        });
    }
    async solicitarFechamento(codseq) {
        return this.prisma.quiosque.update({
            where: { codseq },
            data: { obs: 'PAGAMENTO' },
        });
    }
    async liberarMesa(codseq) {
        return this.finalizarPedidoNfce(codseq);
    }
};
exports.RestauranteService = RestauranteService;
exports.RestauranteService = RestauranteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RestauranteService);
//# sourceMappingURL=restaurante.service.js.map