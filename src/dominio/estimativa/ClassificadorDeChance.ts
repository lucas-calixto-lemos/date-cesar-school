/** Tom visual sugerido; a UI mapeia para cores sem precisar saber qual nível é. */
export type TomDoNivel = 'perigo' | 'alerta' | 'atencao' | 'bom' | 'otimo'

export class NivelDeChance {
  static readonly NAO_DA = new NivelDeChance('nao-da', 'Não dá', 'Melhor esperar o próximo intervalo.', 'perigo', 0)
  static readonly MUITO_ARRISCADO = new NivelDeChance('muito-arriscado', 'Muito arriscado', 'Você provavelmente vai chegar atrasado na aula.', 'alerta', 1)
  static readonly APERTADO = new NivelDeChance('apertado', 'Apertado', 'Dá, se você for agora e não parar no caminho.', 'atencao', 2)
  static readonly PROVAVELMENTE_DA = new NivelDeChance('provavelmente-da', 'Provavelmente dá', 'Tem uma folguinha. Bora!', 'bom', 3)
  static readonly VAI_DAR = new NivelDeChance('vai-dar', 'Vai dar', 'Tranquilo — dá até para comer com calma.', 'otimo', 4)

  private constructor(
    readonly id: string,
    readonly titulo: string,
    readonly mensagem: string,
    readonly tom: TomDoNivel,
    /** 0 (pior) a 4 (melhor) — útil para barras/medidores. */
    readonly grau: number,
  ) {}

  static todos(): NivelDeChance[] {
    return [
      NivelDeChance.NAO_DA,
      NivelDeChance.MUITO_ARRISCADO,
      NivelDeChance.APERTADO,
      NivelDeChance.PROVAVELMENTE_DA,
      NivelDeChance.VAI_DAR,
    ]
  }
}

export interface FaixaDeFolga {
  /** Folga (minutos restantes − necessários) estritamente menor que isto cai nesta faixa. */
  folgaMenorQue: number
  nivel: NivelDeChance
}

const FAIXAS_PADRAO: FaixaDeFolga[] = [
  { folgaMenorQue: 0, nivel: NivelDeChance.NAO_DA },
  { folgaMenorQue: 2, nivel: NivelDeChance.MUITO_ARRISCADO },
  { folgaMenorQue: 4, nivel: NivelDeChance.APERTADO },
  { folgaMenorQue: 7, nivel: NivelDeChance.PROVAVELMENTE_DA },
  { folgaMenorQue: Number.POSITIVE_INFINITY, nivel: NivelDeChance.VAI_DAR },
]

// PRINCÍPIO: Responsabilidade Única — calcular o tempo (EstimadorDeTempo) e
// interpretar o tempo (este classificador) mudam por motivos diferentes,
// por isso estão separados. As faixas são dados, não uma cadeia de ifs.
export class ClassificadorDeChance {
  constructor(private readonly faixas: FaixaDeFolga[] = FAIXAS_PADRAO) {}

  classificar(minutosNecessarios: number, minutosRestantes: number): NivelDeChance {
    const folga = minutosRestantes - minutosNecessarios
    const faixa = this.faixas.find((f) => folga < f.folgaMenorQue)
    return (faixa ?? this.faixas[this.faixas.length - 1]).nivel
  }
}
