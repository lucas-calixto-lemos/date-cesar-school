import { HoraDoDia } from '../compartilhado/HoraDoDia'

// PRINCÍPIO: Inversão de Dependências — o domínio depende desta abstração,
// nunca de `new Date()` direto. Assim testes e o painel de debug controlam o tempo.
export interface Relogio {
  agora(): Date
}

export class RelogioDoSistema implements Relogio {
  agora(): Date {
    return new Date()
  }
}

/** Relógio parado num instante — usado nos testes. */
export class RelogioFixo implements Relogio {
  private instante: Date

  constructor(instante: Date) {
    this.instante = new Date(instante)
  }

  static as(horas: number, minutos = 0): RelogioFixo {
    const data = new Date(2026, 10, 4, horas, minutos, 0, 0)
    return new RelogioFixo(data)
  }

  agora(): Date {
    return new Date(this.instante)
  }

  avancarMinutos(minutos: number): void {
    this.instante = new Date(this.instante.getTime() + minutos * 60_000)
  }
}

// PRINCÍPIO: Segregação de Interfaces — só o painel de debug enxerga este controle;
// o resto do app recebe apenas `Relogio`.
export interface ControleDeRelogio {
  ajustarPara(hora: HoraDoDia): void
  avancarMinutos(minutos: number): void
  voltarAoHorarioReal(): void
  estaAjustado(): boolean
}

// PRINCÍPIO: Composição em vez de Herança — decora qualquer Relogio somando um
// deslocamento; continua andando em tempo real a partir do horário simulado.
export class RelogioAjustavel implements Relogio, ControleDeRelogio {
  private deslocamentoEmMs = 0

  constructor(private readonly base: Relogio) {}

  agora(): Date {
    return new Date(this.base.agora().getTime() + this.deslocamentoEmMs)
  }

  ajustarPara(hora: HoraDoDia): void {
    const real = this.base.agora()
    const alvo = new Date(real)
    alvo.setHours(hora.horas(), hora.minutos(), 0, 0)
    this.deslocamentoEmMs = alvo.getTime() - real.getTime()
  }

  avancarMinutos(minutos: number): void {
    this.deslocamentoEmMs += minutos * 60_000
  }

  voltarAoHorarioReal(): void {
    this.deslocamentoEmMs = 0
  }

  estaAjustado(): boolean {
    return this.deslocamentoEmMs !== 0
  }
}
