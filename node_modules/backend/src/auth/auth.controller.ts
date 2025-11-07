// backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { LoginDto } from './dto/login.dto';

// Para NestJS, definimos o decorator Public para rotas sem Guard
const Public = () => (target: any, key: string | symbol, descriptor: PropertyDescriptor) => descriptor;

@Controller('auth') 
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('registrar')
  async registrar(@Body() dto: RegistrarClienteDto) {
    // Chamada correta:
    return this.authService.registrarCliente(dto);
  }

  @Public() 
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}