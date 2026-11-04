/*
 * Portas (interfaces) da operação da cantina.
 *
 * PRINCÍPIO: Segregação de Interfaces — cada lado recebe só a fatia que usa:
 *  - o ALUNO lê o status (StatusDaCantina) e consulta o estoque (EstoqueDeLeitura);
 *  - a CANTINA também altera (ControleDaCantina, Estoque).
 * Uma única implementação pode atender a todas, mas nenhum cliente depende
 * de métodos que não usa.
 */

export interface StatusDaCantina {
  cantinaAberta(): boolean
  reservasAbertas(): boolean
}

export interface ControleDaCantina extends StatusDaCantina {
  abrirCantina(): void
  fecharCantina(): void
  reabrirReservas(): void
  finalizarReservas(): void
}

export interface EstoqueDeLeitura {
  quantidadeDe(itemId: string): number
}

export interface Estoque extends EstoqueDeLeitura {
  retirar(itemId: string, quantidade: number): void
  repor(itemId: string, quantidade: number): void
}

/** Leitura do movimento da cantina — usada pela estimativa. */
export interface FilaDaCantina {
  pessoasNaFila(): number
  pedidosReservadosEmAberto(): number
}
