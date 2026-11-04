import type { Comanda } from '../comanda/Comanda'
import type { HoraDoDia } from '../compartilhado/HoraDoDia'

/** Mensagem que viaja do aluno para a cantina. */
export interface AvisoDeRetirada {
  readonly comanda: Comanda
  readonly descricaoDoPedido: string
  readonly localDoAluno: string
  readonly horario: HoraDoDia
  readonly jaPago: boolean
}

// PRINCÍPIO: Segregação de Interfaces — o lado do ALUNO só pode avisar.
// Ele não vê a lista de outros pedidos nem marca nada como pronto.
export interface NotificadorCantina {
  avisarAlunoACaminho(aviso: AvisoDeRetirada): void
}

// PRINCÍPIO: Segregação de Interfaces — o lado da CANTINA (tela da tia, que virá
// depois) consome só isto. A implementação em memória atende as duas interfaces,
// mas cada cliente depende apenas da fatia que usa.
export interface PainelDaCantina {
  avisosPendentes(): AvisoDeRetirada[]
  marcarComoPronto(comanda: Comanda): void
  /** Retorna uma função para cancelar a assinatura. */
  aoReceberAviso(ouvinte: (aviso: AvisoDeRetirada) => void): () => void
}

/** Leitura do movimento da cantina — usada pela estimativa. */
export interface FilaDaCantina {
  pessoasNaFila(): number
  pedidosReservadosEmAberto(): number
}
