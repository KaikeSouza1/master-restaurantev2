"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
const jwt_1 = require("@nestjs/jwt");
let AuthService = class AuthService {
    prisma;
    jwtService;
    constructor(prisma, jwtService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
    }
    async registrarCliente(dto) {
        const clienteExistente = await this.prisma.cliente_loja_virtual.findFirst({
            where: {
                OR: [{ email_clv: dto.email }, { cpf_clv: dto.cpf }],
            },
        });
        if (clienteExistente) {
            throw new common_1.ConflictException('Email ou CPF já cadastrado.');
        }
        const salt = await bcrypt.genSalt();
        const hashSenha = await bcrypt.hash(dto.senha, salt);
        const maxCodseq = await this.prisma.cliente_loja_virtual.aggregate({
            _max: { codseq_clv: true },
        });
        const proximoCodseq = (maxCodseq._max.codseq_clv || 0) + 1;
        const novoCliente = await this.prisma.cliente_loja_virtual.create({
            data: {
                codseq_clv: proximoCodseq,
                nome_clv: dto.nome,
                email_clv: dto.email,
                cpf_clv: dto.cpf,
                telefone1_clv: dto.telefone,
                acesso_clv: hashSenha,
                tipo_pessoa_clv: dto.cpf.length > 11 ? 'PJ' : 'PF',
            },
        });
        const { acesso_clv, ...resultado } = novoCliente;
        return resultado;
    }
    async login(dto) {
        let user;
        let role = 'cliente';
        let userId = null;
        let userEmail = null;
        let userName = null;
        let userPasswordHash = null;
        user = await this.prisma.cliente_loja_virtual.findFirst({
            where: {
                OR: [{ email_clv: dto.login }, { cpf_clv: dto.login }],
            },
        });
        if (user) {
            userId = user.codseq_clv;
            userEmail = user.email_clv;
            userName = user.nome_clv;
            userPasswordHash = user.acesso_clv;
            role = 'cliente';
        }
        else {
            user = await this.prisma.adminUser.findUnique({
                where: { email: dto.login },
            });
            if (user) {
                userId = user.id;
                userEmail = user.email;
                userName = user.nome;
                userPasswordHash = user.password;
                role = 'admin';
            }
        }
        if (!user) {
            throw new common_1.NotFoundException('Usuário não encontrado.');
        }
        if (!userPasswordHash) {
            throw new common_1.UnauthorizedException('Usuário sem credenciais de acesso.');
        }
        const senhaCorreta = await bcrypt.compare(dto.senha, userPasswordHash);
        if (!senhaCorreta) {
            throw new common_1.UnauthorizedException('Senha incorreta.');
        }
        const payload = {
            sub: userId,
            email: userEmail,
            nome: userName,
            role: role,
        };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map