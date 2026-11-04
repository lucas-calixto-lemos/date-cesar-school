import { describe, expect, it } from 'vitest'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import { RelogioAjustavel, RelogioFixo } from './Relogio'

describe('RelogioAjustavel (usado pelo debug)', () => {
  it('sem ajuste, devolve o horário do relógio base', () => {
    const relogio = new RelogioAjustavel(RelogioFixo.as(14, 30))
    expect(HoraDoDia.deData(relogio.agora()).toString()).toBe('14:30')
    expect(relogio.estaAjustado()).toBe(false)
  })

  it('ajusta para um horário e continua andando junto com o base', () => {
    const base = RelogioFixo.as(14, 30)
    const relogio = new RelogioAjustavel(base)
    relogio.ajustarPara(HoraDoDia.de(20, 15))
    expect(HoraDoDia.deData(relogio.agora()).toString()).toBe('20:15')
    base.avancarMinutos(3)
    expect(HoraDoDia.deData(relogio.agora()).toString()).toBe('20:18')
  })

  it('avança minutos e volta ao real', () => {
    const relogio = new RelogioAjustavel(RelogioFixo.as(14, 30))
    relogio.avancarMinutos(10)
    expect(HoraDoDia.deData(relogio.agora()).toString()).toBe('14:40')
    relogio.voltarAoHorarioReal()
    expect(HoraDoDia.deData(relogio.agora()).toString()).toBe('14:30')
  })
})
