import { useEffect, useState } from 'react'
import type { Relogio } from '../core/dominio/tempo/Relogio'

interface FonteAoVivo {
  relogio: Relogio
  /** Observer do estado compartilhado (vem dos serviços de cada app). */
  aoMudar(ouvinte: () => void): () => void
}

/**
 * Faz a tela re-renderizar quando:
 *  - o estado compartilhado muda (aqui ou no OUTRO app) — padrão Observer;
 *  - passa um segundo (cronômetros, timers).
 * Devolve o "agora" do relógio injetado.
 */
export function useAoVivo({ relogio, aoMudar }: FonteAoVivo): Date {
  const [agora, setAgora] = useState(() => relogio.agora())

  useEffect(() => {
    const atualizar = () => setAgora(relogio.agora())
    const cancelar = aoMudar(atualizar)
    const id = window.setInterval(atualizar, 1000)
    return () => {
      cancelar()
      window.clearInterval(id)
    }
  }, [relogio, aoMudar])

  return agora
}
