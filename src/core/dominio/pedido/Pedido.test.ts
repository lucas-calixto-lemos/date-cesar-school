import { describe, expect, it } from 'vitest'
import { as, umItem, umLocal } from '../__testes__/fabricas'
import { Comanda } from '../comanda/Comanda'
import { GeradorSequencialDeComanda } from '../comanda/GeradorDeComanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { TempoDeDeslocamento } from '../estimativa/componentes'
import { EstimadorPorComposicao } from '../estimativa/EstimadorPorComposicao'
import { Cobranca } from '../pagamento/Cobranca'
import { JanelaDeRetirada } from '../reserva/JanelaDeRetirada'
import { Pedido, TransicaoDePedidoInvalidaError } from './Pedido'

const h = HoraDoDia.de
const local = umLocal('Sala 201', 3, 'Brum · Bloco B')

function umPedido(cobranca = Cobranca.pendente(Dinheiro.reais(8), 'Pague no balcão')) {
  return new Pedido(Comanda.de(19), umItem(), 1, JanelaDeRetirada.criar(h(20, 15), 20), cobranca, 'Pagar na retirada')
}

describe('Pedido', () => {
  it('responde estaPago() delegando à cobrança (Demeter)', () => {
    expect(umPedido().estaPago()).toBe(false)
    expect(umPedido(Cobranca.paga(Dinheiro.reais(8), 'Pago')).estaPago()).toBe(true)
  })

  it('só deixa dar o play dentro da janela', () => {
    const pedido = umPedido()
    expect(pedido.podeAvisarQueEstaIndo(h(20, 10))).toBe(false)
    expect(() => pedido.avisarQueEstaIndo(local, as(20, 10))).toThrow(TransicaoDePedidoInvalidaError)
    pedido.avisarQueEstaIndo(local, as(20, 20))
    expect(pedido.situacaoAtual()).toBe('a-caminho')
    expect(pedido.localDoAluno()).toBe('Brum · Bloco B · Sala 201')
  })

  it('não deixa avisar duas vezes', () => {
    const pedido = umPedido()
    pedido.avisarQueEstaIndo(local, as(20, 20))
    expect(() => pedido.avisarQueEstaIndo(local, as(20, 21))).toThrow(TransicaoDePedidoInvalidaError)
  })

  it('reservado → a caminho → entregue; na entrega, quem devia paga no balcão', () => {
    const pedido = umPedido()
    pedido.avisarQueEstaIndo(local, as(20, 20))
    pedido.marcarEntregue()
    expect(pedido.situacaoAtual()).toBe('entregue')
    expect(pedido.estaPago()).toBe(true)
    expect(pedido.resumoDoPagamento()).toBe('Pago na retirada')
    expect(pedido.estaEmAberto()).toBe(false)
  })

  it('pode ser entregue mesmo sem o play (aluno foi direto ao balcão)', () => {
    const pedido = umPedido()
    pedido.marcarEntregue()
    expect(pedido.situacaoAtual()).toBe('entregue')
  })

  it('cancelado ou entregue não muda mais', () => {
    const pedido = umPedido()
    pedido.cancelar()
    expect(pedido.situacaoAtual()).toBe('cancelado')
    expect(() => pedido.marcarEntregue()).toThrow(TransicaoDePedidoInvalidaError)
    expect(() => pedido.cancelar()).toThrow(TransicaoDePedidoInvalidaError)
  })

  it('vira dados e volta igual (é assim que atravessa entre os apps)', () => {
    const original = umPedido(Cobranca.paga(Dinheiro.reais(8), 'Pago via Pix', 'QR'))
    original.avisarQueEstaIndo(local, as(20, 20))
    const copia = Pedido.restaurar(JSON.parse(JSON.stringify(original.paraDados())))
    expect(copia.paraDados()).toEqual(original.paraDados())
    expect(copia.numeroDaComanda()).toBe('019')
    expect(copia.localDoAluno()).toBe('Brum · Bloco B · Sala 201')
    expect(copia.codigoQrDoPagamento()).toBe('QR')
    expect(copia.nomeDaFormaDePagamento()).toBe('Pagar na retirada')
  })

  it('prevê a chegada a partir do play e do local (reusa o estimador)', () => {
    const pedido = umPedido()
    const soIda = new EstimadorPorComposicao([new TempoDeDeslocamento('ida')])
    expect(pedido.preverChegada(soIda)).toBeUndefined() // ainda não deu play
    pedido.avisarQueEstaIndo(local, as(20, 20))
    expect(pedido.preverChegada(soIda)).toEqual({
      inicio: as(20, 20).getTime(),
      fim: as(20, 23).getTime(), // Bloco B: 3 min de ida
    })
  })
})

describe('GeradorSequencialDeComanda', () => {
  it('gera números com 3 dígitos em sequência', () => {
    const gerador = new GeradorSequencialDeComanda(18)
    expect(gerador.proxima().formatada()).toBe('019')
    expect(gerador.proxima().formatada()).toBe('020')
  })

  it('volta para 001 depois de 999', () => {
    expect(new GeradorSequencialDeComanda(999).proxima().formatada()).toBe('001')
  })
})
