import { beforeEach, describe, expect, it } from 'vitest'
import { CardapioFalso, EstoqueFalso, OperacaoFalsa, PedidosFalsos, umItem } from '../__testes__/fabricas'
import { GeradorSequencialDeComanda } from '../comanda/GeradorDeComanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { Cobranca } from '../pagamento/Cobranca'
import type { FormaDePagamento } from '../pagamento/FormaDePagamento'
import PagamentoNaRetirada from '../pagamento/formas/PagamentoNaRetirada'
import PagamentoPixSimulado from '../pagamento/formas/PagamentoPixSimulado'
import { RelogioFixo } from '../tempo/Relogio'
import { HorarioLimiteDeReserva } from './HorarioLimiteDeReserva'
import { JanelaDeRetirada } from './JanelaDeRetirada'
import {
  CantinaPrecisaEstarAberta,
  ReservasPrecisamEstarLiberadas,
  TodasAsRegras,
  type RegraDeReserva,
} from './RegraDeReserva'
import { ItemEsgotadoError, ReservaBloqueadaError, ServicoDeReserva } from './ServicoDeReserva'

describe('HorarioLimiteDeReserva (19h) com relógio injetado', () => {
  it('está aberto às 18:59 e informa quanto falta', () => {
    const limite = new HorarioLimiteDeReserva(RelogioFixo.as(18, 59))
    expect(limite.estaAberta()).toBe(true)
    expect(limite.msRestantes()).toBe(60_000)
    expect(limite.motivoDoBloqueio()).toBeNull()
  })

  it('fecha exatamente às 19:00 e explica o motivo', () => {
    const limite = new HorarioLimiteDeReserva(RelogioFixo.as(19, 0))
    expect(limite.estaAberta()).toBe(false)
    expect(limite.motivoDoBloqueio()).toMatch(/19:00/)
  })

  it('o horário limite é configurável', () => {
    expect(new HorarioLimiteDeReserva(RelogioFixo.as(19, 30), HoraDoDia.de(20, 0)).estaAberta()).toBe(true)
  })
})

describe('Regras de reserva (Composite)', () => {
  it('a primeira regra que bloqueia dá o motivo; sem bloqueio → null', () => {
    const operacao = new OperacaoFalsa()
    const regras = new TodasAsRegras([
      new CantinaPrecisaEstarAberta(operacao),
      new ReservasPrecisamEstarLiberadas(operacao),
    ])
    expect(regras.motivoDoBloqueio()).toBeNull()
    operacao.finalizarReservas()
    expect(regras.motivoDoBloqueio()).toMatch(/finalizou as reservas/)
    operacao.fecharCantina()
    expect(regras.motivoDoBloqueio()).toMatch(/fechada/)
  })

  it('aceita uma regra nova sem mudar nada (Aberto/Fechado)', () => {
    const feriado: RegraDeReserva = { motivoDoBloqueio: () => 'Feriado!' }
    expect(new TodasAsRegras([feriado]).motivoDoBloqueio()).toBe('Feriado!')
  })
})

describe('ServicoDeReserva', () => {
  let relogio: RelogioFixo
  let pedidos: PedidosFalsos
  let estoque: EstoqueFalso
  let operacao: OperacaoFalsa
  let servico: ServicoDeReserva
  const janela = JanelaDeRetirada.criar(HoraDoDia.de(20, 15), 20)
  const cardapio = new CardapioFalso([umItem({ id: 'coxinha', preco: Dinheiro.reais(8) })])

  beforeEach(() => {
    relogio = RelogioFixo.as(14, 0)
    pedidos = new PedidosFalsos()
    estoque = new EstoqueFalso({ coxinha: 3 })
    operacao = new OperacaoFalsa()
    const regra = new TodasAsRegras([
      new CantinaPrecisaEstarAberta(operacao),
      new ReservasPrecisamEstarLiberadas(operacao),
      new HorarioLimiteDeReserva(relogio),
    ])
    servico = new ServicoDeReserva(cardapio, regra, new GeradorSequencialDeComanda(18), pedidos, estoque)
  })

  const reservar = (quantidade = 1, formaDePagamento: FormaDePagamento = new PagamentoNaRetirada()) =>
    servico.reservar({ itemId: 'coxinha', quantidade, janela, formaDePagamento })

  it('reserva, gera comanda de 3 dígitos, salva e baixa o estoque', () => {
    const pedido = reservar(2)
    expect(pedido.numeroDaComanda()).toBe('019')
    expect(pedido.total().valorEmCentavos()).toBe(1600)
    expect(pedido.estaPago()).toBe(false)
    expect(pedido.nomeDaFormaDePagamento()).toBe('Pagar na retirada')
    expect(pedidos.listarTodos()).toHaveLength(1)
    expect(estoque.quantidadeDe('coxinha')).toBe(1)
  })

  it('com Pix simulado o pedido já nasce pago e com QR', () => {
    const pedido = reservar(1, new PagamentoPixSimulado())
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
    expect(reservar(1, new ValeRefeicaoDeTeste()).resumoDoPagamento()).toBe('Pago com vale')
  })

  it.each([
    ['depois das 19h', () => relogio.avancarMinutos(5 * 60 + 1), /19:00/],
    ['com a cantina fechada', () => operacao.fecharCantina(), /fechada/],
    ['com as reservas finalizadas', () => operacao.finalizarReservas(), /finalizou/],
  ])('bloqueia %s, com o motivo, sem gravar nada', (_caso, bloquear, motivo) => {
    bloquear()
    expect(() => reservar()).toThrow(ReservaBloqueadaError)
    expect(() => reservar()).toThrow(motivo)
    expect(pedidos.listarTodos()).toHaveLength(0)
    expect(estoque.quantidadeDe('coxinha')).toBe(3)
  })

  it('não reserva além do estoque e avisa quanto resta', () => {
    expect(() => reservar(4)).toThrow(/restam 3/)
    estoque.retirar('coxinha', 3)
    expect(() => reservar(1)).toThrow(ItemEsgotadoError)
  })

  it('valida a quantidade (1 a 5)', () => {
    estoque.repor('coxinha', 10)
    expect(() => reservar(6)).toThrow()
  })
})
