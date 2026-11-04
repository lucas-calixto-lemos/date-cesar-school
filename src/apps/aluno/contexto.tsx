import { createContext, useContext } from 'react'
import type { ServicosDoAluno } from '../../core/composicao/composicao'
import type { Tema } from './tema'

export interface ContextoDoApp {
  // PRINCÍPIO: Segregação de Interfaces — as telas do aluno recebem só
  // ServicosDoAluno; operações da cantina nem existem aqui.
  aluno: ServicosDoAluno
  /** Instante atual (vem do Relogio injetado; muda a cada segundo e a cada mudança de estado). */
  agora: Date
  tema: Tema
  alternarTema(): void
}

export const Contexto = createContext<ContextoDoApp | null>(null)

export function useApp(): ContextoDoApp {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useApp precisa estar dentro de <Contexto.Provider>')
  return valor
}
