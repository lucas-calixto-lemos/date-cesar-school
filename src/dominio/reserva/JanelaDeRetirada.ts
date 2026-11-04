import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import { HoraDoDia } from '../compartilhado/HoraDoDia'

export class JanelaInvalidaError extends ErroDeDominio {}

export type MomentoDaJanela = 'antes' | 'durante' | 'depois'

/**
 * Janela em que o aluno acha que vai ser o intervalo dele.
 * Regras: início entre 20:00 e 21:15 (último horário de retirada) em passos de 5 min;
 * duração de 15 min (o intervalo) até 30 min (intervalo + 15 de margem).
 */
// PRINCÍPIO: Ocultamento de Informação — a janela se valida sozinha no construtor.
// É impossível existir uma JanelaDeRetirada inválida em qualquer lugar do sistema,
// e a UI não precisa (nem deve) repetir essas regras: ela pergunta as opções aqui.
export class JanelaDeRetirada {
  private static readonly INICIO_MAIS_CEDO = HoraDoDia.de(20, 0)
  private static readonly INICIO_MAIS_TARDE = HoraDoDia.de(21, 15)
  private static readonly PASSO_EM_MINUTOS = 5
  private static readonly DURACAO_MINIMA = 15
  private static readonly DURACAO_MAXIMA = 30

  private constructor(
    private readonly _inicio: HoraDoDia,
    private readonly duracaoEmMinutos: number,
  ) {}

  static criar(inicio: HoraDoDia, duracaoEmMinutos: number): JanelaDeRetirada {
    const J = JanelaDeRetirada
    if (inicio.ehAntesDe(J.INICIO_MAIS_CEDO) || inicio.ehDepoisDe(J.INICIO_MAIS_TARDE)) {
      throw new JanelaInvalidaError(
        `A janela deve começar entre ${J.INICIO_MAIS_CEDO} e ${J.INICIO_MAIS_TARDE}.`,
      )
    }
    if (!inicio.ehMultiploDe(J.PASSO_EM_MINUTOS)) {
      throw new JanelaInvalidaError(`O início deve ser em passos de ${J.PASSO_EM_MINUTOS} minutos.`)
    }
    if (
      !Number.isInteger(duracaoEmMinutos) ||
      duracaoEmMinutos < J.DURACAO_MINIMA ||
      duracaoEmMinutos > J.DURACAO_MAXIMA
    ) {
      throw new JanelaInvalidaError(
        `A janela deve durar entre ${J.DURACAO_MINIMA} e ${J.DURACAO_MAXIMA} minutos.`,
      )
    }
    if (duracaoEmMinutos % J.PASSO_EM_MINUTOS !== 0) {
      throw new JanelaInvalidaError(`A duração deve ser em passos de ${J.PASSO_EM_MINUTOS} minutos.`)
    }
    return new JanelaDeRetirada(inicio, duracaoEmMinutos)
  }

  /** Opções válidas de início — a UI monta os botões a partir daqui. */
  static iniciosPossiveis(): HoraDoDia[] {
    const J = JanelaDeRetirada
    const opcoes: HoraDoDia[] = []
    let atual = J.INICIO_MAIS_CEDO
    while (!atual.ehDepoisDe(J.INICIO_MAIS_TARDE)) {
      opcoes.push(atual)
      atual = atual.somarMinutos(J.PASSO_EM_MINUTOS)
    }
    return opcoes
  }

  static duracoesPossiveis(): number[] {
    const J = JanelaDeRetirada
    const opcoes: number[] = []
    for (let d = J.DURACAO_MINIMA; d <= J.DURACAO_MAXIMA; d += J.PASSO_EM_MINUTOS) opcoes.push(d)
    return opcoes
  }

  inicio(): HoraDoDia {
    return this._inicio
  }

  fim(): HoraDoDia {
    return this._inicio.somarMinutos(this.duracaoEmMinutos)
  }

  duracao(): number {
    return this.duracaoEmMinutos
  }

  /** Início incluso, fim excluso: [início, fim). */
  contem(hora: HoraDoDia): boolean {
    return !hora.ehAntesDe(this._inicio) && hora.ehAntesDe(this.fim())
  }

  momento(hora: HoraDoDia): MomentoDaJanela {
    if (hora.ehAntesDe(this._inicio)) return 'antes'
    return this.contem(hora) ? 'durante' : 'depois'
  }

  descricao(): string {
    return `${this._inicio} – ${this.fim()}`
  }
}
