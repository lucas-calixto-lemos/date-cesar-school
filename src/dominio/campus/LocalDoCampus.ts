import { ErroDeDominio } from '../compartilhado/ErroDeDominio'

/** Onde o aluno está quando decide ir à cantina. */
export class LocalDoCampus {
  private static readonly TODOS: LocalDoCampus[] = [
    new LocalDoCampus('bloco-a', 'Bloco A', 1),
    new LocalDoCampus('bloco-b', 'Bloco B', 2),
    new LocalDoCampus('auditorio', 'Auditório', 3),
    new LocalDoCampus('laboratorios', 'Laboratórios', 3),
    new LocalDoCampus('biblioteca', 'Biblioteca', 4),
  ]

  private constructor(
    readonly id: string,
    readonly nome: string,
    private readonly minutosAteACantina: number,
  ) {}

  static todos(): LocalDoCampus[] {
    return [...LocalDoCampus.TODOS]
  }

  static porId(id: string): LocalDoCampus {
    const local = LocalDoCampus.TODOS.find((l) => l.id === id)
    if (!local) throw new ErroDeDominio(`Local desconhecido: ${id}`)
    return local
  }

  /** O aluno precisa ir E voltar para a sala antes do fim do intervalo. */
  minutosDeIdaEVolta(): number {
    return this.minutosAteACantina * 2
  }
}
