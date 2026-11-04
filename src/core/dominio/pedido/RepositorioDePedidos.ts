import type { Comanda } from '../comanda/Comanda'
import type { Pedido } from './Pedido'

// PRINCÍPIO: Inversão de Dependências — contrato definido pelo domínio.
// Cada leitura devolve um Pedido "fresco"; quem altera um pedido chama `salvar`.
export interface RepositorioDePedidos {
  salvar(pedido: Pedido): void
  buscarPorComanda(comanda: Comanda): Pedido | undefined
  listarEmAberto(): Pedido[]
  listarTodos(): Pedido[]
}
