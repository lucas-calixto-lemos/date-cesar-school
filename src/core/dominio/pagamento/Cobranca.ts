import { Dinheiro } from '../compartilhado/Dinheiro'

export interface CobrancaSerializada {
  paga: boolean
  valorEmCentavos: number
  resumo: string
  codigoQr?: string
}

type Situacao = 'paga' | 'pendente'

/**
 * Resultado de uma forma de pagamento. É o único "idioma" que o resto do sistema
 * entende — nunca o tipo concreto da forma de pagamento.
 */
export class Cobranca {
  private constructor(
    private readonly situacao: Situacao,
    private readonly _valor: Dinheiro,
    private readonly _resumo: string,
    private readonly _codigoQr?: string,
  ) {}

  static paga(valor: Dinheiro, resumo: string, codigoQr?: string): Cobranca {
    return new Cobranca('paga', valor, resumo, codigoQr)
  }

  static pendente(valor: Dinheiro, resumo: string): Cobranca {
    return new Cobranca('pendente', valor, resumo)
  }

  static restaurar(d: CobrancaSerializada): Cobranca {
    return new Cobranca(d.paga ? 'paga' : 'pendente', Dinheiro.emCentavos(d.valorEmCentavos), d.resumo, d.codigoQr)
  }

  paraDados(): CobrancaSerializada {
    return {
      paga: this.estaPaga(),
      valorEmCentavos: this._valor.valorEmCentavos(),
      resumo: this._resumo,
      ...(this._codigoQr ? { codigoQr: this._codigoQr } : {}),
    }
  }

  /** Na entrega, quem ainda devia paga no balcão. Cobranças já pagas não mudam. */
  quitarNaRetirada(): Cobranca {
    return this.estaPaga() ? this : Cobranca.paga(this._valor, 'Pago na retirada')
  }

  estaPaga(): boolean {
    return this.situacao === 'paga'
  }

  valor(): Dinheiro {
    return this._valor
  }

  /** Frase curta para o aluno: "Pago via Pix", "Pague na retirada"... */
  resumo(): string {
    return this._resumo
  }

  /**
   * Conteúdo de um QR Code, se a forma de pagamento gerou um.
   * A UI desenha o QR quando ele existe — sem perguntar "qual forma é esta?".
   */
  codigoQr(): string | undefined {
    return this._codigoQr
  }
}
