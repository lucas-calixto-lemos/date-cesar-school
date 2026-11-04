import { describe, expect, it } from 'vitest'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import { LocalDoCampus } from './LocalDoCampus'
import { Bloco, Predio } from './Predio'

const sala = (nome: string, minutos = 1) =>
  LocalDoCampus.criar({ id: nome, nome, minutosAteACantina: minutos, contexto: 'Brum · Bloco A' })

describe('LocalDoCampus', () => {
  it('tem nome curto para o botão e descrição completa para a cantina', () => {
    const local = sala('Sala 110')
    expect(local.nome).toBe('Sala 110')
    expect(local.descricao()).toBe('Brum · Bloco A · Sala 110')
  })

  it('conta ida e volta no deslocamento', () => {
    expect(sala('Sala 201', 3).minutosDeIdaEVolta()).toBe(6)
  })

  it('recusa tempo negativo', () => {
    expect(() => LocalDoCampus.criar({ id: 'x', nome: 'X', minutosAteACantina: -1 })).toThrow(ErroDeDominio)
  })
})

describe('Predio e Bloco', () => {
  it('prédio em desenvolvimento aparece, mas não está disponível nem tem blocos', () => {
    const apolo = Predio.emDesenvolvimento('apolo', 'Apolo')
    expect(apolo.estaDisponivel()).toBe(false)
    expect(apolo.blocos()).toEqual([])
  })

  it('prédio com blocos está disponível', () => {
    const brum = Predio.comBlocos('brum', 'Brum', [new Bloco('a', 'Bloco A', 'Perto', [sala('Sala 001')])])
    expect(brum.estaDisponivel()).toBe(true)
    expect(brum.blocos()[0].locais()[0].nome).toBe('Sala 001')
  })

  it('não aceita prédio disponível sem blocos nem bloco sem locais', () => {
    expect(() => Predio.comBlocos('brum', 'Brum', [])).toThrow(ErroDeDominio)
    expect(() => new Bloco('a', 'Bloco A', 'Perto', [])).toThrow(ErroDeDominio)
  })

  it('a lista devolvida é uma cópia (ocultamento de informação)', () => {
    const bloco = new Bloco('a', 'Bloco A', 'Perto', [sala('Sala 001')])
    bloco.locais().push(sala('Intrusa'))
    expect(bloco.locais()).toHaveLength(1)
  })
})
