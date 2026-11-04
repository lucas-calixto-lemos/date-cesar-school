// Objetos de apoio para os testes do domínio (sem depender da infra).
import type { CardapioRepository } from '../cardapio/CardapioRepository'
import { ItemDoCardapio, type DadosDoItem } from '../cardapio/ItemDoCardapio'
import type { FilaDaCantina } from '../cantina/interfaces'
import type { Comanda } from '../comanda/Comanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import type { Pedido } from '../pedido/Pedido'
import type { RepositorioDePedidos } from '../pedido/RepositorioDePedidos'

export function umItem(dados: Partial<DadosDoItem> = {}): ItemDoCardapio {
  return new ItemDoCardapio({
    id: 'coxinha',
    nome: 'Coxinha',
    descricao: 'Coxinha de frango',
    preco: Dinheiro.reais(8),
    categoria: 'salgado',
    imagem: 'coxinha',
    minutosDePreparo: 1,
    disponivel: true,
    ...dados,
  })
}

export class CardapioFalso implements CardapioRepository {
  constructor(private readonly itens: ItemDoCardapio[]) {}
  listarTodos() {
    return this.itens
  }
  buscarPorId(id: string) {
    return this.itens.find((i) => i.id() === id)
  }
}

export class PedidosFalsos implements RepositorioDePedidos {
  readonly salvos: Pedido[] = []
  salvar(p: Pedido) {
    this.salvos.push(p)
  }
  buscarPorComanda(c: Comanda) {
    return this.salvos.find((p) => p.ehDaComanda(c))
  }
  listarEmAberto() {
    return this.salvos.filter((p) => p.estaEmAberto())
  }
}

export class FilaFalsa implements FilaDaCantina {
  constructor(
    private readonly pessoas: number,
    private readonly reservados: number,
  ) {}
  pessoasNaFila() {
    return this.pessoas
  }
  pedidosReservadosEmAberto() {
    return this.reservados
  }
}
