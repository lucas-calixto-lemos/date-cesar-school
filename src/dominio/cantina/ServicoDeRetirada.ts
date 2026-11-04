import type { LocalDoCampus } from '../campus/LocalDoCampus'
import { HoraDoDia } from '../compartilhado/HoraDoDia'
import type { Pedido } from '../pedido/Pedido'
import type { Relogio } from '../tempo/Relogio'
import type { NotificadorCantina } from './interfaces'

/** Caso de uso do aluno: "estou indo buscar" (o botão play). */
export class ServicoDeRetirada {
  // PRINCÍPIO: Segregação de Interfaces — depende só de NotificadorCantina,
  // não do painel completo da cantina.
  constructor(
    private readonly notificador: NotificadorCantina,
    private readonly relogio: Relogio,
  ) {}

  podeAvisar(pedido: Pedido): boolean {
    return pedido.podeAvisarQueEstaIndo(this.horaAtual())
  }

  estouIndoBuscar(pedido: Pedido, local: LocalDoCampus): void {
    const agora = this.horaAtual()
    pedido.avisarQueEstaIndo(local, agora)
    this.notificador.avisarAlunoACaminho({
      comanda: pedido.comanda(),
      descricaoDoPedido: pedido.descricaoCurta(),
      localDoAluno: local.descricao(),
      horario: agora,
      jaPago: pedido.estaPago(),
    })
  }

  private horaAtual(): HoraDoDia {
    return HoraDoDia.deData(this.relogio.agora())
  }
}
