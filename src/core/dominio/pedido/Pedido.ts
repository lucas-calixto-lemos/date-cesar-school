import { LocalDoCampus, type DadosDoLocal } from '../campus/LocalDoCampus'
import { ItemDoCardapio, type ItemSerializado } from '../cardapio/ItemDoCardapio'
import { Comanda } from '../comanda/Comanda'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import type { EstimadorDeTempo } from '../estimativa/EstimadorDeTempo'
import { Cobranca, type CobrancaSerializada } from '../pagamento/Cobranca'
import { JanelaDeRetirada, type MomentoDaJanela } from '../reserva/JanelaDeRetirada'

export class TransicaoDePedidoInvalidaError extends ErroDeDominio {}

export type SituacaoDoPedido = 'reservado' | 'a-caminho' | 'entregue' | 'cancelado'

/** Forma serializável do pedido: é o que viaja entre o app do aluno e o da cantina. */
export interface PedidoSerializado {
  comanda: number
  item: ItemSerializado
  quantidade: number
  janela: { inicio: string; duracao: number }
  cobranca: CobrancaSerializada
  formaDePagamento: string
  situacao: SituacaoDoPedido
  local?: DadosDoLocal
  /** Instante (ms) em que o aluno apertou o play. */
  avisadoEm?: number
}

export interface PrevisaoDeChegada {
  /** Instante (ms) do play. */
  inicio: number
  /** Instante (ms) previsto para o aluno chegar ao balcão. */
  fim: number
}

/**
 * Pedido reservado por um aluno.
 *
 * Observe que não existem getters para `item`, `cobranca` ou `janela`:
 */
// PRINCÍPIO: Lei de Demeter — quem usa o pedido conversa só com ele:
// `pedido.estaPago()` em vez de `pedido.cobranca.situacao === 'paga'`,
// `pedido.nomeDoItem()` em vez de `pedido.item.nome()`.
// PRINCÍPIO: Composição em vez de Herança — o pedido É COMPOSTO de item, janela
// e cobrança e delega a eles; não herda de nenhum.
export class Pedido {
  static readonly QUANTIDADE_MAXIMA = 5

  private situacao: SituacaoDoPedido = 'reservado'
  private localInformado?: LocalDoCampus
  private avisadoEm?: number

  constructor(
    private readonly _comanda: Comanda,
    private readonly item: ItemDoCardapio,
    private readonly _quantidade: number,
    private readonly janela: JanelaDeRetirada,
    private cobranca: Cobranca,
    private readonly formaDePagamento: string,
  ) {
    if (!Number.isInteger(_quantidade) || _quantidade < 1 || _quantidade > Pedido.QUANTIDADE_MAXIMA) {
      throw new ErroDeDominio(`A quantidade deve ser de 1 a ${Pedido.QUANTIDADE_MAXIMA}.`)
    }
  }

  // ---- serialização (o pedido sabe se transformar em dados e voltar) ----
  // PRINCÍPIO: Ocultamento de Informação — só o Pedido conhece seus campos internos;
  // repositórios e canais de sincronização guardam/transportam o formato serializado.
  static restaurar(d: PedidoSerializado): Pedido {
    const pedido = new Pedido(
      Comanda.de(d.comanda),
      ItemDoCardapio.restaurar(d.item),
      d.quantidade,
      JanelaDeRetirada.criar(HoraDoDia.deTexto(d.janela.inicio), d.janela.duracao),
      Cobranca.restaurar(d.cobranca),
      d.formaDePagamento,
    )
    pedido.situacao = d.situacao
    pedido.localInformado = d.local ? LocalDoCampus.criar(d.local) : undefined
    pedido.avisadoEm = d.avisadoEm
    return pedido
  }

  paraDados(): PedidoSerializado {
    return {
      comanda: Number(this._comanda.formatada()),
      item: this.item.paraDados(),
      quantidade: this._quantidade,
      janela: { inicio: this.janela.inicio().toString(), duracao: this.janela.duracao() },
      cobranca: this.cobranca.paraDados(),
      formaDePagamento: this.formaDePagamento,
      situacao: this.situacao,
      ...(this.localInformado ? { local: this.localInformado.paraDados() } : {}),
      ...(this.avisadoEm !== undefined ? { avisadoEm: this.avisadoEm } : {}),
    }
  }

  // ---- identificação ----
  comanda(): Comanda {
    return this._comanda
  }
  numeroDaComanda(): string {
    return this._comanda.formatada()
  }
  ehDaComanda(comanda: Comanda): boolean {
    return this._comanda.igualA(comanda)
  }

  // ---- item ----
  idDoItem(): string {
    return this.item.id()
  }
  nomeDoItem(): string {
    return this.item.nome()
  }
  imagemDoItem(): string {
    return this.item.imagem()
  }
  quantidade(): number {
    return this._quantidade
  }
  descricaoCurta(): string {
    return `${this._quantidade}× ${this.item.nome()}`
  }
  total(): Dinheiro {
    return this.item.precoPara(this._quantidade)
  }

  // ---- pagamento (delegação) ----
  estaPago(): boolean {
    return this.cobranca.estaPaga()
  }
  resumoDoPagamento(): string {
    return this.cobranca.resumo()
  }
  codigoQrDoPagamento(): string | undefined {
    return this.cobranca.codigoQr()
  }
  nomeDaFormaDePagamento(): string {
    return this.formaDePagamento
  }

  // ---- janela (delegação) ----
  descricaoDaJanela(): string {
    return this.janela.descricao()
  }
  inicioDaJanela(): HoraDoDia {
    return this.janela.inicio()
  }
  momentoDaJanela(agora: HoraDoDia): MomentoDaJanela {
    return this.janela.momento(agora)
  }

  // ---- ciclo de vida: reservado → a caminho → entregue  (ou → cancelado) ----
  situacaoAtual(): SituacaoDoPedido {
    return this.situacao
  }
  estaEmAberto(): boolean {
    return this.situacao === 'reservado' || this.situacao === 'a-caminho'
  }
  localDoAluno(): string | undefined {
    return this.localInformado?.descricao()
  }

  podeAvisarQueEstaIndo(agora: HoraDoDia): boolean {
    return this.situacao === 'reservado' && this.janela.contem(agora)
  }

  /** O "play" do aluno. */
  avisarQueEstaIndo(local: LocalDoCampus, agora: Date): void {
    if (this.situacao !== 'reservado') {
      throw new TransicaoDePedidoInvalidaError('A cantina já foi avisada sobre este pedido.')
    }
    if (!this.janela.contem(HoraDoDia.deData(agora))) {
      throw new TransicaoDePedidoInvalidaError(
        `Você só pode avisar que está indo dentro da sua janela (${this.janela.descricao()}).`,
      )
    }
    this.localInformado = local
    this.avisadoEm = agora.getTime()
    this.situacao = 'a-caminho'
  }

  /**
   * Quando o aluno deve chegar ao balcão. O pedido entrega ao estimador o
   * próprio item e local — quem pergunta não precisa abrir o pedido.
   */
  // PRINCÍPIO: Lei de Demeter ("tell, don't ask") + reuso do EstimadorDeTempo.
  preverChegada(estimador: EstimadorDeTempo): PrevisaoDeChegada | undefined {
    if (this.situacao !== 'a-caminho' || !this.localInformado || this.avisadoEm === undefined) return undefined
    const { minutosNecessarios } = estimador.estimar({ item: this.item, local: this.localInformado })
    return { inicio: this.avisadoEm, fim: this.avisadoEm + minutosNecessarios * 60_000 }
  }

  marcarEntregue(): void {
    if (!this.estaEmAberto()) {
      throw new TransicaoDePedidoInvalidaError(`O pedido ${this.numeroDaComanda()} já foi finalizado.`)
    }
    this.cobranca = this.cobranca.quitarNaRetirada()
    this.situacao = 'entregue'
  }

  cancelar(): void {
    if (!this.estaEmAberto()) {
      throw new TransicaoDePedidoInvalidaError(`O pedido ${this.numeroDaComanda()} já foi finalizado.`)
    }
    this.situacao = 'cancelado'
  }
}
