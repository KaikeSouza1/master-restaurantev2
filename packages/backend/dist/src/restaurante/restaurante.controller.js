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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RestauranteController = void 0;
const common_1 = require("@nestjs/common");
const restaurante_service_1 = require("./restaurante.service");
const restaurante_dtos_1 = require("./dto/restaurante.dtos");
const auth_guard_1 = require("../auth/auth.guard");
let RestauranteController = class RestauranteController {
    restauranteService;
    constructor(restauranteService) {
        this.restauranteService = restauranteService;
    }
    async getEmpresaInfo() {
        return this.restauranteService.getEmpresaInfo();
    }
    async getCategorias() {
        return this.restauranteService.getCategorias();
    }
    async getTodosProdutos() {
        return this.restauranteService.getTodosProdutos();
    }
    async getProdutosPorCategoria(categoriaId) {
        return this.restauranteService.getProductosPorCategoria(categoriaId);
    }
    async criarPedidoDelivery(pedidoDto, req) {
        const user = req.user;
        return this.restauranteService.criarPedidoDelivery(pedidoDto, user);
    }
    async listarPedidosKds() {
        return this.restauranteService.getKdsOrders();
    }
    async listarPedidosFinalizados() {
        return this.restauranteService.getFinalizadosOrders();
    }
    async atualizarStatusKds(codseq, dto) {
        return this.restauranteService.atualizarStatusKds(codseq, dto.status);
    }
    async finalizarNfce(codseq) {
        return this.restauranteService.finalizarPedidoNfce(codseq);
    }
    async getMesasStatus() {
        return this.restauranteService.getMesasStatus();
    }
    async abrirMesa(dto) {
        return this.restauranteService.abrirMesa(dto.numMesa);
    }
    async adicionarItensMesa(codseq, dto) {
        return this.restauranteService.adicionarItensMesa(codseq, dto.itens);
    }
    async transferirMesa(codseq, dto) {
        return this.restauranteService.transferirMesa(codseq, dto.numMesaDestino);
    }
    async solicitarFechamento(codseq) {
        return this.restauranteService.solicitarFechamento(codseq);
    }
    async liberarMesa(codseq) {
        return this.restauranteService.liberarMesa(codseq);
    }
    async juntarMesas(dto) {
        return this.restauranteService.juntarMesas(dto);
    }
    async finalizarMesaCaixa(codseq, dto, req) {
        const user = req.user;
        return this.restauranteService.finalizarMesaCaixa(codseq, dto, user);
    }
    async removerItemMesa(codseq, codseqItem, motivo) {
        return this.restauranteService.removerItem(codseq, codseqItem, motivo);
    }
    async editarQuantidadeItem(codseq, codseqItem, body) {
        if (!body.nova_quantidade || body.nova_quantidade <= 0) {
            throw new common_1.ConflictException('Quantidade deve ser maior que zero');
        }
        return this.restauranteService.editarQuantidadeItem(codseq, codseqItem, body.nova_quantidade, body.motivo);
    }
    async calcularDivisao(codseq, body) {
        return this.restauranteService.calcularDivisaoSimplificada(codseq, body.num_pessoas, body.itens_por_pessoa);
    }
    async obterStatusDivisao(codseq) {
        return this.restauranteService.obterStatusDivisao(codseq);
    }
    async registrarPagamentoParcial(codseq, body) {
        return this.restauranteService.registrarPagamentoParcial(codseq, [body]);
    }
    async finalizarPedidoDividido(codseq) {
        return this.restauranteService.finalizarPedidoDividido(codseq);
    }
};
exports.RestauranteController = RestauranteController;
__decorate([
    (0, common_1.Get)('empresa'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "getEmpresaInfo", null);
__decorate([
    (0, common_1.Get)('categorias'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "getCategorias", null);
__decorate([
    (0, common_1.Get)('produtos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "getTodosProdutos", null);
__decorate([
    (0, common_1.Get)('produtos/:categoriaId'),
    __param(0, (0, common_1.Param)('categoriaId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "getProdutosPorCategoria", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.JwtAuthGuard),
    (0, common_1.Post)('pedidos/delivery'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [restaurante_dtos_1.CreatePedidoDto, Object]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "criarPedidoDelivery", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('admin/kds'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "listarPedidosKds", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('admin/kds/finalizados'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "listarPedidosFinalizados", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/kds/status/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, restaurante_dtos_1.AtualizarStatusDto]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "atualizarStatusKds", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/kds/finalizar/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "finalizarNfce", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('admin/mesas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "getMesasStatus", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('admin/mesas/abrir'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [restaurante_dtos_1.AbrirMesaDto]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "abrirMesa", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('admin/mesas/adicionar/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, restaurante_dtos_1.AdicionarItensDto]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "adicionarItensMesa", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/mesas/transferir/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, restaurante_dtos_1.TransferirMesaDto]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "transferirMesa", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/mesas/fechar/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "solicitarFechamento", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/mesas/liberar/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "liberarMesa", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/mesas/juntar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [restaurante_dtos_1.JuntarMesasDto]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "juntarMesas", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/mesas/finalizar-caixa/:codseq'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, restaurante_dtos_1.FinalizarCaixaDto, Object]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "finalizarMesaCaixa", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Delete)('admin/mesas/:codseq/itens/:codseqItem'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('codseqItem', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)('motivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "removerItemMesa", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Patch)('admin/mesas/:codseq/itens/:codseqItem/quantidade'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('codseqItem', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "editarQuantidadeItem", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('admin/mesas/:codseq/calcular-divisao'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "calcularDivisao", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Get)('admin/mesas/:codseq/divisao-status'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "obterStatusDivisao", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('admin/mesas/:codseq/registrar-pagamento-parcial'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "registrarPagamentoParcial", null);
__decorate([
    (0, common_1.UseGuards)(auth_guard_1.AdminAuthGuard),
    (0, common_1.Post)('admin/mesas/:codseq/finalizar-dividido'),
    __param(0, (0, common_1.Param)('codseq', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], RestauranteController.prototype, "finalizarPedidoDividido", null);
exports.RestauranteController = RestauranteController = __decorate([
    (0, common_1.Controller)('restaurante'),
    __metadata("design:paramtypes", [restaurante_service_1.RestauranteService])
], RestauranteController);
//# sourceMappingURL=restaurante.controller.js.map