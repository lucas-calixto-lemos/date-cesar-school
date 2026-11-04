import { LocalDoCampus } from '../dominio/campus/LocalDoCampus'
import type { MapaDoCampus } from '../dominio/campus/MapaDoCampus'
import { Bloco, Predio } from '../dominio/campus/Predio'

/**
 * Mapa do campus usado na PoC.
 * Tempos até a cantina são estimativas: o Bloco A do Brum é o mais próximo.
 * Para ajustar um tempo ou incluir um local, mexa só aqui.
 */
function bloco(
  predio: string,
  id: string,
  nome: string,
  referencia: string,
  minutosAteACantina: number,
  locais: string[],
): Bloco {
  const contexto = `${predio} · ${nome}`
  return new Bloco(
    id,
    nome,
    referencia,
    locais.map((nomeDoLocal) =>
      LocalDoCampus.criar({
        id: `${id}-${nomeDoLocal.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`,
        nome: nomeDoLocal,
        minutosAteACantina,
        contexto,
      }),
    ),
  )
}

const salas = (...numeros: string[]) => numeros.map((n) => `Sala ${n}`)

export const PREDIOS: Predio[] = [
  Predio.comBlocos('brum', 'Brum', [
    bloco('Brum', 'brum-a', 'Bloco A', 'Mais perto da cantina', 1, [
      ...salas('001', '002', '110', '111', '112', '113', '114', '115'),
      'Biblioteca',
      'Sala de estudos',
    ]),
    bloco('Brum', 'brum-b', 'Bloco B', 'Mais longe da cantina', 3, [
      ...salas('201', '202', '210', '211', '212', '213', '214', '215'),
      'Área externa',
      'Recepção',
    ]),
  ]),
  Predio.emDesenvolvimento('apolo', 'Apolo'),
  Predio.emDesenvolvimento('tiradentes', 'Tiradentes'),
]

export class MapaDoCampusEmMemoria implements MapaDoCampus {
  constructor(private readonly _predios: Predio[] = PREDIOS) {}

  predios(): Predio[] {
    return [...this._predios]
  }
}
