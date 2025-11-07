import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DecimalToNumberInterceptor } from './utils/decimal-to-number.interceptor'; // Importação

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilita o CORS para o frontend (http://localhost:5173)
  app.enableCors({
    origin: '*', // Em produção, mude para o seu domínio: 'http://localhost:5173'
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  // Habilita validação global de DTOs
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));
  
  // APLICAÇÃO DO INTERCEPTOR GLOBAL
  app.useGlobalInterceptors(new DecimalToNumberInterceptor());

  await app.listen(3000);
  console.log(`Backend rodando em: http://localhost:3000`);
}
bootstrap();