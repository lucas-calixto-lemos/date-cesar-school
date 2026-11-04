import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import type { Relogio } from '../tempo/Relogio'

export class ReservasEncerradasError extends ErroDeDominio {}

// PRINCÍPIO: Responsabilidade Única — este objeto só sabe responder
// "ainda dá para reservar hoje?" e "quanto tempo falta?".
// PRINCÍPIO: Inversão de Dependências — recebe um Relogio injetado; nos testes e
// no debug usamos relógios controláveis, sem tocar nesta classe.
export class HorarioLimiteDeReserva {
  constructor(
    private readonly relogio: Relogio,
    private readonly limite: HoraDoDia = HoraDoDia.de(19, 0),
  ) {}

  horarioLimite(): HoraDoDia {
    return this.limite
  }

  /** Milissegundos até o limite de hoje (0 se já passou). */
  msRestantes(): number {
    const agora = this.relogio.agora()
    const limiteDeHoje = new Date(agora)
    limiteDeHoje.setHours(this.limite.horas(), this.limite.minutos(), 0, 0)
    return Math.max(0, limiteDeHoje.getTime() - agora.getTime())
  }

  estaAberta(): boolean {
    return this.msRestantes() > 0
  }

  garantirQueEstaAberta(): void {
    if (!this.estaAberta()) {
      throw new ReservasEncerradasError(
        `As reservas de hoje encerraram às ${this.limite}. Volte amanhã!`,
      )
    }
  }
}
