import { Module } from '@nestjs/common';
import { RestauranteService } from './restaurante.service';
import { RestauranteController } from './restaurante.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthModule } from 'src/auth/auth.module'; // Importa AuthModule

@Module({
  imports: [PrismaModule, AuthModule], // Adiciona AuthModule aqui
  providers: [RestauranteService],
  controllers: [RestauranteController],
})
export class RestauranteModule {}