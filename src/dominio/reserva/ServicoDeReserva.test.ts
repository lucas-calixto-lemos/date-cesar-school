import { beforeEach, describe, expect, it } from 'vitest'
import { CardapioFalso, PedidosFalsos, umItem } from '../__testes__/fabricas'
import { GeradorSequencialDeComanda } from '../comanda/GeradorDeComanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { Cobranca } from '../pagamento/Cobranca'
import type { FormaDePagamento } from '../pagamento/FormaDePagamento'
import PagamentoNaRetirada from '../pagamento/formas/PagamentoNaRetirada'
import PagamentoPixSimulado from '../pagamento/formas/PagamentoPixSimulado'
import { RelogioFixo } from '../tempo/Relogio'
import { HorarioLimiteDeReserva, ReservasEncerradasError } from './HorarioLimiteDeReserva'
import { JanelaDeRetirada } from './JanelaDeRetirada'
import { ItemEsgotadoError, ServicoDeReserva } from './ServicoDeReserva'

describe('HorarioLimiteDeReserva (19h) com relógio injetado', () => {
  it('está aberto às 18:59 e informa quanto falta', () => {
    const limite = new HorarioLimiteDeReserva(RelogioFixo.as(18, 59))
    expect(limite.estaAberta()).toBe(true)
    expect(limite.msRestantes()).toBe(60_000)
  })

  it('fecha exatamente às 19:00 e lança erro de domínio', () => {
    const limite = new HorarioLimiteDeReserva(RelogioFixo.as(19, 0))
    expect(limite.estaAberta()).toBe(false)
    expect(() => limite.garantirQueEstaAberta()).toThrow(ReservasEncerradasError)
  })

  it('o horário limite é configurável', () => {
    const limite = new HorarioLimiteDeReserva(RelogioFixo.as(19, 30), HoraDoDia.de(20, 0))
    expect(limite.estaAberta()).toBe(true)
  })
})

describe('ServicoDeReserva', () => {
  let relogio: RelogioFixo
  let pedidos: PedidosFalsos
  let servico: ServicoDeReserva
  const janela = JanelaDeRetirada.criar(HoraDoDia.de(20, 15), 20)
  const cardapio = new CardapioFalso([
    umItem({ id: 'coxinha', preco: Dinheiro.reais(8) }),
    umItem({ id: 'bolo', nome: 'Bolo de pote', disponivel: false }),
  ])

  beforeEach(() => {
    relogio = RelogioFixo.as(14, 0)
    pedidos = new PedidosFalsos()
    servico = new ServicoDeReserva(
      cardapio,
      new HorarioLimiteDeReserva(relogio),
      new GeradorSequencialDeComanda(18),
      pedidos,
    )
  })

  it('reserva, gera comanda de 3 dígitos e salva o pedido', () => {
    const pedido = servico.reservar({
      itemId: 'coxinha',
      quantidade: 2,
      janela,
      formaDePagamento: new PagamentoNaRetirada(),
    })
    expect(pedido.numeroDaComanda()).toBe('019')
    expect(pedido.total().valorEmCentavos()).toBe(1600)
    expect(pedido.estaPago()).toBe(false)
    expect(pedidos.salvos).toContain(pedido)
  })

  it('com Pix simulado o pedido já nasce pago e com QR', () => {
    const pedido = servico.reservar({ itemId: 'coxinha', quantidade: 1, janela, formaDePagamento: new PagamentoPixSimulado() })
    expect(pedido.estaPago()).toBe(true)
    expect(pedido.codigoQrDoPagamento()).toContain('019')
  })

  it('aceita QUALQUER forma de pagamento nova sem mudar o serviço (Aberto/Fechado)', () => {
    class ValeRefeicaoDeTeste implements FormaDePagamento {
      readonly id = 'vale'
      readonly nome = 'Vale'
      readonly descricao = 'Forma criada só no teste'
      cobrar(valor: Dinheiro) {
        return Cobranca.paga(valor, 'Pago com vale')
      }
    }
    const pedido = servico.reservar({ itemId: 'coxinha', quantidade: 1, janela, formaDePagamento: new ValeRefeicaoDeTeste() })
    expect(pedido.resumoDoPagamento()).toBe('Pago com vale')
  })

  it('bloqueia depois das 19h', () => {
    relogio.avancarMinutos(5 * 60 + 1) // 19:01
    expect(() =>
      servico.reservar({ itemId: 'coxinha', quantidade: 1, janela, formaDePagamento: new PagamentoNaRetirada() }),
    ).toThrow(ReservasEncerradasError)
    expect(pedidos.salvos).toHaveLength(0)
  })

  it('não reserva item esgotado', () => {
    expect(() =>
      servico.reservar({ itemId: 'bolo', quantidade: 1, janela, formaDePagamento: new PagamentoNaRetirada() }),
    ).toThrow(ItemEsgotadoError)
  })

  it('valida a quantidade (1 a 5)', () => {
    expect(() =>
      servico.reservar({ itemId: 'coxinha', quantidade: 6, janela, formaDePagamento: new PagamentoNaRetirada() }),
    ).toThrow()
  })
})
