import { describe, expect, it } from 'vitest'
import { umItem } from '../dominio/__testes__/fabricas'
import { LocalDoCampus } from '../dominio/campus/LocalDoCampus'
import type { NotificadorCantina, PainelDaCantina } from '../dominio/cantina/interfaces'
import { ServicoDeRetirada } from '../dominio/cantina/ServicoDeRetirada'
import { Comanda } from '../dominio/comanda/Comanda'
import { Dinheiro } from '../dominio/compartilhado/Dinheiro'
import { HoraDoDia } from '../dominio/compartilhado/HoraDoDia'
import { Cobranca } from '../dominio/pagamento/Cobranca'
import { Pedido } from '../dominio/pedido/Pedido'
import { JanelaDeRetirada } from '../dominio/reserva/JanelaDeRetirada'
import { RelogioFixo } from '../dominio/tempo/Relogio'
import { CentralDaCantinaEmMemoria } from './CentralDaCantinaEmMemoria'
import { CozinhaSimulada } from './CozinhaSimulada'
import { RepositorioDePedidosEmMemoria } from './RepositorioDePedidosEmMemoria'

describe('Central da cantina (aluno avisa → cantina vê → pedido fica pronto)', () => {
  it('liga as duas pontas só pelas interfaces segregadas', () => {
    const pedidos = new RepositorioDePedidosEmMemoria()
    const central = new CentralDaCantinaEmMemoria(pedidos)
    const notificador: NotificadorCantina = central
    const painel: PainelDaCantina = central

    const agendadas: Array<() => void> = []
    new CozinhaSimulada(painel, 1000, (acao) => agendadas.push(acao)).ligar()

    const pedido = new Pedido(
      Comanda.de(19),
      umItem(),
      1,
      JanelaDeRetirada.criar(HoraDoDia.de(20, 0), 15),
      Cobranca.pendente(Dinheiro.reais(8), 'Pague no balcão'),
    )
    pedidos.salvar(pedido)

    new ServicoDeRetirada(notificador, RelogioFixo.as(20, 5)).estouIndoBuscar(pedido, LocalDoCampus.porId('bloco-b'))
    expect(painel.avisosPendentes()).toHaveLength(1)
    expect(painel.avisosPendentes()[0].localDoAluno).toBe('Bloco B')

    agendadas.forEach((acao) => acao()) // "passa" o tempo da cozinha
    expect(pedido.situacaoAtual()).toBe('pronto')
    expect(painel.avisosPendentes()).toHaveLength(0)
  })
})
