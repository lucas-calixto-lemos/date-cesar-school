/*
 * Adaptadores: implementam as portas do domínio guardando tudo no ArmazemDaCantina.
 * Eles dependem só da INTERFACE do armazém — funcionam igual com a versão em
 * memória ou com a de BroadcastChannel (e com um servidor, no futuro).
 */
import type { CardapioRepository } from '../../dominio/cardapio/CardapioRepository'
import { ItemDoCardapio, type ItemSerializado } from '../../dominio/cardapio/ItemDoCardapio'
import type { ControleDaCantina, Estoque } from '../../dominio/cantina/portas'
import { Comanda } from '../../dominio/comanda/Comanda'
import type { GeradorDeComanda } from '../../dominio/comanda/GeradorDeComanda'
import { ErroDeDominio } from '../../dominio/compartilhado/ErroDeDominio'
import type { HoraDoDia } from '../../dominio/compartilhado/HoraDoDia'
import { Pedido } from '../../dominio/pedido/Pedido'
import type { RepositorioDePedidos } from '../../dominio/pedido/RepositorioDePedidos'
import type { ArmazemDaCantina, EstadoDaCantina } from '../../dominio/sincronizacao/ArmazemDaCantina'
import type { ControleDeRelogio, Relogio } from '../../dominio/tempo/Relogio'

export class RepositorioDePedidosNoArmazem implements RepositorioDePedidos {
  constructor(private readonly armazem: ArmazemDaCantina) {}

  salvar(pedido: Pedido): void {
    const dados = pedido.paraDados()
    this.armazem.alterar((estado) => ({
      ...estado,
      pedidos: [...estado.pedidos.filter((p) => p.comanda !== dados.comanda), dados],
    }))
  }

  buscarPorComanda(comanda: Comanda): Pedido | undefined {
    const numero = Number(comanda.formatada())
    const dados = this.armazem.ler().pedidos.find((p) => p.comanda === numero)
    return dados ? Pedido.restaurar(dados) : undefined
  }

  listarTodos(): Pedido[] {
    return this.armazem.ler().pedidos.map((dados) => Pedido.restaurar(dados))
  }

  listarEmAberto(): Pedido[] {
    return this.listarTodos().filter((p) => p.estaEmAberto())
  }
}

export class EstoqueNoArmazem implements Estoque {
  constructor(private readonly armazem: ArmazemDaCantina) {}

  quantidadeDe(itemId: string): number {
    return this.armazem.ler().estoque[itemId] ?? 0
  }

  retirar(itemId: string, quantidade: number): void {
    if (quantidade > this.quantidadeDe(itemId)) throw new ErroDeDominio('Estoque insuficiente.')
    this.somar(itemId, -quantidade)
  }

  repor(itemId: string, quantidade: number): void {
    this.somar(itemId, quantidade)
  }

  private somar(itemId: string, delta: number): void {
    this.armazem.alterar((estado) => ({
      ...estado,
      estoque: { ...estado.estoque, [itemId]: Math.max(0, (estado.estoque[itemId] ?? 0) + delta) },
    }))
  }
}

export class OperacaoNoArmazem implements ControleDaCantina {
  constructor(private readonly armazem: ArmazemDaCantina) {}

  cantinaAberta(): boolean {
    return this.armazem.ler().cantinaAberta
  }
  reservasAbertas(): boolean {
    return this.armazem.ler().reservasAbertas
  }
  abrirCantina(): void {
    this.armazem.alterar((e) => ({ ...e, cantinaAberta: true }))
  }
  fecharCantina(): void {
    this.armazem.alterar((e) => ({ ...e, cantinaAberta: false }))
  }
  reabrirReservas(): void {
    this.armazem.alterar((e) => ({ ...e, reservasAbertas: true }))
  }
  finalizarReservas(): void {
    this.armazem.alterar((e) => ({ ...e, reservasAbertas: false }))
  }
}

/** Sequência de comandas guardada no estado compartilhado: duas abas nunca repetem número. */
export class GeradorDeComandaNoArmazem implements GeradorDeComanda {
  constructor(private readonly armazem: ArmazemDaCantina) {}

  proxima(): Comanda {
    const numero = (this.armazem.ler().ultimaComanda % Comanda.MAIOR_NUMERO) + 1
    this.armazem.alterar((e) => ({ ...e, ultimaComanda: numero }))
    return Comanda.de(numero)
  }
}

/**
 * Cardápio cuja disponibilidade vem do estoque: zerou, aparece "Esgotado".
 */
// PRINCÍPIO: Substituição de Liskov — continua sendo um CardapioRepository comum;
// as telas e o ServicoDeReserva não sabem que agora existe estoque por trás.
export class CardapioComEstoque implements CardapioRepository {
  constructor(
    private readonly catalogo: ItemSerializado[],
    private readonly estoque: Pick<Estoque, 'quantidadeDe'>,
  ) {}

  listarTodos(): ItemDoCardapio[] {
    return this.catalogo.map((dados) => this.montar(dados))
  }

  buscarPorId(id: string): ItemDoCardapio | undefined {
    const dados = this.catalogo.find((item) => item.id === id)
    return dados ? this.montar(dados) : undefined
  }

  private montar(dados: ItemSerializado): ItemDoCardapio {
    return ItemDoCardapio.restaurar(dados, this.estoque.quantidadeDe(dados.id) > 0)
  }
}

/**
 * "Resetar teste": volta o estado compartilhado ao início do dia (sem pedidos,
 * estoque cheio, comandas a partir de 019, cantina e reservas abertas, relógio real).
 *
 * É uma alteração como outra qualquer — a versão SOBE em vez de voltar a 0 —,
 * então as outras abas aceitam a mudança pelo mesmo mecanismo de sincronização.
 */
export class ReinicioDoTeste {
  constructor(
    private readonly armazem: ArmazemDaCantina,
    private readonly inicial: () => EstadoDaCantina,
  ) {}

  reiniciar(): void {
    const { versao: _ignorada, ...estado } = this.inicial()
    this.armazem.alterar(() => estado)
  }
}

/**
 * Relógio com o deslocamento do debug guardado no estado compartilhado:
 * simular 20:15 no app do aluno também muda o horário do app da cantina
 * (inclusive em outra aba) — os timers dos pedidos ficam coerentes.
 */
export class RelogioCompartilhado implements Relogio, ControleDeRelogio {
  constructor(
    private readonly base: Relogio,
    private readonly armazem: ArmazemDaCantina,
  ) {}

  agora(): Date {
    return new Date(this.base.agora().getTime() + this.armazem.ler().deslocamentoDoRelogioMs)
  }

  ajustarPara(hora: HoraDoDia): void {
    const real = this.base.agora()
    const alvo = new Date(real)
    alvo.setHours(hora.horas(), hora.minutos(), 0, 0)
    this.definir(alvo.getTime() - real.getTime())
  }

  avancarMinutos(minutos: number): void {
    this.definir(this.armazem.ler().deslocamentoDoRelogioMs + minutos * 60_000)
  }

  voltarAoHorarioReal(): void {
    this.definir(0)
  }

  estaAjustado(): boolean {
    return this.armazem.ler().deslocamentoDoRelogioMs !== 0
  }

  private definir(ms: number): void {
    this.armazem.alterar((e) => ({ ...e, deslocamentoDoRelogioMs: ms }))
  }
}
