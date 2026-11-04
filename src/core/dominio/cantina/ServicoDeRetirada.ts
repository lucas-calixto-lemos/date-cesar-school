import type { LocalDoCampus } from '../campus/LocalDoCampus'
import type { Comanda } from '../comanda/Comanda'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import type { Pedido } from '../pedido/Pedido'
import type { RepositorioDePedidos } from '../pedido/RepositorioDePedidos'
import type { Relogio } from '../tempo/Relogio'

/**
 * Casos de uso do ALUNO depois de reservar: acompanhar o pedido e dar o "play".
 * Avisar a cantina = gravar o pedido "a caminho" no repositório compartilhado;
 * o app da cantina, que observa o mesmo estado, vê a mudança na hora.
 */
export class ServicoDeRetirada {
  constructor(
    private readonly pedidos: RepositorioDePedidos,
    private readonly relogio: Relogio,
  ) {}

  /** O aluno só acompanha o próprio pedido, pela comanda. */
  acompanhar(comanda: Comanda): Pedido | undefined {
    return this.pedidos.buscarPorComanda(comanda)
  }

  podeAvisar(pedido: Pedido): boolean {
    return pedido.podeAvisarQueEstaIndo(HoraDoDia.deData(this.relogio.agora()))
  }

  estouIndoBuscar(pedido: Pedido, local: LocalDoCampus): void {
    pedido.avisarQueEstaIndo(local, this.relogio.agora())
    this.pedidos.salvar(pedido)
  }
}
