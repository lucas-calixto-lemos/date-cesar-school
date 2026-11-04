import type { ArmazemDaCantina, EstadoDaCantina, Ouvinte } from '../../dominio/sincronizacao/ArmazemDaCantina'
import { estadoInicial } from './estadoInicial'

type Mensagem =
  | { tipo: 'pedir-estado'; origem: string }
  | { tipo: 'estado'; origem: string; estado: EstadoDaCantina }

/** O mínimo de BroadcastChannel que usamos (permite injetar um canal falso em testes). */
export interface CanalDeMensagens {
  postMessage(mensagem: Mensagem): void
  onmessage: ((evento: { data: Mensagem }) => void) | null
  close(): void
}

/**
 * Implementação 2: cada aba tem sua cópia do estado e as abas conversam por
 * BroadcastChannel (mesmo navegador, mesma origem). Assim /aluno e /cantina
 * abertos em ABAS diferentes ficam sincronizados.
 *
 * - Ao nascer, a aba pede o estado às outras ("pedir-estado").
 * - A cada alteração, a aba transmite o estado inteiro.
 * - Fica valendo a cópia de maior versão; empate decide pela origem
 *   (determinístico em todas as abas).
 *
 * Limite conhecido (PoC): duas abas alterando no MESMO instante → vence uma
 * delas ("última escrita vence"). Um backend real resolveria isso no servidor.
 */
export class ArmazemBroadcastChannel implements ArmazemDaCantina {
  private estado: EstadoDaCantina
  private origemDoEstado: string
  private readonly ouvintes = new Set<Ouvinte>()
  private readonly origem = Math.random().toString(36).slice(2) + Date.now().toString(36)
  private readonly canal: CanalDeMensagens

  constructor(
    nomeDoCanal = 'date-cesar-cantina',
    inicial: EstadoDaCantina = estadoInicial(),
    abrirCanal: (nome: string) => CanalDeMensagens = (nome) =>
      new BroadcastChannel(nome) as unknown as CanalDeMensagens,
  ) {
    this.estado = structuredClone(inicial)
    this.origemDoEstado = this.origem
    this.canal = abrirCanal(nomeDoCanal)
    this.canal.onmessage = ({ data }) => this.receber(data)
    this.enviar({ tipo: 'pedir-estado', origem: this.origem })
  }

  ler(): EstadoDaCantina {
    return this.estado
  }

  alterar(alteracao: (atual: EstadoDaCantina) => Omit<EstadoDaCantina, 'versao'>): void {
    this.estado = { ...alteracao(this.estado), versao: this.estado.versao + 1 }
    this.origemDoEstado = this.origem
    this.enviar({ tipo: 'estado', origem: this.origem, estado: this.estado })
    this.notificar()
  }

  assinar(ouvinte: Ouvinte): () => void {
    this.ouvintes.add(ouvinte)
    return () => {
      this.ouvintes.delete(ouvinte)
    }
  }

  /** Libera o canal (testes e desmontagem da página). */
  fechar(): void {
    this.canal.onmessage = null
    this.canal.close()
  }

  private receber(mensagem: Mensagem): void {
    if (mensagem.origem === this.origem) return
    if (mensagem.tipo === 'pedir-estado') {
      // Só responde quem já tem algo além do estado inicial.
      if (this.estado.versao > 0) this.enviar({ tipo: 'estado', origem: this.origem, estado: this.estado })
      return
    }
    if (this.ehMaisNovo(mensagem.estado, mensagem.origem)) {
      this.estado = mensagem.estado
      this.origemDoEstado = mensagem.origem
      this.notificar()
    }
  }

  private ehMaisNovo(candidato: EstadoDaCantina, origem: string): boolean {
    if (candidato.versao !== this.estado.versao) return candidato.versao > this.estado.versao
    return origem > this.origemDoEstado
  }

  private enviar(mensagem: Mensagem): void {
    this.canal.postMessage(mensagem)
  }

  private notificar(): void {
    this.ouvintes.forEach((ouvinte) => ouvinte(this.estado))
  }
}
