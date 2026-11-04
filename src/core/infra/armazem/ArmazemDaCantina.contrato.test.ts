import { afterEach, describe, expect, it } from 'vitest'
import type { ArmazemDaCantina } from '../../dominio/sincronizacao/ArmazemDaCantina'
import { ArmazemBroadcastChannel } from './ArmazemBroadcastChannel'
import { ArmazemEmMemoria } from './ArmazemEmMemoria'

const abertos: ArmazemBroadcastChannel[] = []
let canal = 0
const novoCanal = () => `teste-contrato-${Date.now()}-${canal++}`
const broadcast = (nome = novoCanal()) => {
  const a = new ArmazemBroadcastChannel(nome)
  abertos.push(a)
  return a
}
const esperar = (ms = 40) => new Promise((ok) => setTimeout(ok, ms))

afterEach(() => abertos.splice(0).forEach((a) => a.fechar()))

// PRINCÍPIO: Substituição de Liskov — o MESMO contrato vale para todas as implementações.
const IMPLEMENTACOES: Array<[string, () => ArmazemDaCantina]> = [
  ['em memória', () => new ArmazemEmMemoria()],
  ['BroadcastChannel', () => broadcast()],
]

describe.each(IMPLEMENTACOES)('Contrato do ArmazemDaCantina: %s', (_nome, criar) => {
  it('começa no estado inicial (versão 0, cantina e reservas abertas)', () => {
    const estado = criar().ler()
    expect(estado.versao).toBe(0)
    expect(estado.cantinaAberta).toBe(true)
    expect(estado.reservasAbertas).toBe(true)
    expect(estado.pedidos).toEqual([])
  })

  it('alterar aplica a mudança e incrementa a versão', () => {
    const armazem = criar()
    armazem.alterar((e) => ({ ...e, cantinaAberta: false }))
    armazem.alterar((e) => ({ ...e, ultimaComanda: e.ultimaComanda + 1 }))
    expect(armazem.ler()).toMatchObject({ versao: 2, cantinaAberta: false, ultimaComanda: 19 })
  })

  it('avisa os ouvintes (Observer) e para de avisar após cancelar a assinatura', () => {
    const armazem = criar()
    const versoes: number[] = []
    const cancelar = armazem.assinar((e) => versoes.push(e.versao))
    armazem.alterar((e) => e)
    cancelar()
    armazem.alterar((e) => e)
    expect(versoes).toEqual([1])
  })
})

describe('ArmazemBroadcastChannel entre "abas"', () => {
  it('uma aba altera e a outra recebe, avisando seus ouvintes', async () => {
    const nome = novoCanal()
    const aba1 = broadcast(nome)
    const aba2 = broadcast(nome)
    let avisada = false
    aba2.assinar(() => (avisada = true))

    aba1.alterar((e) => ({ ...e, reservasAbertas: false }))
    await esperar()

    expect(aba2.ler().reservasAbertas).toBe(false)
    expect(aba2.ler().versao).toBe(1)
    expect(avisada).toBe(true)
  })

  it('uma aba aberta depois pede e recebe o estado atual', async () => {
    const nome = novoCanal()
    const antiga = broadcast(nome)
    antiga.alterar((e) => ({ ...e, ultimaComanda: 42 }))
    await esperar()

    const nova = broadcast(nome)
    await esperar()
    expect(nova.ler().ultimaComanda).toBe(42)
  })

  it('canais com nomes diferentes não se misturam', async () => {
    const a = broadcast()
    const b = broadcast()
    a.alterar((e) => ({ ...e, cantinaAberta: false }))
    await esperar()
    expect(b.ler().cantinaAberta).toBe(true)
  })
})
