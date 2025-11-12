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
        const result = await this.prisma.quiosque.updateMany({
            where: { codseq: codseq, vda_finalizada: 'N' },
            data: {
                vda_finalizada: 'S',
                data_hora_finalizada: new Date(),
                obs: 'FINALIZADO',
            },
        });
        if (result.count === 0) {
            console.warn(`Pedido ${codseq} já estava finalizado ou não foi encontrado.`);
        }
        return this.prisma.quiosque.findUnique({ where: { codseq } });
    }
    async calcularTotais(codseq, tx) {
        const totalItens = await tx.quitens.aggregate({
            _sum: {
                total: true,
            },
            where: {
                codseq_qu: codseq,
            },
        });
        const subTotal = totalItens._sum.total || new library_1.Decimal(0);
        const pedido = await tx.quiosque.findUnique({
            where: { codseq },
            select: { val_taxa_entrega: true },
        });
        const taxaEntrega = new library_1.Decimal(pedido?.val_taxa_entrega || 0);
        const totalGeral = subTotal.plus(taxaEntrega);
        return tx.quiosque.update({
            where: { codseq },
            data: {
                sub_total_geral: subTotal,
                total: totalGeral,
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
                await this.calcularTotais(codseq, tx);
                await tx.quiosque.update({
                    where: { codseq },
                    data: { obs: 'NOVO' },
                });
                return tx.quiosque.findUnique({
                    where: { codseq },
                    include: { quitens: true },
                });
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
    async juntarMesas(dto) {
        const { codseqOrigem, codseqDestino } = dto;
        if (codseqOrigem === codseqDestino) {
            throw new common_1.HttpException('Mesa de origem e destino não podem ser iguais', common_1.HttpStatus.BAD_REQUEST);
        }
        return this.prisma.$transaction(async (tx) => {
            const mesaOrigem = await tx.quiosque.findFirst({
                where: { codseq: codseqOrigem, vda_finalizada: 'N' },
            });
            const mesaDestino = await tx.quiosque.findFirst({
                where: { codseq: codseqDestino, vda_finalizada: 'N' },
            });
            if (!mesaOrigem) {
                throw new common_1.NotFoundException(`Mesa de origem #${codseqOrigem} não encontrada ou já finalizada.`);
            }
            if (!mesaDestino) {
                throw new common_1.NotFoundException(`Mesa de destino #${codseqDestino} não encontrada ou já finalizada.`);
            }
            if (mesaDestino.obs === 'PAGAMENTO') {
                throw new common_1.ConflictException(`Mesa de destino #${mesaDestino.num_quiosque} já está em pagamento e não pode ser juntada.`);
            }
            await tx.quitens.updateMany({
                where: {
                    codseq_qu: codseqOrigem,
                },
                data: {
                    codseq_qu: codseqDestino,
                },
            });
            const mesaDestinoAtualizada = await this.calcularTotais(codseqDestino, tx);
            await tx.quiosque.update({
                where: { codseq: codseqOrigem },
                data: {
                    vda_finalizada: 'S',
                    obs: `JUNTO COM MESA ${mesaDestino.num_quiosque} (Pedido #${codseqDestino})`,
                    sub_total_geral: 0,
                    total: 0,
                    data_hora_finalizada: new Date(),
                },
            });
            return tx.quiosque.findUnique({
                where: { codseq: mesaDestinoAtualizada.codseq },
                include: {
                    quitens: {
                        orderBy: {
                            codseq: 'asc',
                        },
                    },
                },
            });
        });
    }
    async finalizarMesaCaixa(codseq, dto, user) {
        const agora = new Date();
        const timeZone = 'America/Sao_Paulo';
        const formatadorData = new Intl.DateTimeFormat('en-CA', {
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const dataBrasil = formatadorData.format(agora);
        const formatadorPartes = new Intl.DateTimeFormat('en-US', {
            timeZone,
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hourCycle: 'h23',
        });
        const partes = formatadorPartes.formatToParts(agora).reduce((acc, part) => {
            acc[part.type] = part.value;
            return acc;
        }, {});
        const horaBrasilComoObjetoDate = new Date(Date.UTC(1970, 0, 1, parseInt(partes.hour, 10), parseInt(partes.minute, 10), parseInt(partes.second, 10)));
        return this.prisma.$transaction(async (tx) => {
            const mesa = await tx.quiosque.findFirst({
                where: {
                    codseq: codseq,
                    vda_finalizada: 'N',
                },
            });
            if (!mesa) {
                throw new common_1.NotFoundException(`Mesa (Pedido #${codseq}) não encontrada ou já está finalizada.`);
            }
            if (mesa.obs !== 'PAGAMENTO') {
                throw new common_1.ConflictException(`Mesa #${mesa.num_quiosque} precisa estar com o status 'PAGAMENTO' para ser finalizada no caixa.`);
            }
            const maxCaixa = await tx.caixa.aggregate({
                _max: { codseq: true },
            });
            const proximoCodseqCaixa = (maxCaixa._max.codseq || 0) + 1;
            await tx.caixa.create({
                data: {
                    codseq: proximoCodseqCaixa,
                    datai: new Date(dataBrasil),
                    historico: `VENDA MESA ${mesa.num_quiosque} (PEDIDO #${mesa.codseq})`,
                    debito: 0,
                    credito: mesa.total,
                    acumular: 'S',
                    tipo: 'VENDA',
                    num_caixa: dto.num_caixa || 1,
                    cod_forma_pagto: dto.cod_forma_pagto,
                    codven: mesa.codseq,
                    hora_inclusao: horaBrasilComoObjetoDate,
                    data_i: new Date(dataBrasil),
                    hora_i: horaBrasilComoObjetoDate,
                    id_user_gpw: user.id,
                    caixa_aberto: true,
                },
            });
            const mesaFinalizada = await tx.quiosque.update({
                where: { codseq: codseq },
                data: {
                    vda_finalizada: 'S',
                    data_hora_finalizada: new Date(),
                    obs: 'FINALIZADO (CAIXA)',
                },
            });
            return mesaFinalizada;
        });
    }
    async removerItem(codseq, codseqItem, motivo) {
        return this.prisma.$transaction(async (tx) => {
            const pedido = await tx.quiosque.findUnique({
                where: { codseq },
                include: { quitens: true },
            });
            if (!pedido) {
                throw new common_1.NotFoundException(`Pedido ${codseq} não encontrado`);
            }
            if (pedido.vda_finalizada === 'S') {
                throw new common_1.ConflictException('Não é possível remover itens de pedidos finalizados');
            }
            if (pedido.obs === 'PAGAMENTO') {
                throw new common_1.ConflictException('Mesa em pagamento. Reabra para editar.');
            }
            const item = await tx.quitens.findUnique({
                where: { codseq: codseqItem },
            });
            if (!item || item.codseq_qu !== codseq) {
                throw new common_1.NotFoundException('Item não encontrado');
            }
            await tx.quitens.delete({
                where: { codseq: codseqItem },
            });
            const pedidoAtualizado = await this.calcularTotais(codseq, tx);
            if (motivo) {
                const dataHora = new Date().toLocaleString('pt-BR');
                const logRemocao = `\n[${dataHora}] REMOVIDO: ${item.qtd}x ${item.descricao} - ${motivo}`;
                await tx.quiosque.update({
                    where: { codseq },
                    data: {
                        obs: (pedido.obs || '') + logRemocao,
                    },
                });
            }
            return pedidoAtualizado;
        });
    }
    async editarQuantidadeItem(codseq, codseqItem, novaQtd, motivo) {
        return this.prisma.$transaction(async (tx) => {
            const pedido = await tx.quiosque.findUnique({ where: { codseq } });
            if (!pedido) {
                throw new common_1.NotFoundException('Pedido não encontrado');
            }
            if (pedido.vda_finalizada === 'S') {
                throw new common_1.ConflictException('Não é possível editar pedidos finalizados');
            }
            if (pedido.obs === 'PAGAMENTO') {
                throw new common_1.ConflictException('Pedido em pagamento. Reabra para editar.');
            }
            if (novaQtd <= 0) {
                throw new common_1.ConflictException('A nova quantidade deve ser maior que zero. Para remover, use a função de remoção.');
            }
            const item = await tx.quitens.findUnique({
                where: { codseq: codseqItem },
            });
            if (!item || item.codseq_qu !== codseq) {
                throw new common_1.NotFoundException('Item não encontrado');
            }
            const novoTotal = Number(item.unitario) * novaQtd;
            await tx.quitens.update({
                where: { codseq: codseqItem },
                data: {
                    qtd: novaQtd,
                    total: novoTotal,
                },
            });
            const pedidoAtualizado = await this.calcularTotais(codseq, tx);
            if (motivo) {
                const dataHora = new Date().toLocaleString('pt-BR');
                const logEdicao = `\n[${dataHora}] EDITADO: ${item.descricao} de ${item.qtd}x para ${novaQtd}x - ${motivo}`;
                await tx.quiosque.update({
                    where: { codseq },
                    data: {
                        obs: (pedido.obs || '') + logEdicao,
                    },
                });
            }
            return pedidoAtualizado;
        });
    }
    async calcularDivisaoSimplificada(codseq, numPessoas, itensPorPessoa) {
        const pedido = await this.prisma.quiosque.findUnique({
            where: { codseq },
            include: { quitens: true },
        });
        if (!pedido) {
            throw new common_1.NotFoundException('Pedido não encontrado');
        }
        if (pedido.obs !== 'PAGAMENTO') {
            throw new common_1.ConflictException('Mesa precisa estar em PAGAMENTO');
        }
        const divisao = {};
        for (let i = 1; i <= numPessoas; i++) {
            divisao[i] = { itens: [], total: 0 };
        }
        for (const itemDiv of itensPorPessoa) {
            const item = pedido.quitens.find((q) => q.codseq === itemDiv.codseq_item);
            if (item) {
                divisao[itemDiv.pessoa].itens.push({
                    descricao: item.descricao,
                    qtd: item.qtd,
                    total: Number(item.total),
                });
                divisao[itemDiv.pessoa].total += Number(item.total);
            }
        }
        return {
            codseq,
            total_conta: Number(pedido.total),
            num_pessoas: numPessoas,
            divisao,
        };
    }
    async registrarPagamentoParcial(codseq, pagamentos) {
        return this.prisma.$transaction(async (tx) => {
            const pedido = await tx.quiosque.findUnique({
                where: { codseq },
            });
            if (!pedido) {
                throw new common_1.NotFoundException('Pedido não encontrado');
            }
            if (pedido.obs !== 'PAGAMENTO') {
                throw new common_1.ConflictException('Pedido precisa estar em PAGAMENTO para dividir conta');
            }
            const pagamentosAnteriores = this.extrairPagamentos(pedido.obs || '');
            const novosPagamentos = [
                ...pagamentosAnteriores,
                ...pagamentos.map((p) => ({
                    ...p,
                    data_hora: new Date().toISOString(),
                })),
            ];
            const totalPago = novosPagamentos.reduce((acc, p) => acc + p.valor_pago, 0);
            const totalRestante = Number(pedido.total) - totalPago;
            const obsAtualizada = `DIVISAO_CONTA:${JSON.stringify(novosPagamentos)}`;
            await tx.quiosque.update({
                where: { codseq },
                data: { obs: obsAtualizada },
            });
            return {
                codseq,
                total_conta: Number(pedido.total),
                total_pago: totalPago,
                total_restante: totalRestante,
                pagamentos: novosPagamentos,
                pode_finalizar: totalRestante <= 0.01,
            };
        });
    }
    async obterStatusDivisao(codseq) {
        const pedido = await this.prisma.quiosque.findUnique({
            where: { codseq },
        });
        if (!pedido) {
            throw new common_1.NotFoundException('Pedido não encontrado');
        }
        const pagamentos = this.extrairPagamentos(pedido.obs || '');
        const totalPago = pagamentos.reduce((acc, p) => acc + p.valor_pago, 0);
        const totalRestante = Number(pedido.total) - totalPago;
        return {
            codseq,
            total_conta: Number(pedido.total),
            total_pago: totalPago,
            total_restante: totalRestante,
            pagamentos,
            pode_finalizar: totalRestante <= 0.01,
        };
    }
    extrairPagamentos(obs) {
        if (!obs.startsWith('DIVISAO_CONTA:')) {
            return [];
        }
        try {
            const jsonStr = obs.replace('DIVISAO_CONTA:', '');
            return JSON.parse(jsonStr);
        }
        catch {
            return [];
        }
    }
    async finalizarPedidoDividido(codseq) {
        const status = await this.obterStatusDivisao(codseq);
        if (!status.pode_finalizar) {
            throw new common_1.ConflictException(`Ainda falta pagar ${formatCurrency(status.total_restante)}. Não é possível finalizar.`);
        }
        await this.prisma.quiosque.update({
            where: { codseq },
            data: { obs: 'FINALIZADO (DIVIDIDO)' },
        });
        return this.finalizarPedidoNfce(codseq);
    }
};
exports.RestauranteService = RestauranteService;
exports.RestauranteService = RestauranteService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RestauranteService);
function formatCurrency(value) {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
}
//# sourceMappingURL=restaurante.service.js.map