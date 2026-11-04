import { describe, expect, it } from 'vitest'
import { FilaFalsa, umItem } from '../__testes__/fabricas'
import { LocalDoCampus } from '../campus/LocalDoCampus'
import { ClassificadorDeChance, NivelDeChance } from './ClassificadorDeChance'
import { TempoDaFila, TempoDeDeslocamento, TempoDePreparo, TempoDosPedidosReservados } from './componentes'
import type { ComponenteDeTempo } from './EstimadorDeTempo'
import { EstimadorPorComposicao } from './EstimadorPorComposicao'
import { ServicoDeEstimativa } from './ServicoDeEstimativa'

const item = umItem({ minutosDePreparo: 4 })
const biblioteca = LocalDoCampus.porId('biblioteca') // 4 min até a cantina → 8 ida e volta

describe('EstimadorPorComposicao', () => {
  it('soma as parcelas de cada componente', () => {
    const fila = new FilaFalsa(6, 4) // 6 pessoas × 0,5 + 4 reservas × 0,25
    const estimador = new EstimadorPorComposicao([
      new TempoDaFila(fila),
      new TempoDosPedidosReservados(fila),
      new TempoDePreparo(),
      new TempoDeDeslocamento(),
    ])
    const estimativa = estimador.estimar({ item, local: biblioteca })
    expect(estimativa.parcelas.map((p) => p.minutos)).toEqual([3, 1, 4, 8])
    expect(estimativa.minutosNecessarios).toBe(16)
  })

  it('aceita um componente novo sem mudar o estimador', () => {
    const chuva: ComponenteDeTempo = { calcular: () => ({ descricao: 'Chuva', minutos: 2.5 }) }
    const estimativa = new EstimadorPorComposicao([new TempoDePreparo(), chuva]).estimar({ item, local: biblioteca })
    expect(estimativa.minutosNecessarios).toBe(7) // 4 + 2,5 = 6,5 → arredonda para cima
  })
})

describe('ClassificadorDeChance (5 níveis pela folga)', () => {
  const classificador = new ClassificadorDeChance()
  it.each([
    [10, 9, NivelDeChance.NAO_DA], //        folga -1
    [10, 10, NivelDeChance.MUITO_ARRISCADO], // 0
    [10, 11, NivelDeChance.MUITO_ARRISCADO], // 1
    [10, 12, NivelDeChance.APERTADO], //        2
    [10, 13, NivelDeChance.APERTADO], //        3
    [10, 14, NivelDeChance.PROVAVELMENTE_DA], // 4
    [10, 16, NivelDeChance.PROVAVELMENTE_DA], // 6
    [10, 17, NivelDeChance.VAI_DAR], //          7
  ])('precisa %i min, restam %i → %o', (necessarios, restantes, esperado) => {
    expect(classificador.classificar(necessarios, restantes)).toBe(esperado)
  })

  it('tem exatamente 5 níveis', () => {
    expect(NivelDeChance.todos().map((n) => n.titulo)).toEqual([
      'Não dá',
      'Muito arriscado',
      'Apertado',
      'Provavelmente dá',
      'Vai dar',
    ])
  })
})

describe('ServicoDeEstimativa', () => {
  const servico = new ServicoDeEstimativa(
    new EstimadorPorComposicao([new TempoDePreparo(), new TempoDeDeslocamento()]),
    new ClassificadorDeChance(),
  )

  it('junta estimativa e classificação', () => {
    // 4 preparo + 8 deslocamento = 12; restam 15 → folga 3 → Apertado
    const resposta = servico.responder({ item, local: biblioteca, minutosDeIntervaloRestantes: 15 })
    expect(resposta.estimativa.minutosNecessarios).toBe(12)
    expect(resposta.folgaEmMinutos).toBe(3)
    expect(resposta.nivel).toBe(NivelDeChance.APERTADO)
  })

  it('valida os minutos restantes', () => {
    expect(() => servico.responder({ item, local: biblioteca, minutosDeIntervaloRestantes: -1 })).toThrow()
    expect(() => servico.responder({ item, local: biblioteca, minutosDeIntervaloRestantes: 31 })).toThrow()
  })
})
