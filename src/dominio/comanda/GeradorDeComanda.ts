import { Comanda } from './Comanda'

// PRINCÍPIO: Responsabilidade Única — gerar números de comanda é uma razão de
// mudança própria (sequencial hoje; por dia/por balcão amanhã). Ninguém mais
// sabe como o número nasce; a reserva só pede "a próxima".
export interface GeradorDeComanda {
  proxima(): Comanda
}

export class GeradorSequencialDeComanda implements GeradorDeComanda {
  /** @param ultimaEmitida última comanda já usada hoje (0 = nenhuma). */
  constructor(private ultimaEmitida = 0) {}

  proxima(): Comanda {
    // Depois de 999 volta para 001.
    this.ultimaEmitida = (this.ultimaEmitida % Comanda.MAIOR_NUMERO) + 1
    return Comanda.de(this.ultimaEmitida)
  }
}
