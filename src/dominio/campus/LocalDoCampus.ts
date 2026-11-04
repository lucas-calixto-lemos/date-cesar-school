import { ErroDeDominio } from '../compartilhado/ErroDeDominio'

export interface DadosDoLocal {
  id: string
  nome: string
  minutosAteACantina: number
  /** Onde o local fica, ex.: "Brum · Bloco A". */
  contexto?: string
}

/** O ponto exato onde o aluno está (uma sala, a biblioteca...). Folha da hierarquia Prédio → Bloco → Local. */
export class LocalDoCampus {
  private constructor(
    readonly id: string,
    /** Nome curto, para botões: "Sala 110". */
    readonly nome: string,
    private readonly minutosAteACantina: number,
    private readonly contexto?: string,
  ) {}

  static criar({ id, nome, minutosAteACantina, contexto }: DadosDoLocal): LocalDoCampus {
    if (!id.trim() || !nome.trim()) throw new ErroDeDominio('Local precisa de id e nome.')
    if (!Number.isFinite(minutosAteACantina) || minutosAteACantina < 0) {
      throw new ErroDeDominio(`Tempo até a cantina inválido para ${nome}.`)
    }
    return new LocalDoCampus(id, nome, minutosAteACantina, contexto)
  }

  /** Nome completo, para a cantina saber de onde o aluno vem: "Brum · Bloco A · Sala 110". */
  descricao(): string {
    return this.contexto ? `${this.contexto} · ${this.nome}` : this.nome
  }

  /** O aluno precisa ir E voltar para a sala antes do fim do intervalo. */
  minutosDeIdaEVolta(): number {
    return this.minutosAteACantina * 2
  }
}
