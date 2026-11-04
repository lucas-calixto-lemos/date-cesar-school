import { ErroDeDominio } from '../compartilhado/ErroDeDominio'

/** Número que o aluno mostra no balcão. Sempre exibido com 3 dígitos: 019. */
export class Comanda {
  static readonly MAIOR_NUMERO = 999

  private constructor(private readonly numero: number) {}

  static de(numero: number): Comanda {
    if (!Number.isInteger(numero) || numero < 1 || numero > Comanda.MAIOR_NUMERO) {
      throw new ErroDeDominio(`Comanda inválida: ${numero}`)
    }
    return new Comanda(numero)
  }

  formatada(): string {
    return String(this.numero).padStart(3, '0')
  }

  igualA(outra: Comanda): boolean {
    return this.numero === outra.numero
  }
}
