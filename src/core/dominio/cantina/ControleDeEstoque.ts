import type { CardapioRepository } from '../cardapio/CardapioRepository'
import type { ItemDoCardapio } from '../cardapio/ItemDoCardapio'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { Estoque } from './portas'

export interface LinhaDeEstoque {
  item: ItemDoCardapio
  quantidade: number
}

/** Caso de uso da CANTINA: ver e ajustar quantas unidades há de cada item. */
export class ControleDeEstoque {
  static readonly MAXIMO_POR_ITEM = 99

  constructor(
    private readonly cardapio: CardapioRepository,
    private readonly estoque: Estoque,
  ) {}

  listar(): LinhaDeEstoque[] {
    return this.cardapio
      .listarTodos()
      .map((item) => ({ item, quantidade: this.estoque.quantidadeDe(item.id()) }))
      .sort((a, b) => a.item.nome().localeCompare(b.item.nome(), 'pt-BR'))
  }

  aumentar(itemId: string): void {
    if (this.estoque.quantidadeDe(itemId) >= ControleDeEstoque.MAXIMO_POR_ITEM) {
      throw new ErroDeDominio(`O máximo por item é ${ControleDeEstoque.MAXIMO_POR_ITEM}.`)
    }
    this.estoque.repor(itemId, 1)
  }

  diminuir(itemId: string): void {
    if (this.estoque.quantidadeDe(itemId) <= 0) return
    this.estoque.retirar(itemId, 1)
  }
}
