import type { ArmazemDaCantina, EstadoDaCantina, Ouvinte } from '../../dominio/sincronizacao/ArmazemDaCantina'
import { estadoInicial } from './estadoInicial'

/**
 * Implementação 1: estado num objeto em memória.
 * Usada no /demo, onde os dois apps rodam na MESMA página e recebem a mesma instância.
 */
export class ArmazemEmMemoria implements ArmazemDaCantina {
  private estado: EstadoDaCantina
  private readonly ouvintes = new Set<Ouvinte>()

  constructor(inicial: EstadoDaCantina = estadoInicial()) {
    this.estado = structuredClone(inicial)
  }

  ler(): EstadoDaCantina {
    return this.estado
  }

  alterar(alteracao: (atual: EstadoDaCantina) => Omit<EstadoDaCantina, 'versao'>): void {
    this.estado = { ...alteracao(this.estado), versao: this.estado.versao + 1 }
    this.ouvintes.forEach((ouvinte) => ouvinte(this.estado))
  }

  assinar(ouvinte: Ouvinte): () => void {
    this.ouvintes.add(ouvinte)
    return () => {
      this.ouvintes.delete(ouvinte)
    }
  }
}
