import type { Dinheiro } from '../../compartilhado/Dinheiro'
import { Cobranca } from '../Cobranca'
import type { FormaDePagamento } from '../FormaDePagamento'

export default class PagamentoNaRetirada implements FormaDePagamento {
  readonly id = 'na-retirada'
  readonly nome = 'Pagar na retirada'
  readonly descricao = 'Pague no balcão quando buscar o lanche.'

  cobrar(valor: Dinheiro): Cobranca {
    return Cobranca.pendente(valor, `Pague ${valor.formatar()} no balcão`)
  }
}
