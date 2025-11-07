// master-restaurante-v2/packages/backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RestauranteModule } from './restaurante/restaurante.module';

@Module({
  imports: [PrismaModule, AuthModule, RestauranteModule], 
  controllers: [],
  providers: [],
})
export class AppModule {}