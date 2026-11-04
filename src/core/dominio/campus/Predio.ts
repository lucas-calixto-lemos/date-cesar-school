import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { LocalDoCampus } from './LocalDoCampus'

/** Um bloco de um prédio, com os locais (salas etc.) que o aluno pode escolher. */
export class Bloco {
  constructor(
    readonly id: string,
    readonly nome: string,
    /** Dica de distância para o aluno, ex.: "Mais perto da cantina". */
    readonly referencia: string,
    private readonly _locais: LocalDoCampus[],
  ) {
    if (_locais.length === 0) throw new ErroDeDominio(`O bloco ${nome} precisa ter ao menos um local.`)
  }

  locais(): LocalDoCampus[] {
    return [...this._locais]
  }
}

/**
 * Prédio do CESAR (Brum, Apolo, Tiradentes...).
 * Um prédio pode estar "em desenvolvimento": aparece para o aluno, mas ainda sem blocos mapeados.
 */
// PRINCÍPIO: Ocultamento de Informação — a UI pergunta `predio.estaDisponivel()`
// em vez de deduzir pela lista de blocos vazia ou por nome de prédio.
export class Predio {
  private constructor(
    readonly id: string,
    readonly nome: string,
    private readonly _blocos: Bloco[],
    private readonly disponivel: boolean,
  ) {}

  static comBlocos(id: string, nome: string, blocos: Bloco[]): Predio {
    if (blocos.length === 0) throw new ErroDeDominio(`O prédio ${nome} precisa de ao menos um bloco.`)
    return new Predio(id, nome, blocos, true)
  }

  static emDesenvolvimento(id: string, nome: string): Predio {
    return new Predio(id, nome, [], false)
  }

  estaDisponivel(): boolean {
    return this.disponivel
  }

  blocos(): Bloco[] {
    return [...this._blocos]
  }
}
