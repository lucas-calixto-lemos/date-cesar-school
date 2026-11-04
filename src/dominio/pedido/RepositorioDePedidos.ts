import type { Comanda } from '../comanda/Comanda'
import type { Pedido } from './Pedido'

// PRINCÍPIO: Inversão de Dependências — contrato definido pelo domínio.
export interface RepositorioDePedidos {
  salvar(pedido: Pedido): void
  buscarPorComanda(comanda: Comanda): Pedido | undefined
  listarEmAberto(): Pedido[]
}
