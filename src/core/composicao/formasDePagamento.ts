import type { FormaDePagamento } from '../dominio/pagamento/FormaDePagamento'
import { RegistroDeFormasDePagamento } from '../dominio/pagamento/RegistroDeFormasDePagamento'

type ModuloDeForma = { default: new () => FormaDePagamento }

// Descobre, em tempo de build, todo arquivo em dominio/pagamento/formas/.
const modulos = import.meta.glob<ModuloDeForma>(
  ['../dominio/pagamento/formas/*.ts', '!../dominio/pagamento/formas/*.test.ts'],
  { eager: true },
)

// PRINCÍPIO: Aberto/Fechado — para uma forma nova aparecer no app basta CRIAR um
// arquivo com a classe em dominio/pagamento/formas/. Este arquivo não muda,
// a tela não muda, o ServicoDeReserva não muda.
export function criarRegistroDeFormasDePagamento(): RegistroDeFormasDePagamento {
  const registro = new RegistroDeFormasDePagamento()
  Object.values(modulos).forEach((modulo) => registro.registrar(new modulo.default()))
  return registro
}
