// master-restaurante-v2/packages/backend/src/restaurante/restaurante.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { RestauranteService } from './restaurante.service';
import {
  CreatePedidoDto,
  AbrirMesaDto,
  AdicionarItensDto,
  TransferirMesaDto,
  AtualizarStatusDto,
} from './dto/restaurante.dtos';
import { AdminAuthGuard, JwtAuthGuard } from 'src/auth/auth.guard';
import type { Request } from 'express'; // CORREÇÃO TS1272: Importa apenas o tipo

// Interface para saber o que vem no req.user
interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'admin' | 'cliente';
  nome: string;
}

@Controller('restaurante') // Novo prefixo: /restaurante
export class RestauranteController {
  constructor(private readonly restauranteService: RestauranteService) {}

  // ==========================================================
  // ROTAS PÚBLICAS (CARDÁPIO)
  // ==========================================================

  @Get('empresa')
  async getEmpresaInfo() {
    return this.restauranteService.getEmpresaInfo();
  }

  @Get('categorias')
  async getCategorias() {
    return this.restauranteService.getCategorias();
  }

  @Get('produtos')
  async getTodosProdutos() {
    return this.restauranteService.getTodosProdutos();
  }

  @Get('produtos/:categoriaId')
  async getProdutosPorCategoria(
    @Param('categoriaId', ParseIntPipe) categoriaId: number,
  ) {
    return this.restauranteService.getProductosPorCategoria(categoriaId);
  }

  // ==========================================================
  // ROTA AUTENTICADA (CLIENTE OU ADMIN)
  // ==========================================================

  @UseGuards(JwtAuthGuard) // Protege a rota
  @Post('pedidos/delivery')
  async criarPedidoDelivery(
    @Body() pedidoDto: CreatePedidoDto,
    @Req() req: Request, 
  ) {
    const user = req.user as AuthenticatedUser; 
    return this.restauranteService.criarPedidoDelivery(pedidoDto, user);
  }

  // ==========================================================
  // ROTAS PROTEGIDAS (SÓ ADMIN)
  // ==========================================================

  // --- KDS ---
  @UseGuards(AdminAuthGuard)
  @Get('admin/kds')
  async listarPedidosKds() {
    return this.restauranteService.getKdsOrders();
  }

  @UseGuards(AdminAuthGuard)
  @Get('admin/kds/finalizados')
  async listarPedidosFinalizados() {
    return this.restauranteService.getFinalizadosOrders();
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/kds/status/:codseq')
  async atualizarStatusKds(
    @Param('codseq', ParseIntPipe) codseq: number,
    @Body() dto: AtualizarStatusDto,
  ) {
    return this.restauranteService.atualizarStatusKds(codseq, dto.status);
  }

  /**
   * ESTA É A LÓGICA QUE VOCÊ QUERIA MANTER
   * Finaliza o pedido para o emissor de NFCe
   */
  @UseGuards(AdminAuthGuard)
  @Patch('admin/kds/finalizar/:codseq')
  async finalizarNfce(@Param('codseq', ParseIntPipe) codseq: number) {
    return this.restauranteService.finalizarPedidoNfce(codseq);
  }

  // --- MESAS ---
  @UseGuards(AdminAuthGuard)
  @Get('admin/mesas')
  async getMesasStatus() {
    return this.restauranteService.getMesasStatus();
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/mesas/abrir')
  async abrirMesa(
    @Body() dto: AbrirMesaDto,
  ) {
    return this.restauranteService.abrirMesa(dto.numMesa);
  }

  @UseGuards(AdminAuthGuard)
  @Post('admin/mesas/adicionar/:codseq')
  async adicionarItensMesa(
    @Param('codseq', ParseIntPipe) codseq: number,
    @Body() dto: AdicionarItensDto,
  ) {
    return this.restauranteService.adicionarItensMesa(codseq, dto.itens);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/mesas/transferir/:codseq')
  async transferirMesa(
    @Param('codseq', ParseIntPipe) codseq: number,
    @Body() dto: TransferirMesaDto,
  ) {
    return this.restauranteService.transferirMesa(codseq, dto.numMesaDestino);
  }

  @UseGuards(AdminAuthGuard)
  @Patch('admin/mesas/fechar/:codseq') // Solicita fechamento (Pagamento)
  async solicitarFechamento(@Param('codseq', ParseIntPipe) codseq: number) {
    return this.restauranteService.solicitarFechamento(codseq);
  }
  
  @UseGuards(AdminAuthGuard)
  @Patch('admin/mesas/liberar/:codseq') // Libera a mesa (Finaliza)
  async liberarMesa(@Param('codseq', ParseIntPipe) codseq: number) {
    return this.restauranteService.liberarMesa(codseq);
  }
}