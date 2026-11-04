import { ErroDeDominio } from './ErroDeDominio'

const MINUTOS_POR_DIA = 24 * 60

// PRINCÍPIO: Ocultamento de Informação — "horário" é um objeto de valor imutável.
// Quem usa compara horários (ehAntesDe, minutosAte) sem manipular números soltos.
export class HoraDoDia {
  private constructor(private readonly minutosDesdeMeiaNoite: number) {}

  static de(horas: number, minutos = 0): HoraDoDia {
    if (!Number.isInteger(horas) || horas < 0 || horas > 23) {
      throw new ErroDeDominio(`Hora inválida: ${horas}`)
    }
    if (!Number.isInteger(minutos) || minutos < 0 || minutos > 59) {
      throw new ErroDeDominio(`Minuto inválido: ${minutos}`)
    }
    return new HoraDoDia(horas * 60 + minutos)
  }

  static deData(data: Date): HoraDoDia {
    return HoraDoDia.de(data.getHours(), data.getMinutes())
  }

  /** Aceita "HH:MM". */
  static deTexto(texto: string): HoraDoDia {
    const casamento = /^(\d{1,2}):(\d{2})$/.exec(texto.trim())
    if (!casamento) throw new ErroDeDominio(`Horário inválido: "${texto}"`)
    return HoraDoDia.de(Number(casamento[1]), Number(casamento[2]))
  }

  horas(): number {
    return Math.floor(this.minutosDesdeMeiaNoite / 60)
  }

  minutos(): number {
    return this.minutosDesdeMeiaNoite % 60
  }

  somarMinutos(minutos: number): HoraDoDia {
    const total = this.minutosDesdeMeiaNoite + minutos
    if (total < 0 || total >= MINUTOS_POR_DIA) {
      throw new ErroDeDominio('O horário resultante sai do dia.')
    }
    return new HoraDoDia(total)
  }

  /** Quantos minutos faltam daqui até `outra` (negativo se `outra` já passou). */
  minutosAte(outra: HoraDoDia): number {
    return outra.minutosDesdeMeiaNoite - this.minutosDesdeMeiaNoite
  }

  ehAntesDe(outra: HoraDoDia): boolean {
    return this.minutosDesdeMeiaNoite < outra.minutosDesdeMeiaNoite
  }

  ehDepoisDe(outra: HoraDoDia): boolean {
    return this.minutosDesdeMeiaNoite > outra.minutosDesdeMeiaNoite
  }

  igualA(outra: HoraDoDia): boolean {
    return this.minutosDesdeMeiaNoite === outra.minutosDesdeMeiaNoite
  }

  ehMultiploDe(passoEmMinutos: number): boolean {
    return this.minutosDesdeMeiaNoite % passoEmMinutos === 0
  }

  toString(): string {
    const hh = String(this.horas()).padStart(2, '0')
    const mm = String(this.minutos()).padStart(2, '0')
    return `${hh}:${mm}`
  }
}
