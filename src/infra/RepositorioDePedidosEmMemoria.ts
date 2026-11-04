import type { Comanda } from '../dominio/comanda/Comanda'
import type { Pedido } from '../dominio/pedido/Pedido'
import type { RepositorioDePedidos } from '../dominio/pedido/RepositorioDePedidos'

export class RepositorioDePedidosEmMemoria implements RepositorioDePedidos {
  private readonly pedidos: Pedido[] = []

  salvar(pedido: Pedido): void {
    if (!this.pedidos.includes(pedido)) this.pedidos.push(pedido)
  }

  buscarPorComanda(comanda: Comanda): Pedido | undefined {
    return this.pedidos.find((pedido) => pedido.ehDaComanda(comanda))
  }

  listarEmAberto(): Pedido[] {
    return this.pedidos.filter((pedido) => pedido.estaEmAberto())
  }
}
