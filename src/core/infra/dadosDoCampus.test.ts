import { describe, expect, it } from 'vitest'
import { MapaDoCampusEmMemoria } from './dadosDoCampus'

const mapa = new MapaDoCampusEmMemoria()
const nomes = (lista: { nome: string }[]) => lista.map((x) => x.nome)

describe('Mapa do campus (dados da PoC)', () => {
  it('tem Brum, Apolo e Tiradentes, nessa ordem', () => {
    expect(nomes(mapa.predios())).toEqual(['Brum', 'Apolo', 'Tiradentes'])
  })

  it('Apolo e Tiradentes estão em desenvolvimento', () => {
    const [, apolo, tiradentes] = mapa.predios()
    expect(apolo.estaDisponivel()).toBe(false)
    expect(tiradentes.estaDisponivel()).toBe(false)
  })

  it('Brum tem Bloco A (perto) e Bloco B (longe) com os locais combinados', () => {
    const [brum] = mapa.predios()
    const [a, b] = brum.blocos()
    expect(nomes(a.locais())).toEqual([
      'Sala 001', 'Sala 002', 'Sala 110', 'Sala 111', 'Sala 112', 'Sala 113', 'Sala 114', 'Sala 115',
      'Biblioteca', 'Sala de estudos',
    ])
    expect(nomes(b.locais())).toEqual([
      'Sala 201', 'Sala 202', 'Sala 210', 'Sala 211', 'Sala 212', 'Sala 213', 'Sala 214', 'Sala 215',
      'Área externa', 'Recepção',
    ])
    // Bloco A é mais perto da cantina que o Bloco B.
    expect(a.locais()[0].minutosDeIdaEVolta()).toBeLessThan(b.locais()[0].minutosDeIdaEVolta())
    expect(a.locais()[0].descricao()).toBe('Brum · Bloco A · Sala 001')
  })

  it('todos os locais têm id único', () => {
    const ids = mapa.predios().flatMap((p) => p.blocos()).flatMap((b) => b.locais()).map((l) => l.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
