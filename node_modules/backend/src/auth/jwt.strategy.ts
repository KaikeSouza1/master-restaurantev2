// master-restaurante-v2/packages/backend/src/auth/jwt.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt'; // Adiciona StrategyOptions
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    
    // CORREÇÃO TS2345: Força a verificação do .env
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET environment variable is not defined.');
    }
    
    const options: StrategyOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        ignoreExpiration: false,
        secretOrKey: secret, 
    };

    super(options);
  }

  // O que for retornado aqui será injetado no req.user das rotas protegidas
  async validate(payload: { sub: number; email: string; role: string; nome: string }) {
    if (payload.role === 'admin') {
      const user = await this.prisma.adminUser.findUnique({ where: { id: payload.sub }});
      if (!user) {
        throw new UnauthorizedException('Usuário admin não encontrado');
      }
    } else if (payload.role === 'cliente') {
      const user = await this.prisma.cliente_loja_virtual.findUnique({ where: { codseq_clv: payload.sub }});
      if (!user) {
        throw new UnauthorizedException('Usuário cliente não encontrado');
      }
    }
    
    // Retorna o payload para ser injetado em req.user
    return { id: payload.sub, email: payload.email, role: payload.role, nome: payload.nome };
  }
}