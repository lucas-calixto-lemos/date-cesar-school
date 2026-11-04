import type { PainelDaCantina } from '../dominio/cantina/interfaces'

type Agendador = (acao: () => void, atrasoEmMs: number) => unknown

/**
 * Enquanto a tela da tia não existe, esta "tia robô" escuta o painel e marca o
 * pedido como pronto depois de alguns segundos.
 * Repare: ela usa APENAS PainelDaCantina — exatamente o que a tela real usará.
 */
export class CozinhaSimulada {
  constructor(
    private readonly painel: PainelDaCantina,
    private readonly atrasoEmMs = 6000,
    private readonly agendar: Agendador = (acao, atraso) => setTimeout(acao, atraso),
  ) {}

  /** Começa a atender os avisos. Devolve a função para desligar. */
  ligar(): () => void {
    return this.painel.aoReceberAviso((aviso) => {
      this.agendar(() => this.painel.marcarComoPronto(aviso.comanda), this.atrasoEmMs)
    })
  }
}
