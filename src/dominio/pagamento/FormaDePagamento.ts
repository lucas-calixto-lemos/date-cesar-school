import type { Dinheiro } from '../compartilhado/Dinheiro'
import type { Cobranca } from './Cobranca'

/**
 * Contrato de toda forma de pagamento.
 *
 * Para criar uma nova forma basta criar UMA classe em `dominio/pagamento/formas/`
 * com `export default class ... implements FormaDePagamento` e construtor sem
 * parâmetros obrigatórios. Ela é descoberta e registrada automaticamente
 * (ver `app/formasDePagamento.ts`) e aparece na tela de reserva.
 *
 * Contrato que toda implementação deve respeitar (testado em FormaDePagamento.contrato.test.ts):
 *  - `id` único e estável; `nome` e `descricao` não vazios;
 *  - `cobrar` não lança para valor positivo e devolve uma Cobranca com o MESMO valor.
 */
// PRINCÍPIO: Aberto/Fechado — o sistema está aberto a novas formas de pagamento
// e fechado para modificação: nenhuma tela, serviço ou registro muda.
// PRINCÍPIO: Substituição de Liskov — qualquer forma pode ser usada onde se espera
// FormaDePagamento; o contrato acima é verificado por um teste único para todas.
export interface FormaDePagamento {
  readonly id: string
  readonly nome: string
  readonly descricao: string
  /** @param referencia identificação do pedido (ex.: número da comanda). */
  cobrar(valor: Dinheiro, referencia: string): Cobranca
}
