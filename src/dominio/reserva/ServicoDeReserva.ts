import type { CardapioRepository } from '../cardapio/CardapioRepository'
import type { GeradorDeComanda } from '../comanda/GeradorDeComanda'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { FormaDePagamento } from '../pagamento/FormaDePagamento'
import { Pedido } from '../pedido/Pedido'
import type { RepositorioDePedidos } from '../pedido/RepositorioDePedidos'
import type { HorarioLimiteDeReserva } from './HorarioLimiteDeReserva'
import type { JanelaDeRetirada } from './JanelaDeRetirada'

export class ItemEsgotadoError extends ErroDeDominio {}

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
  // se a comanda é sequencial ou qual forma de pagamento foi escolhida.
  constructor(
    private readonly cardapio: CardapioRepository,
    private readonly horarioLimite: HorarioLimiteDeReserva,
    private readonly geradorDeComanda: GeradorDeComanda,
    private readonly pedidos: RepositorioDePedidos,
  ) {}

  reservar(solicitacao: SolicitacaoDeReserva): Pedido {
    this.horarioLimite.garantirQueEstaAberta()

    const item = this.cardapio.buscarPorId(solicitacao.itemId)
    if (!item) throw new ErroDeDominio('Item não encontrado.')
    if (item.estaEsgotado()) throw new ItemEsgotadoError(`${item.nome()} está esgotado.`)

    // A janela já chega válida (ela se valida sozinha); aqui só a usamos.
    const comanda = this.geradorDeComanda.proxima()
    const valor = item.precoPara(solicitacao.quantidade)

    // PRINCÍPIO: Aberto/Fechado + Liskov — polimorfismo puro: nenhum if por tipo.
    const cobranca = solicitacao.formaDePagamento.cobrar(valor, comanda.formatada())

    const pedido = new Pedido(comanda, item, solicitacao.quantidade, solicitacao.janela, cobranca)
    this.pedidos.salvar(pedido)
    return pedido
  }
}
