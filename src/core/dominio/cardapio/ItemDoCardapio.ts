import { Dinheiro } from '../compartilhado/Dinheiro'

export type Categoria = 'salgado' | 'doce' | 'bebida'

export const CATEGORIAS: ReadonlyArray<{ id: Categoria; rotulo: string }> = [
  { id: 'salgado', rotulo: 'Salgados' },
  { id: 'doce', rotulo: 'Doces' },
  { id: 'bebida', rotulo: 'Bebidas' },
]

export interface DadosDoItem {
  id: string
  nome: string
  descricao: string
  preco: Dinheiro
  categoria: Categoria
  /** Chave opaca da imagem; o domínio não sabe como ela é desenhada. */
  imagem: string
  minutosDePreparo: number
  disponivel: boolean
}

/** Forma serializável (texto/JSON) do item — para atravessar abas e, no futuro, a rede. */
export interface ItemSerializado {
  id: string
  nome: string
  descricao: string
  precoEmCentavos: number
  categoria: Categoria
  imagem: string
  minutosDePreparo: number
}

export class ItemDoCardapio {
  constructor(private readonly dados: DadosDoItem) {}

  static restaurar(d: ItemSerializado, disponivel = true): ItemDoCardapio {
    return new ItemDoCardapio({ ...d, preco: Dinheiro.emCentavos(d.precoEmCentavos), disponivel })
  }

  paraDados(): ItemSerializado {
    const { preco, disponivel: _disponivel, ...resto } = this.dados
    return { ...resto, precoEmCentavos: preco.valorEmCentavos() }
  }

  /** Mesmo item, com outra disponibilidade (o estoque decide). */
  comDisponibilidade(disponivel: boolean): ItemDoCardapio {
    return new ItemDoCardapio({ ...this.dados, disponivel })
  }

  id(): string {
    return this.dados.id
  }
  nome(): string {
    return this.dados.nome
  }
  descricao(): string {
    return this.dados.descricao
  }
  preco(): Dinheiro {
    return this.dados.preco
  }
  categoria(): Categoria {
    return this.dados.categoria
  }
  imagem(): string {
    return this.dados.imagem
  }
  minutosDePreparo(): number {
    return this.dados.minutosDePreparo
  }

  estaEsgotado(): boolean {
    return !this.dados.disponivel
  }

  precoPara(quantidade: number): Dinheiro {
    return this.dados.preco.multiplicar(quantidade)
  }
}
