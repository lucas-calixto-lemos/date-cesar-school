import type { MapaDoCampus } from '../dominio/campus/MapaDoCampus'
import { ControleDeEstoque } from '../dominio/cantina/ControleDeEstoque'
import type { ControleDaCantina, StatusDaCantina } from '../dominio/cantina/portas'
import { PrevisorDeChegada, ServicoDeAtendimento } from '../dominio/cantina/ServicoDeAtendimento'
import { ServicoDeRetirada } from '../dominio/cantina/ServicoDeRetirada'
import { ConsultaDeCardapio } from '../dominio/cardapio/ConsultaDeCardapio'
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
import {
  CantinaPrecisaEstarAberta,
  ReservasPrecisamEstarLiberadas,
  TodasAsRegras,
  type RegraDeReserva,
} from '../dominio/reserva/RegraDeReserva'
import { ServicoDeReserva } from '../dominio/reserva/ServicoDeReserva'
import type { ArmazemDaCantina } from '../dominio/sincronizacao/ArmazemDaCantina'
import { RelogioDoSistema, type ControleDeRelogio, type Relogio } from '../dominio/tempo/Relogio'
import {
  CardapioComEstoque,
  EstoqueNoArmazem,
  GeradorDeComandaNoArmazem,
  OperacaoNoArmazem,
  ReinicioDoTeste,
  RelogioCompartilhado,
  RepositorioDePedidosNoArmazem,
} from '../infra/armazem/adaptadores'
import { ArmazemBroadcastChannel } from '../infra/armazem/ArmazemBroadcastChannel'
import { estadoInicial } from '../infra/armazem/estadoInicial'
import { MapaDoCampusEmMemoria } from '../infra/dadosDoCampus'
import { CATALOGO } from '../infra/dadosDoCardapio'
import { FilaSimulada } from '../infra/FilaSimulada'
import { criarRegistroDeFormasDePagamento } from './formasDePagamento'

/** Parte comum aos dois apps: tempo e aviso de mudanças. */
interface ServicosBase {
  relogio: Relogio
  /** Só para o painel de debug. */
  controleDeRelogio: ControleDeRelogio
  /** Observer: chamado sempre que o estado compartilhado muda (aqui ou no outro app). */
  aoMudar(ouvinte: () => void): () => void
  /** Só para o painel de debug: apaga tudo o que foi feito no teste, nos dois apps. */
  reiniciarTeste(): void
}

// PRINCÍPIO: Segregação de Interfaces — o app do ALUNO só enxerga operações de
// aluno: consultar cardápio, reservar, dar play e acompanhar o próprio pedido.
// Ele NÃO recebe listar pedidos de outros, marcar entregue, estoque ou abrir/fechar.
export interface ServicosDoAluno extends ServicosBase {
  cardapio: ConsultaDeCardapio
  horarioLimite: HorarioLimiteDeReserva
  /** Por que não dá para reservar agora (cantina fechada, reservas finalizadas, 19h...). */
  bloqueioDeReserva: RegraDeReserva
  formasDePagamento: RegistroDeFormasDePagamento
  reserva: ServicoDeReserva
  retirada: ServicoDeRetirada
  estimativa: ServicoDeEstimativa
  campus: MapaDoCampus
}

// PRINCÍPIO: Segregação de Interfaces — o app da CANTINA só enxerga operações de
// cantina: listar pedidos, entregar, cancelar, abrir/fechar e estoque.
export interface ServicosDaCantina extends ServicosBase {
  atendimento: ServicoDeAtendimento
  chegada: PrevisorDeChegada
  operacao: ControleDaCantina
  estoque: ControleDeEstoque
}

/*
 * Raiz de composição: o ÚNICO lugar que conhece as classes concretas.
 *
 * PRINCÍPIO: Inversão de Dependências — os dois "montar" recebem o ArmazemDaCantina
 * (abstração) por parâmetro. Quem chama decide: BroadcastChannel em /aluno e /cantina,
 * memória nos testes. Nenhuma tela muda com a troca (Aberto/Fechado + Liskov).
 */
function montarBase(armazem: ArmazemDaCantina, relogioBase: Relogio) {
  const relogio = new RelogioCompartilhado(relogioBase, armazem)
  const estoque = new EstoqueNoArmazem(armazem)
  const reinicio = new ReinicioDoTeste(armazem, estadoInicial)
  return {
    relogio,
    estoque,
    pedidos: new RepositorioDePedidosNoArmazem(armazem),
    cardapio: new CardapioComEstoque(CATALOGO, estoque),
    operacao: new OperacaoNoArmazem(armazem),
    base: {
      relogio,
      controleDeRelogio: relogio,
      aoMudar: (ouvinte: () => void) => armazem.assinar(() => ouvinte()),
      reiniciarTeste: () => reinicio.reiniciar(),
    } satisfies ServicosBase,
  }
}

export function montarServicosDoAluno(
  armazem: ArmazemDaCantina,
  relogioBase: Relogio = new RelogioDoSistema(),
): ServicosDoAluno {
  const { relogio, estoque, pedidos, cardapio, operacao, base } = montarBase(armazem, relogioBase)
  const status: StatusDaCantina = operacao // o aluno só LÊ o status
  const horarioLimite = new HorarioLimiteDeReserva(relogio)
  const bloqueioDeReserva = new TodasAsRegras([
    new CantinaPrecisaEstarAberta(status),
    new ReservasPrecisamEstarLiberadas(status),
    horarioLimite,
  ])
  const fila = new FilaSimulada(relogio, pedidos)

  return {
    ...base,
    cardapio: new ConsultaDeCardapio(cardapio),
    horarioLimite,
    bloqueioDeReserva,
    formasDePagamento: criarRegistroDeFormasDePagamento(),
    reserva: new ServicoDeReserva(cardapio, bloqueioDeReserva, new GeradorDeComandaNoArmazem(armazem), pedidos, estoque),
    retirada: new ServicoDeRetirada(pedidos, relogio),
    estimativa: new ServicoDeEstimativa(
      new EstimadorPorComposicao([
        new TempoDaFila(fila),
        new TempoDosPedidosReservados(fila),
        new TempoDePreparo(),
        new TempoDeDeslocamento('ida-e-volta'),
      ]),
      new ClassificadorDeChance(),
    ),
    campus: new MapaDoCampusEmMemoria(),
  }
}

export function montarServicosDaCantina(
  armazem: ArmazemDaCantina,
  relogioBase: Relogio = new RelogioDoSistema(),
): ServicosDaCantina {
  const { estoque, pedidos, cardapio, operacao, base } = montarBase(armazem, relogioBase)
  return {
    ...base,
    atendimento: new ServicoDeAtendimento(pedidos, estoque),
    chegada: new PrevisorDeChegada(),
    operacao,
    estoque: new ControleDeEstoque(cardapio, estoque),
  }
}

/**
 * Armazém usado pelos apps: sincroniza abas diferentes do navegador (/aluno e /cantina).
 * A outra implementação, ArmazemEmMemoria, é usada nos testes — e a troca entre as
 * duas não muda nenhuma tela (ver integracao.test.ts).
 */
export function criarArmazemEntreAbas(): ArmazemDaCantina {
  return new ArmazemBroadcastChannel()
}
