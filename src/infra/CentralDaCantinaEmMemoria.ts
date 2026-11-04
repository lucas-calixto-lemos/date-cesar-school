import type { AvisoDeRetirada, NotificadorCantina, PainelDaCantina } from '../dominio/cantina/interfaces'
import type { Comanda } from '../dominio/comanda/Comanda'
import type { RepositorioDePedidos } from '../dominio/pedido/RepositorioDePedidos'

type Ouvinte = (aviso: AvisoDeRetirada) => void

/**
 * "Servidor" da cantina, em memória. Implementa as DUAS interfaces, mas na
 * composição o aluno recebe só `NotificadorCantina` e a cantina só `PainelDaCantina`.
 */
export class CentralDaCantinaEmMemoria implements NotificadorCantina, PainelDaCantina {
  private avisos: AvisoDeRetirada[] = []
  private readonly ouvintes = new Set<Ouvinte>()

  constructor(private readonly pedidos: RepositorioDePedidos) {}

  // ---- lado do aluno ----
  avisarAlunoACaminho(aviso: AvisoDeRetirada): void {
    this.avisos.push(aviso)
    this.ouvintes.forEach((ouvinte) => ouvinte(aviso))
  }

  // ---- lado da cantina ----
  avisosPendentes(): AvisoDeRetirada[] {
    return [...this.avisos]
  }

  marcarComoPronto(comanda: Comanda): void {
    this.pedidos.buscarPorComanda(comanda)?.marcarPronto()
    this.avisos = this.avisos.filter((aviso) => !aviso.comanda.igualA(comanda))
  }

  aoReceberAviso(ouvinte: Ouvinte): () => void {
    this.ouvintes.add(ouvinte)
    return () => this.ouvintes.delete(ouvinte)
  }
}
