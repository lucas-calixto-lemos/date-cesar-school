import type { CardapioRepository } from '../dominio/cardapio/CardapioRepository'
import type { ItemDoCardapio } from '../dominio/cardapio/ItemDoCardapio'

export class CardapioEmMemoria implements CardapioRepository {
  private readonly itens: Map<string, ItemDoCardapio>

  constructor(itens: ItemDoCardapio[]) {
    this.itens = new Map(itens.map((item) => [item.id(), item]))
  }

  listarTodos(): ItemDoCardapio[] {
    return [...this.itens.values()]
  }

  buscarPorId(id: string): ItemDoCardapio | undefined {
    return this.itens.get(id)
  }
}
