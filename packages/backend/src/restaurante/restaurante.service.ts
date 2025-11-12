// packages/backend/src/restaurante/restaurante.service.ts

import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  ConflictException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  CreatePedidoDto,
  JuntarMesasDto,
  PedidoItemDto,
  FinalizarCaixaDto,
} from './dto/restaurante.dtos';
import { Prisma } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// Tipo para o usuário vindo do token JWT
interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'admin' | 'cliente';
  nome: string;
}

// Tipo helper para a transação do Prisma (Corrigido)
type PrismaTx = Prisma.TransactionClient;

@Injectable()
export class RestauranteService {
  constructor(private prisma: PrismaService) {}

  // = =========================================================
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

            // CORREÇÃO FINAL: Usamos o campo escalar codcli e o cast para 'any'
            // para resolver problemas de tipos não encontrados no ambiente Vercel (TS2694/TS2353).
            codcli: user.id, // Campo escalar

            nome_cli_esp: user.nome,
            fone_esp: dto.fone_esp,
            cod_endereco: dto.cod_endereco,
            val_taxa_entrega: taxaEntrega,
            sub_total_geral: subTotal,
            total: totalGeral,
            ean: String(proximoCodseqQuiosque),
          } as any, // Cast forçado para 'any' para evitar erros de tipo na compilação do Vercel
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
          data: itensParaSalvar as any, // Cast forçado para 'any' para evitar erros de tipo na compilação do Vercel
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
    const result = await this.prisma.quiosque.updateMany({
      where: { codseq: codseq, vda_finalizada: 'N' },
      data: {
        vda_finalizada: 'S',
        data_hora_finalizada: new Date(),
        obs: 'FINALIZADO',
      },
    });

    if (result.count === 0) {
      console.warn(`Pedido ${codseq} já estava finalizado ou não foi encontrado.`);
    }

    return this.prisma.quiosque.findUnique({ where: { codseq } });
  }

  // --- GESTÃO DE MESAS ---

  /**
   * Helper para recalcular totais de um pedido (mesa/quiosque).
   * Deve ser usado dentro de uma transação (passando 'tx').
   */
  private async calcularTotais(codseq: number, tx: PrismaTx) {
    const totalItens = await tx.quitens.aggregate({
      _sum: {
        total: true,
      },
      where: {
        codseq_qu: codseq,
      },
    });

    const subTotal = totalItens._sum.total || new Decimal(0);

    const pedido = await tx.quiosque.findUnique({
      where: { codseq },
      select: { val_taxa_entrega: true },
    });

    const taxaEntrega = new Decimal(pedido?.val_taxa_entrega || 0);
    const totalGeral = subTotal.plus(taxaEntrega);

    return tx.quiosque.update({
      where: { codseq },
      data: {
        sub_total_geral: subTotal,
        total: totalGeral,
      },
    });
  }

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
      throw new ConflictException(
        `A mesa ${numMesa} já está aberta (Pedido #${mesaExistente.codseq}).`,
      );
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
          } as any, // Cast forçado para 'any' para evitar erros de tipo na compilação do Vercel
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
      throw new NotFoundException(
        `Pedido (Mesa) com ID ${codseq} não encontrado.`,
      );
    }
    if (quiosque.vda_finalizada !== 'N') {
      throw new ConflictException(`Pedido ${codseq} não está aberto.`);
    }

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
          data: itensParaSalvar as any, // Cast forçado para 'any' para evitar erros de tipo na compilação do Vercel
        });

        await this.calcularTotais(codseq, tx);

        await tx.quiosque.update({
          where: { codseq },
          data: { obs: 'NOVO' },
        });

        return tx.quiosque.findUnique({
          where: { codseq },
          include: { quitens: true },
        });
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
      throw new NotFoundException(
        `Mesa de origem (Pedido #${codseq}) não está aberta.`,
      );
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

  async juntarMesas(dto: JuntarMesasDto) {
    const { codseqOrigem, codseqDestino } = dto;

    if (codseqOrigem === codseqDestino) {
      throw new HttpException(
        'Mesa de origem e destino não podem ser iguais',
        HttpStatus.BAD_REQUEST,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar mesas
      const mesaOrigem = await tx.quiosque.findFirst({
        where: { codseq: codseqOrigem, vda_finalizada: 'N' },
      });
      const mesaDestino = await tx.quiosque.findFirst({
        where: { codseq: codseqDestino, vda_finalizada: 'N' },
      });

      if (!mesaOrigem) {
        throw new NotFoundException(
          `Mesa de origem #${codseqOrigem} não encontrada ou já finalizada.`,
        );
      }
      if (!mesaDestino) {
        throw new NotFoundException(
          `Mesa de destino #${codseqDestino} não encontrada ou já finalizada.`,
        );
      }
      if (mesaDestino.obs === 'PAGAMENTO') {
        throw new ConflictException(
          `Mesa de destino #${mesaDestino.num_quiosque} já está em pagamento e não pode ser juntada.`,
        );
      }

      // 2. Mover itens
      await tx.quitens.updateMany({
        where: {
          codseq_qu: codseqOrigem,
        },
        data: {
          codseq_qu: codseqDestino,
        },
      });

      // 3. Recalcular total da destino
      const mesaDestinoAtualizada = await this.calcularTotais(codseqDestino, tx);

      // 4. Finalizar mesa de origem
      await tx.quiosque.update({
        where: { codseq: codseqOrigem },
        data: {
          vda_finalizada: 'S',
          obs: `JUNTO COM MESA ${mesaDestino.num_quiosque} (Pedido #${codseqDestino})`,
          sub_total_geral: 0,
          total: 0,
          data_hora_finalizada: new Date(),
        },
      });

      // 5. Retornar mesa de destino completa
      return tx.quiosque.findUnique({
        where: { codseq: mesaDestinoAtualizada.codseq },
        include: {
          quitens: {
            orderBy: {
              codseq: 'asc',
            },
          },
        },
      });
    });
  }

  async finalizarMesaCaixa(
    codseq: number,
    dto: FinalizarCaixaDto,
    user: AuthenticatedUser,
  ) {
    // ==========================================================
    // <-- LÓGICA DE DATA/HORA CORRIGIDA AQUI -->
    // ==========================================================
    const agora = new Date();
    const timeZone = 'America/Sao_Paulo'; // Fuso de Brasília (GMT-3)

    // 1. Pega a DATA formatada para São Paulo (ex: "2025-11-11")
    const formatadorData = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const dataBrasil = formatadorData.format(agora); // String "2025-11-11"

    // 2. Pega as PARTES da hora em São Paulo
    const formatadorPartes = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    });

    const partes = formatadorPartes.formatToParts(agora).reduce((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {} as Record<string, string>);

    // 3. Cria um objeto Date "falsificado" em UTC
    // O banco de dados @db.Time só se importa com HH:mm:ss
    // Então, criamos um Date onde a hora UTC é a hora de Brasília
    const horaBrasilComoObjetoDate = new Date(
      Date.UTC(
        1970, // Ano base (ignorado pelo @db.Time)
        0, // Mês base (ignorado pelo @db.Time)
        1, // Dia base (ignorado pelo @db.Time)
        parseInt(partes.hour, 10), // Ex: 13
        parseInt(partes.minute, 10), // Ex: 53
        parseInt(partes.second, 10), // Ex: 00
      ),
    );
    // ==========================================================

    return this.prisma.$transaction(async (tx) => {
      // 1. Validar a mesa (quiosque)
      const mesa = await tx.quiosque.findFirst({
        where: {
          codseq: codseq,
          vda_finalizada: 'N',
        },
      });

      if (!mesa) {
        throw new NotFoundException(
          `Mesa (Pedido #${codseq}) não encontrada ou já está finalizada.`,
        );
      }

      if (mesa.obs !== 'PAGAMENTO') {
        throw new ConflictException(
          `Mesa #${mesa.num_quiosque} precisa estar com o status 'PAGAMENTO' para ser finalizada no caixa.`,
        );
      }

      // 2. Pegar o próximo codseq para o caixa
      const maxCaixa = await tx.caixa.aggregate({
        _max: { codseq: true },
      });
      const proximoCodseqCaixa = (maxCaixa._max.codseq || 0) + 1;

      // 3. Criar o registro no caixa
      await tx.caixa.create({
        data: {
          codseq: proximoCodseqCaixa,
          datai: new Date(dataBrasil), // Salva a data correta (ex: 2025-11-11)
          historico: `VENDA MESA ${mesa.num_quiosque} (PEDIDO #${mesa.codseq})`,
          debito: 0,
          credito: mesa.total,
          acumular: 'S',
          tipo: 'VENDA',
          num_caixa: dto.num_caixa || 1,
          cod_forma_pagto: dto.cod_forma_pagto,
          codven: mesa.codseq,

          // ==========================================================
          // <-- CAMPOS DE HORA CORRIGIDOS -->
          // Salvamos o objeto Date "falsificado"
          // O banco salvará "13:53:00"
          // ==========================================================
          hora_inclusao: horaBrasilComoObjetoDate,
          data_i: new Date(dataBrasil),
          hora_i: horaBrasilComoObjetoDate,

          id_user_gpw: user.id,
          caixa_aberto: true,
        },
      });

      // 4. Finalizar a mesa (quiosque)
      const mesaFinalizada = await tx.quiosque.update({
        where: { codseq: codseq },
        data: {
          vda_finalizada: 'S',
          data_hora_finalizada: new Date(), // A hora de finalização (UTC)
          obs: 'FINALIZADO (CAIXA)',
        },
      });

      return mesaFinalizada;
    });
  }

  // ==========================================================
  // REMOÇÃO E EDIÇÃO DE ITENS (NOVOS MÉTODOS)
  // ==========================================================

  // ==========================================================
  // REMOÇÃO SIMPLIFICADA (SEM MOTIVO OBRIGATÓRIO)
  // ==========================================================
  async removerItem(codseq: number, codseqItem: number, motivo?: string) {
    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.quiosque.findUnique({
        where: { codseq },
        include: { quitens: true },
      });
      if (!pedido) {
        throw new NotFoundException(`Pedido ${codseq} não encontrado`);
      }
      if (pedido.vda_finalizada === 'S') {
        throw new ConflictException(
          'Não é possível remover itens de pedidos finalizados',
        );
      }
      if (pedido.obs === 'PAGAMENTO') {
        throw new ConflictException('Mesa em pagamento. Reabra para editar.');
      }
      const item = await tx.quitens.findUnique({
        where: { codseq: codseqItem },
      });
      if (!item || item.codseq_qu !== codseq) {
        throw new NotFoundException('Item não encontrado');
      }
      // Deletar item
      await tx.quitens.delete({
        where: { codseq: codseqItem },
      });
      // Recalcular totais
      const pedidoAtualizado = await this.calcularTotais(codseq, tx);
      // Log opcional (se motivo foi informado)
      if (motivo) {
        const dataHora = new Date().toLocaleString('pt-BR');
        const logRemocao = `\n[${dataHora}] REMOVIDO: ${item.qtd}x ${
          item.descricao
        } - ${motivo}`;
        await tx.quiosque.update({
          where: { codseq },
          data: {
            obs: (pedido.obs || '') + logRemocao,
          },
        });
      }
      return pedidoAtualizado;
    });
  }

  async editarQuantidadeItem(
    codseq: number,
    codseqItem: number,
    novaQtd: number,
    motivo?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.quiosque.findUnique({ where: { codseq } });

      if (!pedido) {
        throw new NotFoundException('Pedido não encontrado');
      }

      if (pedido.vda_finalizada === 'S') {
        throw new ConflictException('Não é possível editar pedidos finalizados');
      }

      if (pedido.obs === 'PAGAMENTO') {
        throw new ConflictException('Pedido em pagamento. Reabra para editar.');
      }

      if (novaQtd <= 0) {
        throw new ConflictException(
          'A nova quantidade deve ser maior que zero. Para remover, use a função de remoção.',
        );
      }

      const item = await tx.quitens.findUnique({
        where: { codseq: codseqItem },
      });

      if (!item || item.codseq_qu !== codseq) {
        throw new NotFoundException('Item não encontrado');
      }

      // Atualizar quantidade e total
      const novoTotal = Number(item.unitario) * novaQtd;

      await tx.quitens.update({
        where: { codseq: codseqItem },
        data: {
          qtd: novaQtd,
          total: novoTotal,
        },
      });

      // Recalcular totais do pedido
      const pedidoAtualizado = await this.calcularTotais(codseq, tx);

      // Log (opcional)
      if (motivo) {
        const dataHora = new Date().toLocaleString('pt-BR');
        const logEdicao = `\n[${dataHora}] EDITADO: ${item.descricao} de ${item.qtd}x para ${novaQtd}x - ${motivo}`;

        await tx.quiosque.update({
          where: { codseq },
          data: {
            obs: (pedido.obs || '') + logEdicao,
          },
        });
      }

      return pedidoAtualizado;
    });
  }

  // ==========================================================
  // DIVISÃO SIMPLIFICADA
  // ==========================================================
  async calcularDivisaoSimplificada(
    codseq: number,
    numPessoas: number,
    itensPorPessoa: Array<{ codseq_item: number; pessoa: number }>,
  ) {
    const pedido = await this.prisma.quiosque.findUnique({
      where: { codseq },
      include: { quitens: true },
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    if (pedido.obs !== 'PAGAMENTO') {
      throw new ConflictException('Mesa precisa estar em PAGAMENTO');
    }
    // Criar mapa de itens por pessoa
    const divisao: Record<number, { itens: any[]; total: number }> = {};
    for (let i = 1; i <= numPessoas; i++) {
      divisao[i] = { itens: [], total: 0 };
    }
    // Distribuir itens
    for (const itemDiv of itensPorPessoa) {
      const item = pedido.quitens.find((q) => q.codseq === itemDiv.codseq_item);
      if (item) {
        divisao[itemDiv.pessoa].itens.push({
          descricao: item.descricao,
          qtd: item.qtd,
          total: Number(item.total),
        });
        divisao[itemDiv.pessoa].total += Number(item.total);
      }
    }
    return {
      codseq,
      total_conta: Number(pedido.total),
      num_pessoas: numPessoas,
      divisao,
    };
  }

  // ==========================================================
  // DIVISÃO DE CONTA (CONTROLE WEB) (NOVOS MÉTODOS)
  // ==========================================================

  async registrarPagamentoParcial(
    codseq: number,
    pagamentos: Array<{
      pessoa_numero: number;
      nome_pessoa?: string;
      valor_pago: number;
      forma_pagamento: number;
    }>,
  ) {
    return this.prisma.$transaction(async (tx) => {
      const pedido = await tx.quiosque.findUnique({
        where: { codseq },
      });

      if (!pedido) {
        throw new NotFoundException('Pedido não encontrado');
      }

      if (pedido.obs !== 'PAGAMENTO') {
        throw new ConflictException(
          'Pedido precisa estar em PAGAMENTO para dividir conta',
        );
      }

      // Criar JSON com os pagamentos (salvar em campo TEXT ou criar tabela separada)
      // Por simplicidade, vou usar o campo 'obs' para armazenar (em produção, criar tabela)

      const pagamentosAnteriores = this.extrairPagamentos(pedido.obs || '');
      const novosPagamentos = [
        ...pagamentosAnteriores,
        ...pagamentos.map((p) => ({
          ...p,
          data_hora: new Date().toISOString(),
        })),
      ];

      const totalPago = novosPagamentos.reduce((acc, p) => acc + p.valor_pago, 0);
      const totalRestante = Number(pedido.total) - totalPago;

      // Atualizar obs com JSON
      const obsAtualizada = `DIVISAO_CONTA:${JSON.stringify(novosPagamentos)}`;

      await tx.quiosque.update({
        where: { codseq },
        data: { obs: obsAtualizada },
      });

      return {
        codseq,
        total_conta: Number(pedido.total),
        total_pago: totalPago,
        total_restante: totalRestante,
        pagamentos: novosPagamentos,
        pode_finalizar: totalRestante <= 0.01, // Tolerância de 1 centavo
      };
    });
  }

  async obterStatusDivisao(codseq: number) {
    const pedido = await this.prisma.quiosque.findUnique({
      where: { codseq },
    });

    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }

    const pagamentos = this.extrairPagamentos(pedido.obs || '');
    const totalPago = pagamentos.reduce((acc, p) => acc + p.valor_pago, 0);
    const totalRestante = Number(pedido.total) - totalPago;

    return {
      codseq,
      total_conta: Number(pedido.total),
      total_pago: totalPago,
      total_restante: totalRestante,
      pagamentos,
      pode_finalizar: totalRestante <= 0.01,
    };
  }

  // Helper para extrair pagamentos do campo obs
  private extrairPagamentos(obs: string): Array<any> {
    if (!obs.startsWith('DIVISAO_CONTA:')) {
      return [];
    }

    try {
      const jsonStr = obs.replace('DIVISAO_CONTA:', '');
      return JSON.parse(jsonStr);
    } catch {
      return [];
    }
  }

  // Finalizar pedido dividido (vai pro NFCe como 1 pedido só)
  async finalizarPedidoDividido(codseq: number) {
    const status = await this.obterStatusDivisao(codseq);

    if (!status.pode_finalizar) {
      throw new ConflictException(
        `Ainda falta pagar ${formatCurrency(
          status.total_restante,
        )}. Não é possível finalizar.`,
      );
    }

    // Limpa a obs para enviar limpo pro NFCe
    await this.prisma.quiosque.update({
      where: { codseq },
      data: { obs: 'FINALIZADO (DIVIDIDO)' },
    });

    // Chama a função normal de finalizar
    return this.finalizarPedidoNfce(codseq);
  }
}
function formatCurrency(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}