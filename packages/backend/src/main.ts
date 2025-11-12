// packages/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita o CORS (importante para Vercel)
  app.enableCors({
    origin: '*', // Você pode restringir isso para o seu domínio Vercel depois
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Adiciona o prefixo global que seu frontend espera
  app.setGlobalPrefix('api');
  
  // Inicializa o app, mas não "escuta"
  await app.init();
  return app;
}

// Exporta o manipulador serverless
let cachedApp;
export default async (req, res) => {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  const httpAdapter = cachedApp.getHttpAdapter();
  httpAdapter.getInstance()(req, res);
};