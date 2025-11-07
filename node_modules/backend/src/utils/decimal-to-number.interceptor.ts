// master-restaurante-v2/packages/backend/src/utils/decimal-to-number.interceptor.ts

import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Decimal } from '@prisma/client/runtime/library';

// Função utilitária para recursivamente converter Decimal
function transformDecimals(value: any): any {
  if (value instanceof Decimal) {
    // Converte Prisma.Decimal para número.
    // Usar 'toString()' é mais seguro para alta precisão, mas 
    // 'toNumber()' é mais comum em APIs Web. Mantenha 'toNumber()' para simplicidade
    // e use Number.parseFloat().toFixed(2) no Front-end para formatação.
    return value.toNumber(); 
  }

  if (Array.isArray(value)) {
    return value.map(transformDecimals);
  }

  if (value !== null && typeof value === 'object') {
    const newObject: Record<string, any> = {};
    for (const key in value) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        newObject[key] = transformDecimals(value[key]);
      }
    }
    return newObject;
  }

  return value;
}

@Injectable()
export class DecimalToNumberInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map(data => transformDecimals(data)),
    );
  }
}