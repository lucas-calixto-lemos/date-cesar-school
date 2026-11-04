import type { ArmazemDaCantina, EstadoDaCantina, Ouvinte } from '../../dominio/sincronizacao/ArmazemDaCantina'
import { estadoInicial } from './estadoInicial'

/**
 * Implementação 1: estado num objeto em memória.
 * Usada nos testes: os dois apps recebem a mesma instância. A troca por ela (ou pela
 * de BroadcastChannel) não muda nenhuma tela — é o que o teste de integração prova.
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
