import type { Comanda } from '../comanda/Comanda'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import { EstimadorPorComposicao } from '../estimativa/EstimadorPorComposicao'
import type { EstimadorDeTempo } from '../estimativa/EstimadorDeTempo'
import { TempoDeDeslocamento } from '../estimativa/componentes'
import type { Pedido, PrevisaoDeChegada, SituacaoDoPedido } from '../pedido/Pedido'
import type { RepositorioDePedidos } from '../pedido/RepositorioDePedidos'
import type { Estoque } from './portas'

export class PedidoNaoEncontradoError extends ErroDeDominio {}

/** Ordem em que a tia vê os pedidos: primeiro quem já está vindo. */
const PRIORIDADE: Record<SituacaoDoPedido, number> = { 'a-caminho': 0, reservado: 1, entregue: 2, cancelado: 3 }

/** Casos de uso da CANTINA sobre os pedidos. */
export class ServicoDeAtendimento {
  constructor(
    private readonly pedidos: RepositorioDePedidos,
    private readonly estoque: Estoque,
  ) {}

  listarPedidos(): Pedido[] {
    return this.pedidos.listarTodos().sort(
      (a, b) =>
        PRIORIDADE[a.situacaoAtual()] - PRIORIDADE[b.situacaoAtual()] ||
        a.inicioDaJanela().minutosAte(b.inicioDaJanela()) * -1 ||
        Number(a.numeroDaComanda()) - Number(b.numeroDaComanda()),
    )
  }

  marcarEntregue(comanda: Comanda): void {
    const pedido = this.buscar(comanda)
    pedido.marcarEntregue()
    this.pedidos.salvar(pedido)
  }

  /** Cancela e devolve as unidades ao estoque. */
  cancelar(comanda: Comanda): void {
    const pedido = this.buscar(comanda)
    pedido.cancelar()
    this.estoque.repor(pedido.idDoItem(), pedido.quantidade())
    this.pedidos.salvar(pedido)
  }

  private buscar(comanda: Comanda): Pedido {
    const pedido = this.pedidos.buscarPorComanda(comanda)
    if (!pedido) throw new PedidoNaoEncontradoError(`Pedido ${comanda.formatada()} não encontrado.`)
    return pedido
  }
}

/**
 * Quando o aluno que deu play chega ao balcão.
 */
// PRINCÍPIO: Composição em vez de Herança + reuso — é o MESMO EstimadorPorComposicao
// da tela "Estimar" do aluno, montado só com o componente de deslocamento (trecho "ida").
export class PrevisorDeChegada {
  constructor(
    private readonly estimador: EstimadorDeTempo = new EstimadorPorComposicao([new TempoDeDeslocamento('ida')]),
  ) {}

  prever(pedido: Pedido): PrevisaoDeChegada | undefined {
    return pedido.preverChegada(this.estimador)
  }
}
