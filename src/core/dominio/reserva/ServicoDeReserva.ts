import type { CardapioRepository } from '../cardapio/CardapioRepository'
import type { Estoque } from '../cantina/portas'
import type { GeradorDeComanda } from '../comanda/GeradorDeComanda'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { FormaDePagamento } from '../pagamento/FormaDePagamento'
import { Pedido } from '../pedido/Pedido'
import type { RepositorioDePedidos } from '../pedido/RepositorioDePedidos'
import type { JanelaDeRetirada } from './JanelaDeRetirada'
import type { RegraDeReserva } from './RegraDeReserva'

export class ItemEsgotadoError extends ErroDeDominio {}
export class ReservaBloqueadaError extends ErroDeDominio {}

export interface SolicitacaoDeReserva {
  itemId: string
  quantidade: number
  janela: JanelaDeRetirada
  formaDePagamento: FormaDePagamento
}

/** Caso de uso: o aluno reserva um item para retirar numa janela. */
export class ServicoDeReserva {
  // PRINCÍPIO: Inversão de Dependências — todas as colaborações chegam por
  // construtor como abstrações; o serviço não sabe se o cardápio é em memória,
  // de onde vem o estoque, qual regra bloqueia ou qual forma de pagamento foi escolhida.
  constructor(
    private readonly cardapio: CardapioRepository,
    private readonly regra: RegraDeReserva,
    private readonly geradorDeComanda: GeradorDeComanda,
    private readonly pedidos: RepositorioDePedidos,
    private readonly estoque: Estoque,
  ) {}

  reservar(solicitacao: SolicitacaoDeReserva): Pedido {
    const motivo = this.regra.motivoDoBloqueio()
    if (motivo) throw new ReservaBloqueadaError(motivo)

    const item = this.cardapio.buscarPorId(solicitacao.itemId)
    if (!item) throw new ErroDeDominio('Item não encontrado.')
    const disponivel = this.estoque.quantidadeDe(item.id())
    if (disponivel <= 0) throw new ItemEsgotadoError(`${item.nome()} está esgotado.`)
    if (solicitacao.quantidade > disponivel) {
      throw new ItemEsgotadoError(`Só ${disponivel === 1 ? 'resta 1 unidade' : `restam ${disponivel} unidades`} de ${item.nome()}.`)
    }

    // A janela já chega válida (ela se valida sozinha); aqui só a usamos.
    const comanda = this.geradorDeComanda.proxima()
    const valor = item.precoPara(solicitacao.quantidade)

    // PRINCÍPIO: Aberto/Fechado + Liskov — polimorfismo puro: nenhum if por tipo.
    const forma = solicitacao.formaDePagamento
    const cobranca = forma.cobrar(valor, comanda.formatada())

    const pedido = new Pedido(comanda, item, solicitacao.quantidade, solicitacao.janela, cobranca, forma.nome)
    this.estoque.retirar(item.id(), solicitacao.quantidade)
    this.pedidos.salvar(pedido)
    return pedido
  }
}
