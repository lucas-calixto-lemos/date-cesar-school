import { describe, expect, it } from 'vitest'
import { CardapioFalso, umItem } from '../__testes__/fabricas'
import { ConsultaDeCardapio, ItemNaoEncontradoError } from './ConsultaDeCardapio'

const consulta = new ConsultaDeCardapio(
  new CardapioFalso([
    umItem({ id: 'tapioca', nome: 'Tapioca' }),
    umItem({ id: 'agua', nome: 'Água mineral', categoria: 'bebida' }),
    umItem({ id: 'pao', nome: 'Pão de queijo' }),
    umItem({ id: 'brownie', nome: 'Brownie', categoria: 'doce' }),
  ]),
)

describe('ConsultaDeCardapio', () => {
  it('lista em ordem alfabética respeitando acentos', () => {
    expect(consulta.listarEmOrdemAlfabetica().map((i) => i.nome())).toEqual([
      'Água mineral',
      'Brownie',
      'Pão de queijo',
      'Tapioca',
    ])
  })

  it('pesquisa ignorando acentos e maiúsculas', () => {
    expect(consulta.pesquisar('PAO').map((i) => i.id())).toEqual(['pao'])
    expect(consulta.pesquisar('agua').map((i) => i.id())).toEqual(['agua'])
  })

  it('filtra por categoria', () => {
    expect(consulta.pesquisar('', 'doce').map((i) => i.id())).toEqual(['brownie'])
  })

  it('lança erro de domínio para id inexistente', () => {
    expect(() => consulta.buscar('feijoada')).toThrow(ItemNaoEncontradoError)
  })
})
