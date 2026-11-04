import { describe, expect, it } from 'vitest'
import { EstoqueFalso, PedidosFalsos, umItem, umLocal } from '../__testes__/fabricas'
import { Comanda } from '../comanda/Comanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { Cobranca } from '../pagamento/Cobranca'
import { Pedido } from '../pedido/Pedido'
import { JanelaDeRetirada } from '../reserva/JanelaDeRetirada'
import { RelogioFixo } from '../tempo/Relogio'
import { ControleDeEstoque } from './ControleDeEstoque'
import { PrevisorDeChegada, ServicoDeAtendimento } from './ServicoDeAtendimento'
import { ServicoDeRetirada } from './ServicoDeRetirada'
import { CardapioFalso } from '../__testes__/fabricas'

const comanda = Comanda.de(19)
const novoPedido = () =>
  new Pedido(
    comanda,
    umItem({ id: 'pastel', nome: 'Pastel' }),
    2,
    JanelaDeRetirada.criar(HoraDoDia.de(20, 15), 20),
    Cobranca.pendente(Dinheiro.reais(19), 'Pague no balcão'),
    'Pagar na retirada',
  )

describe('ServicoDeRetirada (lado do aluno)', () => {
  it('dentro da janela: o play grava o pedido "a caminho" no repositório compartilhado', () => {
    const pedidos = new PedidosFalsos()
    pedidos.salvar(novoPedido())
    const servico = new ServicoDeRetirada(pedidos, RelogioFixo.as(20, 20))

    const pedido = servico.acompanhar(comanda)!
    expect(servico.podeAvisar(pedido)).toBe(true)
    servico.estouIndoBuscar(pedido, umLocal('Biblioteca', 1, 'Brum · Bloco A'))

    // Uma leitura NOVA (como faria o app da cantina) já vê a mudança.
    const visto = pedidos.buscarPorComanda(comanda)!
    expect(visto.situacaoAtual()).toBe('a-caminho')
    expect(visto.localDoAluno()).toBe('Brum · Bloco A · Biblioteca')
  })

  it('fora da janela: não muda nada', () => {
    const pedidos = new PedidosFalsos()
    pedidos.salvar(novoPedido())
    const servico = new ServicoDeRetirada(pedidos, RelogioFixo.as(20, 0))
    const pedido = servico.acompanhar(comanda)!
    expect(() => servico.estouIndoBuscar(pedido, umLocal('Sala 001', 1))).toThrow()
    expect(pedidos.buscarPorComanda(comanda)!.situacaoAtual()).toBe('reservado')
  })
})

describe('ServicoDeAtendimento (lado da cantina)', () => {
  it('lista quem está a caminho primeiro, entrega e cancela devolvendo o estoque', () => {
    const pedidos = new PedidosFalsos()
    const estoque = new EstoqueFalso({ pastel: 0 })
    const atendimento = new ServicoDeAtendimento(pedidos, estoque)

    const reservado = new Pedido(Comanda.de(20), umItem({ id: 'pastel' }), 1,
      JanelaDeRetirada.criar(HoraDoDia.de(20, 0), 15), Cobranca.paga(Dinheiro.reais(9), 'Pix'), 'Pix agora')
    const aCaminho = novoPedido()
    aCaminho.avisarQueEstaIndo(umLocal('Sala 001', 1), new Date(2026, 10, 4, 20, 20))
    pedidos.salvar(reservado)
    pedidos.salvar(aCaminho)

    expect(atendimento.listarPedidos().map((p) => p.numeroDaComanda())).toEqual(['019', '020'])

    atendimento.marcarEntregue(comanda)
    expect(pedidos.buscarPorComanda(comanda)!.situacaoAtual()).toBe('entregue')

    atendimento.cancelar(Comanda.de(20))
    expect(pedidos.buscarPorComanda(Comanda.de(20))!.situacaoAtual()).toBe('cancelado')
    expect(estoque.quantidadeDe('pastel')).toBe(1)
  })

  it('o previsor de chegada usa só a ida', () => {
    const pedido = novoPedido()
    pedido.avisarQueEstaIndo(umLocal('Recepção', 3), new Date(2026, 10, 4, 20, 20))
    const previsao = new PrevisorDeChegada().prever(pedido)!
    expect((previsao.fim - previsao.inicio) / 60_000).toBe(3)
  })
})

describe('ControleDeEstoque', () => {
  it('lista em ordem alfabética, soma, subtrai e não fica negativo', () => {
    const estoque = new EstoqueFalso({ a: 1, b: 0 })
    const controle = new ControleDeEstoque(
      new CardapioFalso([umItem({ id: 'b', nome: 'Brownie' }), umItem({ id: 'a', nome: 'Água' })]),
      estoque,
    )
    expect(controle.listar().map((l) => [l.item.nome(), l.quantidade])).toEqual([['Água', 1], ['Brownie', 0]])
    controle.aumentar('b')
    controle.diminuir('a')
    controle.diminuir('a')
    expect(estoque.quantidades).toEqual({ a: 0, b: 1 })
  })
})
