import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { CardapioRepository } from './CardapioRepository'
import type { Categoria, ItemDoCardapio } from './ItemDoCardapio'

export class ItemNaoEncontradoError extends ErroDeDominio {}

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

/** Casos de uso de leitura do cardápio (ordenação e busca). */
export class ConsultaDeCardapio {
  // PRINCÍPIO: Inversão de Dependências — recebe a abstração CardapioRepository.
  constructor(private readonly repositorio: CardapioRepository) {}

  listarEmOrdemAlfabetica(): ItemDoCardapio[] {
    return [...this.repositorio.listarTodos()].sort((a, b) =>
      a.nome().localeCompare(b.nome(), 'pt-BR'),
    )
  }

  /** Busca ignorando acentos e maiúsculas ("pao" acha "Pão de queijo"). */
  pesquisar(termo: string, categoria?: Categoria): ItemDoCardapio[] {
    const alvo = normalizar(termo)
    return this.listarEmOrdemAlfabetica()
      .filter((item) => !categoria || item.categoria() === categoria)
      .filter((item) => normalizar(item.nome()).includes(alvo))
  }

  buscar(id: string): ItemDoCardapio {
    const item = this.repositorio.buscarPorId(id)
    if (!item) throw new ItemNaoEncontradoError(`Item "${id}" não existe no cardápio.`)
    return item
  }
}
