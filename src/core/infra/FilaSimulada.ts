import type { FilaDaCantina } from '../dominio/cantina/portas'
import { HoraDoDia } from '../dominio/compartilhado/HoraDoDia'
import type { RepositorioDePedidos } from '../dominio/pedido/RepositorioDePedidos'
import type { Relogio } from '../dominio/tempo/Relogio'

/**
 * Fila "de mentirinha" para a PoC. Varia com o horário (pico entre 20h e 22h)
 * e fica estável dentro de cada bloco de 5 minutos, para a estimativa não pular.
 */
export class FilaSimulada implements FilaDaCantina {
  constructor(
    private readonly relogio: Relogio,
    private readonly pedidos: RepositorioDePedidos,
    private readonly reservasDeOutrosAlunos = 6,
  ) {}

  pessoasNaFila(): number {
    const hora = HoraDoDia.deData(this.relogio.agora())
    const bloco = Math.floor((hora.horas() * 60 + hora.minutos()) / 5)
    const ruido = pseudoAleatorio(bloco) // 0..1
    const ehPico = !hora.ehAntesDe(HoraDoDia.de(20, 0)) && hora.ehAntesDe(HoraDoDia.de(22, 30))
    const base = ehPico ? 3 : 0
    const variacao = ehPico ? 7 : 3 // pico: 3 a 9 pessoas; fora do pico: 0 a 2
    return base + Math.floor(ruido * variacao)
  }

  pedidosReservadosEmAberto(): number {
    return this.reservasDeOutrosAlunos + this.pedidos.listarEmAberto().length
  }
}

function pseudoAleatorio(semente: number): number {
  const x = Math.sin(semente * 9301 + 49297) * 233280
  return x - Math.floor(x)
}
