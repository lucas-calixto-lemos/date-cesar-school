import { describe, expect, it } from 'vitest'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { JanelaDeRetirada, JanelaInvalidaError } from './JanelaDeRetirada'

const h = HoraDoDia.de

describe('JanelaDeRetirada (objeto de valor que se valida sozinho)', () => {
  it('aceita a janela mínima válida: 20:00 por 15 minutos', () => {
    const janela = JanelaDeRetirada.criar(h(20, 0), 15)
    expect(janela.descricao()).toBe('20:00 – 20:15')
  })

  it('aceita o último início (21:15) com a duração máxima (30)', () => {
    expect(JanelaDeRetirada.criar(h(21, 15), 30).fim().toString()).toBe('21:45')
  })

  it.each([
    ['antes das 20:00', h(19, 55), 15],
    ['depois das 21:15', h(21, 20), 15],
    ['fora do passo de 5 minutos', h(20, 7), 15],
    ['duração menor que 15', h(20, 0), 10],
    ['duração maior que 30', h(20, 0), 35],
    ['duração fora do passo de 5', h(20, 0), 17],
  ])('recusa início/duração %s', (_caso, inicio, duracao) => {
    expect(() => JanelaDeRetirada.criar(inicio, duracao)).toThrow(JanelaInvalidaError)
  })

  it('oferece exatamente as opções válidas para a UI', () => {
    const inicios = JanelaDeRetirada.iniciosPossiveis()
    expect(inicios[0].toString()).toBe('20:00')
    expect(inicios[inicios.length - 1].toString()).toBe('21:15')
    expect(inicios).toHaveLength(16)
    expect(JanelaDeRetirada.duracoesPossiveis()).toEqual([15, 20, 25, 30])
    // Toda opção oferecida precisa ser aceita pela própria validação.
    inicios.forEach((inicio) =>
      JanelaDeRetirada.duracoesPossiveis().forEach((d) =>
        expect(() => JanelaDeRetirada.criar(inicio, d)).not.toThrow(),
      ),
    )
  })

  it('sabe se um horário está antes, durante ou depois (fim excluso)', () => {
    const janela = JanelaDeRetirada.criar(h(20, 15), 20) // 20:15–20:35
    expect(janela.momento(h(20, 14))).toBe('antes')
    expect(janela.momento(h(20, 15))).toBe('durante')
    expect(janela.momento(h(20, 34))).toBe('durante')
    expect(janela.momento(h(20, 35))).toBe('depois')
  })
})
