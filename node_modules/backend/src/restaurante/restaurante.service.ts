// master-restaurante-v2/packages/backend/src/restaurante/restaurante.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePedidoDto, PedidoItemDto } from './dto/restaurante.dtos';
import { Prisma } from '@prisma/client';
// 💡 CORREÇÃO DEFINITIVA (TS2339): Importa a CLASSE Decimal da runtime library
import { Decimal } from '@prisma/client/runtime/library';

// Tipo para o usuário vindo do token JWT
interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'admin' | 'cliente';
  nome: string;
}

@Injectable()
export class RestauranteService {
  constructor(private prisma: PrismaService) {}

  // ==========================================================
  // SERVIÇOS PÚBLICOS (CARDÁPIO)
  // ==========================================================

  async getEmpresaInfo() {
    return this.prisma.empresa.findFirst({
      select: {
        nome: true,
        endere: true,
        num: true,
        bairro: true,
        cidade: true,
        estado: true,
        fone: true,
      },
    });
  }

  async getCategorias() {
    return this.prisma.grupo.findMany({
      select: {
        codigo: true,
        nome: true,
      },
      orderBy: [{ seq_loja_virtual: 'asc' }, { nome: 'asc' }],
    });
  }

  async getTodosProdutos() {
    return this.prisma.produtos.findMany({
      where: {
        inativo: null,
      },
      select: {
        codinterno: true,
        descricao: true,
        preco: true,
        grupo: true,
      },
      orderBy: [{ descricao: 'asc' }],
    });
  }

  async getProductosPorCategoria(categoriaId: number) {
    // Se ID for 0 ou null, busca todos (grupo: undefined)
    const id = categoriaId === 0 ? undefined : categoriaId;
    return this.prisma.produtos.findMany({
      where: {
        grupo: id,
        inativo: null,
      },
      select: {
        codinterno: true,
        descricao: true,
        preco: true,
      },
      orderBy: [{ descricao: 'asc' }],
    });
  }

  // ==========================================================
  // SERVIÇOS DE CLIENTE (PEDIDOS)
  // ==========================================================

  async criarPedidoDelivery(dto: CreatePedidoDto, user: AuthenticatedUser) {
    const subTotal = dto.itens.reduce((acc, item) => {
      return acc + (Number(item.unitario) || 0) * (Number(item.qtd) || 0);
    }, 0);

    const taxaEntrega = Number(dto.val_taxa_entrega) || 0;
    const totalGeral = subTotal + taxaEntrega;

    try {
      return await this.prisma.$transaction(async (tx) => {
        const maxQuiosque = await tx.quiosque.aggregate({
          _max: { codseq: true },
        });
        const proximoCodseqQuiosque = (maxQuiosque._max.codseq || 0) + 1;

        const maxQuitens = await tx.quitens.aggregate({
          _max: { codseq: true },
        });
        let proximoCodseqQuitens = maxQuitens._max.codseq || 0;

        const novoQuiosque = await tx.quiosque.create({
          data: {
            codseq: proximoCodseqQuiosque,
            tipo: 'D', 
            num_quiosque: null,
            loja_virtual: true,
            data_hora_abertura: new Date(),
            vda_finalizada: 'N',
            obs: 'NOVO', 
            
            codcli: user.id, // Campo escalar
            
            nome_cli_esp: user.nome,
            fone_esp: dto.fone_esp,
            cod_endereco: dto.cod_endereco,
            val_taxa_entrega: taxaEntrega,
            sub_total_geral: subTotal,
            total: totalGeral,
            ean: String(proximoCodseqQuiosque), 
          } as Prisma.quiosqueUncheckedCreateInput, 

        });

        const itensParaSalvar = dto.itens.map((item) => {
          proximoCodseqQuitens++;
          return {
            codseq: proximoCodseqQuitens,
            codseq_qu: novoQuiosque.codseq,
            codprod: item.codprod,
            descricao: item.descricao,
            qtd: item.qtd,
            unitario: item.unitario,
            total: (Number(item.unitario) || 0) * (Number(item.qtd) || 0),
            obs: item.obs,
          };
        });

        await tx.quitens.createMany({
          data: itensParaSalvar as Prisma.quitensCreateManyInput[], 
        });

        return novoQuiosque;
      });
    } catch (error) {
      console.error('Erro ao salvar pedido na transação:', error);
      throw new InternalServerErrorException(
        `Erro ao salvar pedido: ${error.message}`,
      );
    }
  }

  // ==========================================================
  // SERVIÇOS DE ADMIN (KDS / MESAS)
  // ==========================================================

  // --- KDS ---
  
  async getKdsOrders() {
    return this.prisma.quiosque.findMany({
      where: {
        vda_finalizada: 'N',
      },
      include: {
        quitens: {
          select: { descricao: true, qtd: true, total: true, obs: true },
          orderBy: { codseq: 'asc' },
        },
      },
      orderBy: { data_hora_abertura: 'asc' },
    });
  }

  async getFinalizadosOrders() {
    const vinteQuatroHorasAtras = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return this.prisma.quiosque.findMany({
      where: {
        vda_finalizada: 'S',
        data_hora_finalizada: {
          gte: vinteQuatroHorasAtras,
        },
      },
      include: {
        quitens: {
          select: { descricao: true, qtd: true, total: true, obs: true },
        },
      },
      orderBy: { data_hora_finalizada: 'desc' },
    });
  }

  async atualizarStatusKds(codseq: number, novoStatus: string) {
    const statusValidos = ['NOVO', 'PREPARANDO', 'PRONTO', 'PAGAMENTO'];
    if (!statusValidos.includes(novoStatus.toUpperCase())) {
      throw new ConflictException('Status inválido.');
    }
    
    return this.prisma.quiosque.update({
      where: { codseq },
      data: { obs: novoStatus.toUpperCase() },
    });
  }

  async finalizarPedidoNfce(codseq: number) {
    console.log(`Finalizando pedido ${codseq} para emissor NFCe...`);
    return this.prisma.quiosque.update({
      where: { codseq },
      data: {
        vda_finalizada: 'S', 
        data_hora_finalizada: new Date(),
        obs: 'FINALIZADO',
      },
    });
  }

  // --- GESTÃO DE MESAS ---
  
  async getMesasStatus() {
    return this.prisma.quiosque.findMany({
      where: {
        tipo: 'M',
        vda_finalizada: 'N',
      },
      include: {
        quitens: {
          select: {
            codseq: true,
            descricao: true,
            qtd: true,
            unitario: true,
            total: true,
            obs: true,
          },
          orderBy: { codseq: 'asc' },
        },
      },
      orderBy: { num_quiosque: 'asc' },
    });
  }

  async abrirMesa(numMesa: number) {
    const mesaExistente = await this.prisma.quiosque.findFirst({
      where: {
        num_quiosque: numMesa,
        tipo: 'M',
        vda_finalizada: 'N',
      },
    });

    if (mesaExistente) {
      throw new ConflictException(`A mesa ${numMesa} já está aberta (Pedido #${mesaExistente.codseq}).`);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const maxQuiosque = await tx.quiosque.aggregate({
          _max: { codseq: true },
        });
        const proximoCodseqQuiosque = (maxQuiosque._max.codseq || 0) + 1;

        const novaMesa = await tx.quiosque.create({
          data: {
            codseq: proximoCodseqQuiosque,
            tipo: 'M',
            num_quiosque: numMesa,
            loja_virtual: true, 
            data_hora_abertura: new Date(),
            vda_finalizada: 'N',
            obs: 'NOVO', 
            val_taxa_entrega: 0,
            sub_total_geral: 0,
            total: 0,
            ean: String(proximoCodseqQuiosque),
          } as Prisma.quiosqueUncheckedCreateInput,
        });
        return novaMesa;
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao abrir mesa: ${error.message}`,
      );
    }
  }

  async adicionarItensMesa(codseq: number, itens: PedidoItemDto[]) {
    if (itens.length === 0) {
      throw new ConflictException('Nenhum item para adicionar.');
    }
    
    const quiosque = await this.prisma.quiosque.findUnique({
      where: { codseq },
    });
    
    if (!quiosque) {
      throw new NotFoundException(`Pedido (Mesa) com ID ${codseq} não encontrado.`);
    }
    if (quiosque.vda_finalizada !== 'N') {
      throw new ConflictException(`Pedido ${codseq} não está aberto.`);
    }

    const subTotalItensNovos = itens.reduce((acc, item) => {
      return acc + (Number(item.unitario) || 0) * (Number(item.qtd) || 0);
    }, 0);

    try {
      return await this.prisma.$transaction(async (tx) => {
        const maxQuitens = await tx.quitens.aggregate({
          _max: { codseq: true },
        });
        let proximoCodseqQuitens = maxQuitens._max.codseq || 0;

        const itensParaSalvar = itens.map((item) => {
          proximoCodseqQuitens++;
          return {
            codseq: proximoCodseqQuitens,
            codseq_qu: codseq,
            codprod: item.codprod,
            descricao: item.descricao,
            qtd: item.qtd,
            unitario: item.unitario,
            total: (Number(item.unitario) || 0) * (Number(item.qtd) || 0),
            obs: item.obs || null,
          };
        });

        await tx.quitens.createMany({
          data: itensParaSalvar as Prisma.quitensCreateManyInput[],
        });

        const subTotalAtual = Number(quiosque.sub_total_geral);
        const totalAtual = Number(quiosque.total);

        const novoSubTotal = subTotalAtual + subTotalItensNovos;
        const novoTotal = totalAtual + subTotalItensNovos;

        // 💡 CORREÇÃO (TS2339): Usando 'new Decimal()' (importado da runtime)
        const quiosqueAtualizado = await tx.quiosque.update({
          where: { codseq: codseq },
          data: {
            sub_total_geral: new Decimal(novoSubTotal.toFixed(2)),
            total: new Decimal(novoTotal.toFixed(2)),
            obs: 'NOVO', 
          },
          include: { quitens: true },
        });
        return quiosqueAtualizado;
      });
    } catch (error) {
      throw new InternalServerErrorException(
        `Erro ao salvar itens: ${error.message}`,
      );
    }
  }

  async transferirMesa(codseq: number, numMesaDestino: number) {
    const mesaOrigem = await this.prisma.quiosque.findUnique({
      where: { codseq },
    });
    if (!mesaOrigem || mesaOrigem.vda_finalizada !== 'N') {
      throw new NotFoundException(`Mesa de origem (Pedido #${codseq}) não está aberta.`);
    }

    const mesaDestinoOcupada = await this.prisma.quiosque.findFirst({
      where: {
        num_quiosque: numMesaDestino,
        tipo: 'M',
        vda_finalizada: 'N',
      },
    });

    if (mesaDestinoOcupada) {
      throw new ConflictException(
        `Mesa de destino ${numMesaDestino} já está ocupada (Pedido #${mesaDestinoOcupada.codseq}).`,
      );
    }

    return this.prisma.quiosque.update({
      where: { codseq },
      data: {
        num_quiosque: numMesaDestino,
      },
    });
  }

  async solicitarFechamento(codseq: number) {
    return this.prisma.quiosque.update({
      where: { codseq },
      data: { obs: 'PAGAMENTO' },
    });
  }
  
  async liberarMesa(codseq: number) {
    return this.finalizarPedidoNfce(codseq);
  }
}