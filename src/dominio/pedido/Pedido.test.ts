import { describe, expect, it } from 'vitest'
import { umItem, umLocal } from '../__testes__/fabricas'
import { Comanda } from '../comanda/Comanda'
import { GeradorSequencialDeComanda } from '../comanda/GeradorDeComanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { Cobranca } from '../pagamento/Cobranca'
import { JanelaDeRetirada } from '../reserva/JanelaDeRetirada'
import { Pedido, TransicaoDePedidoInvalidaError } from './Pedido'

const h = HoraDoDia.de
const local = umLocal('Sala 110', 1, 'Brum · Bloco A')

function umPedido(cobranca = Cobranca.pendente(Dinheiro.reais(8), 'Pague no balcão')) {
  return new Pedido(Comanda.de(19), umItem(), 1, JanelaDeRetirada.criar(h(20, 15), 20), cobranca)
}

describe('Pedido', () => {
  it('responde estaPago() delegando à cobrança (Demeter)', () => {
    expect(umPedido().estaPago()).toBe(false)
    expect(umPedido(Cobranca.paga(Dinheiro.reais(8), 'Pago')).estaPago()).toBe(true)
  })

  it('só deixa avisar "estou indo" dentro da janela', () => {
    const pedido = umPedido()
    expect(pedido.podeAvisarQueEstaIndo(h(20, 10))).toBe(false)
    expect(() => pedido.avisarQueEstaIndo(local, h(20, 10))).toThrow(TransicaoDePedidoInvalidaError)
    expect(pedido.podeAvisarQueEstaIndo(h(20, 20))).toBe(true)
    pedido.avisarQueEstaIndo(local, h(20, 20))
    expect(pedido.situacaoAtual()).toBe('aluno-a-caminho')
    expect(pedido.localDoAluno()).toBe('Brum · Bloco A · Sala 110')
  })

  it('não deixa avisar duas vezes', () => {
    const pedido = umPedido()
    pedido.avisarQueEstaIndo(local, h(20, 20))
    expect(() => pedido.avisarQueEstaIndo(local, h(20, 21))).toThrow(TransicaoDePedidoInvalidaError)
  })

  it('segue o ciclo reservado → a caminho → pronto → retirado', () => {
    const pedido = umPedido()
    expect(() => pedido.marcarRetirado()).toThrow(TransicaoDePedidoInvalidaError)
    pedido.avisarQueEstaIndo(local, h(20, 20))
    pedido.marcarPronto()
    expect(pedido.situacaoAtual()).toBe('pronto')
    pedido.marcarRetirado()
    expect(pedido.estaEmAberto()).toBe(false)
  })
})

describe('GeradorSequencialDeComanda', () => {
  it('gera números com 3 dígitos em sequência', () => {
    const gerador = new GeradorSequencialDeComanda(18)
    expect(gerador.proxima().formatada()).toBe('019')
    expect(gerador.proxima().formatada()).toBe('020')
  })

  it('volta para 001 depois de 999', () => {
    const gerador = new GeradorSequencialDeComanda(999)
    expect(gerador.proxima().formatada()).toBe('001')
  })
})
