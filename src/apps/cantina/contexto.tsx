import { createContext, useContext } from 'react'
import type { ServicosDaCantina } from '../../core/composicao/composicao'

export interface ContextoDaCantina {
  // PRINCÍPIO: Segregação de Interfaces — as telas da cantina recebem só
  // ServicosDaCantina (pedidos, entrega, estoque, abrir/fechar). Reservar e dar
  // play são do aluno e não existem aqui.
  cantina: ServicosDaCantina
  agora: Date
}

export const Contexto = createContext<ContextoDaCantina | null>(null)

export function useCantina(): ContextoDaCantina {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useCantina precisa estar dentro de <Contexto.Provider>')
  return valor
}
