import { LocalDoCampus } from '../dominio/campus/LocalDoCampus'
import type { NotificadorCantina, PainelDaCantina } from '../dominio/cantina/interfaces'
import { ServicoDeRetirada } from '../dominio/cantina/ServicoDeRetirada'
import { ConsultaDeCardapio } from '../dominio/cardapio/ConsultaDeCardapio'
import { GeradorSequencialDeComanda } from '../dominio/comanda/GeradorDeComanda'
import { ClassificadorDeChance } from '../dominio/estimativa/ClassificadorDeChance'
import {
  TempoDaFila,
  TempoDeDeslocamento,
  TempoDePreparo,
  TempoDosPedidosReservados,
} from '../dominio/estimativa/componentes'
import { EstimadorPorComposicao } from '../dominio/estimativa/EstimadorPorComposicao'
import { ServicoDeEstimativa } from '../dominio/estimativa/ServicoDeEstimativa'
import type { RegistroDeFormasDePagamento } from '../dominio/pagamento/RegistroDeFormasDePagamento'
import { HorarioLimiteDeReserva } from '../dominio/reserva/HorarioLimiteDeReserva'
import { ServicoDeReserva } from '../dominio/reserva/ServicoDeReserva'
import {
  RelogioAjustavel,
  RelogioDoSistema,
  type ControleDeRelogio,
  type Relogio,
} from '../dominio/tempo/Relogio'
import { CardapioEmMemoria } from '../infra/CardapioEmMemoria'
import { CentralDaCantinaEmMemoria } from '../infra/CentralDaCantinaEmMemoria'
import { CozinhaSimulada } from '../infra/CozinhaSimulada'
import { criarItensIniciais } from '../infra/dadosDoCardapio'
import { FilaSimulada } from '../infra/FilaSimulada'
import { RepositorioDePedidosEmMemoria } from '../infra/RepositorioDePedidosEmMemoria'
import { criarRegistroDeFormasDePagamento } from './formasDePagamento'

// PRINCÍPIO: Segregação de Interfaces — o que a tela do ALUNO pode usar...
export interface ServicosDoAluno {
  relogio: Relogio
  cardapio: ConsultaDeCardapio
  horarioLimite: HorarioLimiteDeReserva
  formasDePagamento: RegistroDeFormasDePagamento
  reserva: ServicoDeReserva
  retirada: ServicoDeRetirada
  estimativa: ServicoDeEstimativa
  locais: LocalDoCampus[]
}

// ...e o que a tela da CANTINA (tia) vai usar. Nenhum lado enxerga o do outro.
export interface ServicosDaCantina {
  relogio: Relogio
  painel: PainelDaCantina
}

export interface Aplicacao {
  aluno: ServicosDoAluno
  cantina: ServicosDaCantina
  /** Só para o painel de debug. */
  controleDeRelogio: ControleDeRelogio
}

/**
 * Raiz de composição: o ÚNICO lugar que conhece as classes concretas.
 */
// PRINCÍPIO: Inversão de Dependências — aqui as implementações (em memória,
// simuladas) são escolhidas e injetadas; trocar por uma API real mexe só aqui.
export function montarAplicacao(relogioBase: Relogio = new RelogioDoSistema()): Aplicacao {
  const relogio = new RelogioAjustavel(relogioBase)

  const cardapio = new CardapioEmMemoria(criarItensIniciais())
  const pedidos = new RepositorioDePedidosEmMemoria()
  const central = new CentralDaCantinaEmMemoria(pedidos)
  const fila = new FilaSimulada(relogio, pedidos)
  const horarioLimite = new HorarioLimiteDeReserva(relogio)

  const notificador: NotificadorCantina = central
  const painel: PainelDaCantina = central
  new CozinhaSimulada(painel, 6000).ligar()

  const estimador = new EstimadorPorComposicao([
    new TempoDaFila(fila),
    new TempoDosPedidosReservados(fila),
    new TempoDePreparo(),
    new TempoDeDeslocamento(),
  ])

  return {
    aluno: {
      relogio,
      cardapio: new ConsultaDeCardapio(cardapio),
      horarioLimite,
      formasDePagamento: criarRegistroDeFormasDePagamento(),
      // Comandas de outros alunos já saíram hoje: a sua começa em 019.
      reserva: new ServicoDeReserva(cardapio, horarioLimite, new GeradorSequencialDeComanda(18), pedidos),
      retirada: new ServicoDeRetirada(notificador, relogio),
      estimativa: new ServicoDeEstimativa(estimador, new ClassificadorDeChance()),
      locais: LocalDoCampus.todos(),
    },
    cantina: { relogio, painel },
    controleDeRelogio: relogio,
  }
}
