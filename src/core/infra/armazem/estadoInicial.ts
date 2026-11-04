import type { EstadoDaCantina } from '../../dominio/sincronizacao/ArmazemDaCantina'
import { ESTOQUE_INICIAL } from '../dadosDoCardapio'

/** Como o dia começa: cantina aberta, reservas liberadas, estoque cheio, sem pedidos. */
export function estadoInicial(): EstadoDaCantina {
  return {
    versao: 0,
    cantinaAberta: true,
    reservasAbertas: true,
    estoque: { ...ESTOQUE_INICIAL },
    pedidos: [],
    // Comandas de outros alunos já saíram hoje: a primeira do teste é 019.
    ultimaComanda: 18,
    deslocamentoDoRelogioMs: 0,
  }
}
