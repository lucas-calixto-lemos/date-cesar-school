import { describe, expect, it } from 'vitest'
import { Dinheiro } from './Dinheiro'
import { ErroDeDominio } from './ErroDeDominio'
import { HoraDoDia } from './HoraDoDia'

describe('Dinheiro', () => {
  it('guarda em centavos e evita erro de ponto flutuante', () => {
    const total = Dinheiro.reais(0.1).somar(Dinheiro.reais(0.2))
    expect(total.valorEmCentavos()).toBe(30)
  })

  it('formata no padrão brasileiro', () => {
    expect(Dinheiro.reais(6.5).formatar()).toBe('R$ 6,50')
    expect(Dinheiro.reais(1234.5).formatar()).toBe('R$ 1.234,50')
  })

  it('multiplica por quantidade inteira', () => {
    expect(Dinheiro.reais(7.5).multiplicar(3).valorEmCentavos()).toBe(2250)
    expect(() => Dinheiro.reais(1).multiplicar(1.5)).toThrow(ErroDeDominio)
  })

  it('não aceita valor negativo', () => {
    expect(() => Dinheiro.reais(-1)).toThrow(ErroDeDominio)
  })
})

describe('HoraDoDia', () => {
  it('formata com dois dígitos', () => {
    expect(HoraDoDia.de(9, 5).toString()).toBe('09:05')
  })

  it('compara e calcula diferença', () => {
    const a = HoraDoDia.de(20, 0)
    const b = HoraDoDia.de(20, 25)
    expect(a.ehAntesDe(b)).toBe(true)
    expect(a.minutosAte(b)).toBe(25)
    expect(b.minutosAte(a)).toBe(-25)
  })

  it('lê texto HH:MM', () => {
    expect(HoraDoDia.deTexto('20:15').igualA(HoraDoDia.de(20, 15))).toBe(true)
    expect(() => HoraDoDia.deTexto('25:00')).toThrow(ErroDeDominio)
    expect(() => HoraDoDia.deTexto('abc')).toThrow(ErroDeDominio)
  })

  it('não deixa sair do dia', () => {
    expect(() => HoraDoDia.de(23, 50).somarMinutos(15)).toThrow(ErroDeDominio)
  })
})
