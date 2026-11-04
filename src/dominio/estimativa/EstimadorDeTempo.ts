import type { LocalDoCampus } from '../campus/LocalDoCampus'
import type { ItemDoCardapio } from '../cardapio/ItemDoCardapio'

export interface ContextoDaEstimativa {
  item: ItemDoCardapio
  local: LocalDoCampus
}

export interface ParcelaDeTempo {
  descricao: string
  minutos: number
}

export interface Estimativa {
  minutosNecessarios: number
  parcelas: ParcelaDeTempo[]
}

// PRINCÍPIO: Inversão de Dependências — quem pede uma estimativa depende desta
// interface, não de um algoritmo específico.
export interface EstimadorDeTempo {
  estimar(contexto: ContextoDaEstimativa): Estimativa
}

/** Uma parte do tempo total (fila, preparo, deslocamento...). */
export interface ComponenteDeTempo {
  calcular(contexto: ContextoDaEstimativa): ParcelaDeTempo
}
