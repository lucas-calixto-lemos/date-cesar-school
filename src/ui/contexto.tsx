import { createContext, useContext } from 'react'
import type { ServicosDoAluno } from '../app/composicao'
import type { ControleDeRelogio } from '../dominio/tempo/Relogio'

export interface ContextoDoApp {
  // PRINCÍPIO: Segregação de Interfaces — as telas do aluno recebem só
  // ServicosDoAluno; o painel da cantina nem existe aqui.
  aluno: ServicosDoAluno
  controleDeRelogio: ControleDeRelogio
  /** Instante atual (vem do Relogio injetado; muda a cada segundo). */
  agora: Date
  /** Força a releitura do relógio (após ajuste no debug). */
  atualizar(): void
}

export const Contexto = createContext<ContextoDoApp | null>(null)

export function useApp(): ContextoDoApp {
  const valor = useContext(Contexto)
  if (!valor) throw new Error('useApp precisa estar dentro de <Contexto.Provider>')
  return valor
}
