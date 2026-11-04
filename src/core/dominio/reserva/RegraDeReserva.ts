import type { StatusDaCantina } from '../cantina/portas'

/**
 * Algo que pode impedir uma reserva agora. Responde `null` quando libera,
 * ou a frase que o aluno deve ler quando bloqueia.
 */
export interface RegraDeReserva {
  motivoDoBloqueio(): string | null
}

// PRINCÍPIO: Aberto/Fechado (padrão Composite) — o ServicoDeReserva conhece só UMA
// regra. Para uma regra nova (ex.: "feriado"), cria-se outra classe e ela entra
// na lista na composição; o serviço e as telas não mudam.
export class TodasAsRegras implements RegraDeReserva {
  constructor(private readonly regras: RegraDeReserva[]) {}

  motivoDoBloqueio(): string | null {
    for (const regra of this.regras) {
      const motivo = regra.motivoDoBloqueio()
      if (motivo) return motivo
    }
    return null
  }
}

export class CantinaPrecisaEstarAberta implements RegraDeReserva {
  constructor(private readonly status: StatusDaCantina) {}

  motivoDoBloqueio(): string | null {
    return this.status.cantinaAberta() ? null : 'A cantina está fechada no momento. Reservas indisponíveis.'
  }
}

export class ReservasPrecisamEstarLiberadas implements RegraDeReserva {
  constructor(private readonly status: StatusDaCantina) {}

  motivoDoBloqueio(): string | null {
    return this.status.reservasAbertas() ? null : 'A cantina finalizou as reservas por hoje.'
  }
}
