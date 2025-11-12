// master-restaurante-v2/packages/backend/src/prisma/prisma.module.ts

import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Exporta o serviço para ser usado em outros módulos
})
export class PrismaModule {} //// 