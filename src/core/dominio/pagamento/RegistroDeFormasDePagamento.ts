import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { FormaDePagamento } from './FormaDePagamento'

export class FormaDePagamentoDesconhecidaError extends ErroDeDominio {}

// PRINCÍPIO: Aberto/Fechado — a UI lista as formas a partir daqui, sem if/switch
// por tipo. Uma forma nova entra no registro; ninguém mais é alterado.
export class RegistroDeFormasDePagamento {
  private readonly formas = new Map<string, FormaDePagamento>()

  registrar(forma: FormaDePagamento): void {
    if (this.formas.has(forma.id)) {
      throw new ErroDeDominio(`Já existe uma forma de pagamento com id "${forma.id}".`)
    }
    this.formas.set(forma.id, forma)
  }

  listar(): FormaDePagamento[] {
    return [...this.formas.values()]
  }

  buscar(id: string): FormaDePagamento {
    const forma = this.formas.get(id)
    if (!forma) throw new FormaDePagamentoDesconhecidaError(`Forma de pagamento "${id}" não existe.`)
    return forma
  }
}
