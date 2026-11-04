// Objetos de apoio para os testes do domínio (sem depender da infra).
import { LocalDoCampus } from '../campus/LocalDoCampus'
import type { CardapioRepository } from '../cardapio/CardapioRepository'
import { ItemDoCardapio, type DadosDoItem } from '../cardapio/ItemDoCardapio'
import type { ControleDaCantina, Estoque, FilaDaCantina } from '../cantina/portas'
import type { Comanda } from '../comanda/Comanda'
import { Dinheiro } from '../compartilhado/Dinheiro'
import { Pedido } from '../pedido/Pedido'
import type { RepositorioDePedidos } from '../pedido/RepositorioDePedidos'

export function umLocal(nome: string, minutosAteACantina: number, contexto?: string): LocalDoCampus {
  return LocalDoCampus.criar({ id: nome.toLowerCase(), nome, minutosAteACantina, contexto })
}

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

/** Guarda cópias serializadas, como um repositório de verdade (cada leitura é um objeto novo). */
export class PedidosFalsos implements RepositorioDePedidos {
  private readonly dados = new Map<number, ReturnType<Pedido['paraDados']>>()
  salvar(p: Pedido) {
    this.dados.set(Number(p.numeroDaComanda()), p.paraDados())
  }
  buscarPorComanda(c: Comanda) {
    const d = this.dados.get(Number(c.formatada()))
    return d ? Pedido.restaurar(d) : undefined
  }
  listarTodos() {
    return [...this.dados.values()].map((d) => Pedido.restaurar(d))
  }
  listarEmAberto() {
    return this.listarTodos().filter((p) => p.estaEmAberto())
  }
}

export class EstoqueFalso implements Estoque {
  constructor(readonly quantidades: Record<string, number> = {}) {}
  quantidadeDe(id: string) {
    return this.quantidades[id] ?? 0
  }
  retirar(id: string, q: number) {
    this.quantidades[id] = this.quantidadeDe(id) - q
  }
  repor(id: string, q: number) {
    this.quantidades[id] = this.quantidadeDe(id) + q
  }
}

export class OperacaoFalsa implements ControleDaCantina {
  aberta = true
  reservas = true
  cantinaAberta() {
    return this.aberta
  }
  reservasAbertas() {
    return this.reservas
  }
  abrirCantina() {
    this.aberta = true
  }
  fecharCantina() {
    this.aberta = false
  }
  reabrirReservas() {
    this.reservas = true
  }
  finalizarReservas() {
    this.reservas = false
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

/** Data de hoje (fixa) num horário. */
export const as = (horas: number, minutos = 0) => new Date(2026, 10, 4, horas, minutos, 0, 0)
