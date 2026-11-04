import { describe, expect, it } from 'vitest'
import { Dinheiro } from '../compartilhado/Dinheiro'
import type { FormaDePagamento } from './FormaDePagamento'
import { FormaDePagamentoDesconhecidaError, RegistroDeFormasDePagamento } from './RegistroDeFormasDePagamento'

// Carrega TODAS as formas existentes na pasta — inclusive as que forem criadas depois.
const modulos = import.meta.glob<{ default: new () => FormaDePagamento }>('./formas/*.ts', { eager: true })
const formas = Object.values(modulos).map((m) => new m.default())

// PRINCÍPIO: Substituição de Liskov — um único teste de contrato roda para cada
// forma de pagamento. Uma forma nova que quebre o contrato quebra este teste.
describe.each(formas.map((f) => [f.nome, f] as const))('Contrato de FormaDePagamento: %s', (_nome, forma) => {
  it('tem id, nome e descrição preenchidos', () => {
    expect(forma.id.trim()).not.toBe('')
    expect(forma.nome.trim()).not.toBe('')
    expect(forma.descricao.trim()).not.toBe('')
  })

  it('cobra devolvendo uma Cobranca com o mesmo valor, sem lançar', () => {
    const valor = Dinheiro.reais(16.5)
    const cobranca = forma.cobrar(valor, '019')
    expect(cobranca.valor().igualA(valor)).toBe(true)
    expect(typeof cobranca.estaPaga()).toBe('boolean')
    expect(cobranca.resumo().trim()).not.toBe('')
  })
})

describe('RegistroDeFormasDePagamento', () => {
  it('tem pelo menos as duas formas da PoC, com ids únicos', () => {
    const registro = new RegistroDeFormasDePagamento()
    formas.forEach((f) => registro.registrar(f))
    const ids = registro.listar().map((f) => f.id)
    expect(ids).toEqual(expect.arrayContaining(['na-retirada', 'pix-simulado']))
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('recusa id duplicado e id desconhecido', () => {
    const registro = new RegistroDeFormasDePagamento()
    registro.registrar(formas[0])
    expect(() => registro.registrar(formas[0])).toThrow()
    expect(() => registro.buscar('cartao')).toThrow(FormaDePagamentoDesconhecidaError)
  })
})
