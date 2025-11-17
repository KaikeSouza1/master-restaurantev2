// packages/backend/src/main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Definir a porta padrão para o ambiente local
const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Habilita o CORS (Importante para Vercel/Local)
  app.enableCors({
    origin: '*', // Mantém o '*' para desenvolvimento local
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  // Adiciona o prefixo global que seu frontend espera
  app.setGlobalPrefix('api');
  
  // Inicia o app no modo de servidor tradicional
  await app.listen(PORT);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

// Executar a função de bootstrap para iniciar o servidor local
bootstrap();