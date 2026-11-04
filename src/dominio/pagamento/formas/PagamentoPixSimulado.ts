import type { Dinheiro } from '../../compartilhado/Dinheiro'
import { Cobranca } from '../Cobranca'
import type { FormaDePagamento } from '../FormaDePagamento'

/** PoC: não fala com banco nenhum. Gera um "copia e cola" falso e aprova na hora. */
export default class PagamentoPixSimulado implements FormaDePagamento {
  readonly id = 'pix-simulado'
  readonly nome = 'Pix agora'
  readonly descricao = 'Pague já e só retire. (Simulado: nenhum valor é cobrado.)'

  cobrar(valor: Dinheiro, referencia: string): Cobranca {
    const centavos = String(valor.valorEmCentavos()).padStart(6, '0')
    const copiaECola = `00020126PIXSIMULADO-DATE-CESAR52040000530398654${centavos}62070503${referencia}6304FAKE`
    return Cobranca.paga(valor, 'Pago via Pix', copiaECola)
  }
}
