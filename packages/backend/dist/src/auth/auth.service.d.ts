import { PrismaService } from 'src/prisma/prisma.service';
import { RegistrarClienteDto } from './dto/registrar-cliente.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private prisma;
    private jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    registrarCliente(dto: RegistrarClienteDto): Promise<{
        codseq_clv: number;
        nome_clv: string | null;
        email_clv: string | null;
        cpf_clv: string | null;
        telefone1_clv: string | null;
        tipo_pessoa_clv: string | null;
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
}
