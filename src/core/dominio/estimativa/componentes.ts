import type { FilaDaCantina } from '../cantina/portas'
import type { ComponenteDeTempo, ContextoDaEstimativa, ParcelaDeTempo } from './EstimadorDeTempo'

// PRINCÍPIO: Responsabilidade Única — cada componente sabe calcular UMA parcela.
// Mudar a regra do deslocamento não encosta na regra da fila.

export class TempoDaFila implements ComponenteDeTempo {
  constructor(
    private readonly fila: FilaDaCantina,
    /** O balcão atende, em média, uma pessoa a cada ~30 s. */
    private readonly minutosPorPessoa = 0.5,
  ) {}

  calcular(): ParcelaDeTempo {
    const pessoas = this.fila.pessoasNaFila()
    return { descricao: `Fila no balcão (${pessoas} pessoas)`, minutos: pessoas * this.minutosPorPessoa }
  }
}

export class TempoDosPedidosReservados implements ComponenteDeTempo {
  constructor(
    private readonly fila: FilaDaCantina,
    /** Reservas já vêm separadas: só ocupam o balcão na entrega (~15 s). */
    private readonly minutosPorPedido = 0.25,
  ) {}

  calcular(): ParcelaDeTempo {
    const pedidos = this.fila.pedidosReservadosEmAberto()
    return { descricao: `Reservas na frente (${pedidos})`, minutos: pedidos * this.minutosPorPedido }
  }
}

export class TempoDePreparo implements ComponenteDeTempo {
  calcular({ item }: ContextoDaEstimativa): ParcelaDeTempo {
    return { descricao: `Preparo de ${item.nome()}`, minutos: item.minutosDePreparo() }
  }
}

export type Trecho = 'ida-e-volta' | 'ida'

/**
 * O aluno estima "ida e volta" (precisa voltar para a aula);
 * a cantina estima só "ida" (quando ele chega ao balcão). Mesmo componente.
 */
export class TempoDeDeslocamento implements ComponenteDeTempo {
  constructor(private readonly trecho: Trecho = 'ida-e-volta') {}

  calcular({ local }: ContextoDaEstimativa): ParcelaDeTempo {
    return this.trecho === 'ida'
      ? { descricao: `Ida (${local.nome})`, minutos: local.minutosDeIda() }
      : { descricao: `Ida e volta (${local.nome})`, minutos: local.minutosDeIdaEVolta() }
  }
}
