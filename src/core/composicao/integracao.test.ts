import { afterEach, describe, expect, it } from 'vitest'
import { LocalDoCampus } from '../dominio/campus/LocalDoCampus'
import { Comanda } from '../dominio/comanda/Comanda'
import { HoraDoDia } from '../dominio/compartilhado/HoraDoDia'
import { JanelaDeRetirada } from '../dominio/reserva/JanelaDeRetirada'
import type { ArmazemDaCantina } from '../dominio/sincronizacao/ArmazemDaCantina'
import { RelogioFixo } from '../dominio/tempo/Relogio'
import { ArmazemBroadcastChannel } from '../infra/armazem/ArmazemBroadcastChannel'
import { ArmazemEmMemoria } from '../infra/armazem/ArmazemEmMemoria'
import { montarServicosDaCantina, montarServicosDoAluno } from './composicao'

interface Cenario {
  armazemDoAluno: ArmazemDaCantina
  armazemDaCantina: ArmazemDaCantina
  /** Tempo para a mudança chegar do outro lado (0 em memória). */
  sincronizar(): Promise<void>
  fechar(): void
}

let n = 0
const CENARIOS: Array<[string, () => Cenario]> = [
  [
    'em memória (o mesmo armazém para os dois apps)',
    () => {
      const armazem = new ArmazemEmMemoria()
      return { armazemDoAluno: armazem, armazemDaCantina: armazem, sincronizar: async () => {}, fechar: () => {} }
    },
  ],
  [
    'BroadcastChannel (um armazém por "aba", como /aluno e /cantina)',
    () => {
      const nome = `teste-integracao-${Date.now()}-${n++}`
      const aluno = new ArmazemBroadcastChannel(nome)
      const cantina = new ArmazemBroadcastChannel(nome)
      return {
        armazemDoAluno: aluno,
        armazemDaCantina: cantina,
        sincronizar: () => new Promise((ok) => setTimeout(ok, 40)),
        fechar: () => (aluno.fechar(), cantina.fechar()),
      }
    },
  ],
]

let fechar = () => {}
afterEach(() => fechar())

// PRINCÍPIO: Aberto/Fechado + Liskov — o MESMO roteiro passa com as duas
// implementações. Os serviços (e as telas, que só usam os serviços) não mudam.
describe.each(CENARIOS)('Aluno e cantina sincronizados: %s', (_nome, montar) => {
  it('reserva, bloqueios, estoque, play, entrega e cancelamento refletem nos dois lados', async () => {
    const c = montar()
    fechar = c.fechar
    const base = RelogioFixo.as(14, 0)
    const aluno = montarServicosDoAluno(c.armazemDoAluno, base)
    const cantina = montarServicosDaCantina(c.armazemDaCantina, base)
    const pix = aluno.formasDePagamento.buscar('pix-simulado')
    const janela = JanelaDeRetirada.criar(HoraDoDia.de(20, 15), 20)

    // 1. Aluno reserva → a cantina vê o pedido e o estoque baixa.
    const pedido = aluno.reserva.reservar({ itemId: 'coxinha', quantidade: 2, janela, formaDePagamento: pix })
    await c.sincronizar()
    const lista = cantina.atendimento.listarPedidos()
    expect(lista.map((p) => p.numeroDaComanda())).toEqual(['019'])
    expect(lista[0].nomeDaFormaDePagamento()).toBe('Pix agora')
    expect(lista[0].estaPago()).toBe(true)
    expect(cantina.estoque.listar().find((l) => l.item.id() === 'coxinha')!.quantidade).toBe(10)

    // 2. Cantina fecha → aluno é bloqueado, com motivo. Reabre → libera.
    cantina.operacao.fecharCantina()
    await c.sincronizar()
    expect(aluno.bloqueioDeReserva.motivoDoBloqueio()).toMatch(/fechada/)
    expect(() =>
      aluno.reserva.reservar({ itemId: 'pastel', quantidade: 1, janela, formaDePagamento: pix }),
    ).toThrow(/fechada/)
    cantina.operacao.abrirCantina()
    await c.sincronizar()
    expect(aluno.bloqueioDeReserva.motivoDoBloqueio()).toBeNull()

    // 3. Cantina finaliza as reservas → aluno bloqueado; reabre → libera.
    cantina.operacao.finalizarReservas()
    await c.sincronizar()
    expect(aluno.bloqueioDeReserva.motivoDoBloqueio()).toMatch(/finalizou/)
    cantina.operacao.reabrirReservas()
    await c.sincronizar()

    // 4. Cantina zera o brownie → aparece esgotado para o aluno.
    expect(aluno.cardapio.buscar('brownie').estaEsgotado()).toBe(false)
    for (let i = 0; i < 12; i++) {
      cantina.estoque.diminuir('brownie')
      await c.sincronizar()
    }
    expect(aluno.cardapio.buscar('brownie').estaEsgotado()).toBe(true)

    // 5. Relógio do debug é compartilhado; aluno dá o play → cantina vê "a caminho" com previsão.
    aluno.controleDeRelogio.ajustarPara(HoraDoDia.de(20, 20))
    await c.sincronizar()
    expect(HoraDoDia.deData(cantina.relogio.agora()).toString()).toBe('20:20')
    const meu = aluno.retirada.acompanhar(pedido.comanda())!
    const recepcao = LocalDoCampus.criar({ id: 'recepcao', nome: 'Recepção', minutosAteACantina: 3, contexto: 'Brum · Bloco B' })
    aluno.retirada.estouIndoBuscar(meu, recepcao)
    await c.sincronizar()
    const naCantina = cantina.atendimento.listarPedidos()[0]
    expect(naCantina.situacaoAtual()).toBe('a-caminho')
    expect(naCantina.localDoAluno()).toBe('Brum · Bloco B · Recepção')
    const chegada = cantina.chegada.prever(naCantina)!
    expect((chegada.fim - chegada.inicio) / 60_000).toBe(3)

    // 6. Cantina entrega → aluno vê "entregue".
    cantina.atendimento.marcarEntregue(Comanda.de(19))
    await c.sincronizar()
    expect(aluno.retirada.acompanhar(pedido.comanda())!.situacaoAtual()).toBe('entregue')

    // 7. Outro pedido cancelado pela cantina → aluno vê "cancelado" e o estoque volta.
    aluno.controleDeRelogio.voltarAoHorarioReal()
    await c.sincronizar()
    const outro = aluno.reserva.reservar({ itemId: 'pastel', quantidade: 3, janela, formaDePagamento: pix })
    await c.sincronizar()
    cantina.atendimento.cancelar(outro.comanda())
    await c.sincronizar()
    expect(aluno.retirada.acompanhar(outro.comanda())!.situacaoAtual()).toBe('cancelado')
    expect(cantina.estoque.listar().find((l) => l.item.id() === 'pastel')!.quantidade).toBe(12)

    // 8. As comandas não se repetem entre os dois lados.
    expect(outro.numeroDaComanda()).toBe('020')
  })
})

describe.each(CENARIOS)('Resetar teste: %s', (_nome, montar) => {
  it('o reset feito em um app apaga tudo nos dois, e as comandas recomeçam em 019', async () => {
    const c = montar()
    fechar = c.fechar
    const base = RelogioFixo.as(14, 0)
    const aluno = montarServicosDoAluno(c.armazemDoAluno, base)
    const cantina = montarServicosDaCantina(c.armazemDaCantina, base)
    const janela = JanelaDeRetirada.criar(HoraDoDia.de(20, 0), 15)
    const naRetirada = aluno.formasDePagamento.buscar('na-retirada')

    // Bagunça o estado: reserva, fecha a cantina, mexe no estoque e no relógio.
    aluno.reserva.reservar({ itemId: 'coxinha', quantidade: 3, janela, formaDePagamento: naRetirada })
    await c.sincronizar()
    cantina.operacao.fecharCantina()
    cantina.estoque.aumentar('brownie')
    aluno.controleDeRelogio.ajustarPara(HoraDoDia.de(20, 30))
    await c.sincronizar()
    expect(cantina.atendimento.listarPedidos()).toHaveLength(1)

    // A CANTINA reseta (poderia ser o aluno: é a mesma operação nos dois apps).
    cantina.reiniciarTeste()
    await c.sincronizar()

    // ...e o ALUNO vê tudo zerado.
    expect(cantina.atendimento.listarPedidos()).toHaveLength(0)
    expect(aluno.bloqueioDeReserva.motivoDoBloqueio()).toBeNull()
    expect(aluno.controleDeRelogio.estaAjustado()).toBe(false)
    expect(HoraDoDia.deData(aluno.relogio.agora()).toString()).toBe('14:00')
    const qtd = (id: string) => cantina.estoque.listar().find((l) => l.item.id() === id)!.quantidade
    expect(qtd('coxinha')).toBe(12)
    expect(qtd('brownie')).toBe(12)
    expect(aluno.cardapio.buscar('bolo-de-pote').estaEsgotado()).toBe(true)

    const nova = aluno.reserva.reservar({ itemId: 'pastel', quantidade: 1, janela, formaDePagamento: naRetirada })
    expect(nova.numeroDaComanda()).toBe('019')
  })
})
