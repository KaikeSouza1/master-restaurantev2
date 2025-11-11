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
exports.FinalizarCaixaDto = exports.JuntarMesasDto = exports.AtualizarStatusDto = exports.TransferirMesaDto = exports.AdicionarItensDto = exports.AbrirMesaDto = exports.CreatePedidoDto = exports.PedidoItemDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
class PedidoItemDto {
    codprod;
    descricao;
    qtd;
    unitario;
    obs;
}
exports.PedidoItemDto = PedidoItemDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], PedidoItemDto.prototype, "codprod", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], PedidoItemDto.prototype, "descricao", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0.01),
    __metadata("design:type", Number)
], PedidoItemDto.prototype, "qtd", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], PedidoItemDto.prototype, "unitario", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PedidoItemDto.prototype, "obs", void 0);
class CreatePedidoDto {
    tipo;
    nome_cli_esp;
    fone_esp;
    cod_endereco;
    val_taxa_entrega = 0;
    itens;
}
exports.CreatePedidoDto = CreatePedidoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "tipo", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "nome_cli_esp", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreatePedidoDto.prototype, "fone_esp", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "cod_endereco", void 0);
__decorate([
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], CreatePedidoDto.prototype, "val_taxa_entrega", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PedidoItemDto),
    __metadata("design:type", Array)
], CreatePedidoDto.prototype, "itens", void 0);
class AbrirMesaDto {
    numMesa;
}
exports.AbrirMesaDto = AbrirMesaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], AbrirMesaDto.prototype, "numMesa", void 0);
class AdicionarItensDto {
    itens;
}
exports.AdicionarItensDto = AdicionarItensDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => PedidoItemDto),
    __metadata("design:type", Array)
], AdicionarItensDto.prototype, "itens", void 0);
class TransferirMesaDto {
    numMesaDestino;
}
exports.TransferirMesaDto = TransferirMesaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], TransferirMesaDto.prototype, "numMesaDestino", void 0);
class AtualizarStatusDto {
    status;
}
exports.AtualizarStatusDto = AtualizarStatusDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AtualizarStatusDto.prototype, "status", void 0);
class JuntarMesasDto {
    codseqOrigem;
    codseqDestino;
}
exports.JuntarMesasDto = JuntarMesasDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], JuntarMesasDto.prototype, "codseqOrigem", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], JuntarMesasDto.prototype, "codseqDestino", void 0);
class FinalizarCaixaDto {
    cod_forma_pagto;
    num_caixa;
}
exports.FinalizarCaixaDto = FinalizarCaixaDto;
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", Number)
], FinalizarCaixaDto.prototype, "cod_forma_pagto", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], FinalizarCaixaDto.prototype, "num_caixa", void 0);
//# sourceMappingURL=restaurante.dtos.js.map