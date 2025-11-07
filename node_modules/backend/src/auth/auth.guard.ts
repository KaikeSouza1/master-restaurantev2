import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

// Guarda JWT Padrão
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

// Guarda específico para ADMIN
@Injectable()
export class AdminAuthGuard extends AuthGuard('jwt') {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Adiciona a lógica de ativação padrão
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('Token inválido ou expirado');
    }
    
    // VERIFICA O ROLE
    if (user.role !== 'admin') {
      throw new UnauthorizedException('Acesso negado. Requer permissão de administrador.');
    }
    
    return user;
  }
}