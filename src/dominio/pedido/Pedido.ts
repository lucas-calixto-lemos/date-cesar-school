import type { LocalDoCampus } from '../campus/LocalDoCampus'
import type { ItemDoCardapio } from '../cardapio/ItemDoCardapio'
import type { Comanda } from '../comanda/Comanda'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { Dinheiro } from '../compartilhado/Dinheiro'
import type { HoraDoDia } from '../compartilhado/HoraDoDia'
import type { Cobranca } from '../pagamento/Cobranca'
import type { JanelaDeRetirada, MomentoDaJanela } from '../reserva/JanelaDeRetirada'

export class TransicaoDePedidoInvalidaError extends ErroDeDominio {}

export type SituacaoDoPedido = 'reservado' | 'aluno-a-caminho' | 'pronto' | 'retirado'

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

  constructor(
    private readonly _comanda: Comanda,
    private readonly item: ItemDoCardapio,
    private readonly _quantidade: number,
    private readonly janela: JanelaDeRetirada,
    private readonly cobranca: Cobranca,
  ) {
    if (!Number.isInteger(_quantidade) || _quantidade < 1 || _quantidade > Pedido.QUANTIDADE_MAXIMA) {
      throw new ErroDeDominio(`A quantidade deve ser de 1 a ${Pedido.QUANTIDADE_MAXIMA}.`)
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

  // ---- ciclo de vida ----
  situacaoAtual(): SituacaoDoPedido {
    return this.situacao
  }
  estaEmAberto(): boolean {
    return this.situacao !== 'retirado'
  }
  localDoAluno(): string | undefined {
    return this.localInformado?.descricao()
  }

  podeAvisarQueEstaIndo(agora: HoraDoDia): boolean {
    return this.situacao === 'reservado' && this.janela.contem(agora)
  }

  avisarQueEstaIndo(local: LocalDoCampus, agora: HoraDoDia): void {
    if (this.situacao !== 'reservado') {
      throw new TransicaoDePedidoInvalidaError('A cantina já foi avisada sobre este pedido.')
    }
    if (!this.janela.contem(agora)) {
      throw new TransicaoDePedidoInvalidaError(
        `Você só pode avisar que está indo dentro da sua janela (${this.janela.descricao()}).`,
      )
    }
    this.localInformado = local
    this.situacao = 'aluno-a-caminho'
  }

  marcarPronto(): void {
    if (this.situacao === 'pronto') return
    if (this.situacao === 'retirado') {
      throw new TransicaoDePedidoInvalidaError('Pedido já foi retirado.')
    }
    this.situacao = 'pronto'
  }

  marcarRetirado(): void {
    if (this.situacao !== 'pronto') {
      throw new TransicaoDePedidoInvalidaError('Só é possível retirar um pedido pronto.')
    }
    this.situacao = 'retirado'
  }
}
