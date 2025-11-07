// master-restaurante-v2/packages/backend/src/auth/auth.service.ts
import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  /**
   * REGISTRO DE NOVO CLIENTE
   */
  async registrarCliente(dto: RegistrarClienteDto) { // <--- MÉTODO CORRETO
    const clienteExistente = await this.prisma.cliente_loja_virtual.findFirst({
      where: {
        OR: [{ email_clv: dto.email }, { cpf_clv: dto.cpf }],
      },
    });

    if (clienteExistente) {
      throw new ConflictException('Email ou CPF já cadastrado.');
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { acesso_clv, ...resultado } = novoCliente;
    return resultado;
  }

  /**
   * LOGIN UNIFICADO (Cliente ou Admin)
   */
  async login(dto: LoginDto) {
    let user: any;
    let role: 'cliente' | 'admin' = 'cliente';
    
    let userId: number | null = null;
    let userEmail: string | null = null;
    let userName: string | null = null;
    let userPasswordHash: string | null = null;
    
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
    } else {
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
      throw new NotFoundException('Usuário não encontrado.');
    }

    if (!userPasswordHash) {
      throw new UnauthorizedException('Usuário sem credenciais de acesso.');
    }

    const senhaCorreta = await bcrypt.compare(dto.senha, userPasswordHash);

    if (!senhaCorreta) {
      throw new UnauthorizedException('Senha incorreta.');
    }

    const payload = {
      sub: userId!,
      email: userEmail!,
      nome: userName!,
      role: role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}