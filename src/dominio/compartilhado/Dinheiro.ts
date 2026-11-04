import { ErroDeDominio } from './ErroDeDominio'

// PRINCÍPIO: Ocultamento de Informação — o valor é guardado em centavos (inteiro)
// para evitar erros de ponto flutuante; ninguém fora desta classe sabe disso.
export class Dinheiro {
  private constructor(private readonly centavos: number) {}

  static reais(valor: number): Dinheiro {
    return Dinheiro.emCentavos(Math.round(valor * 100))
  }

  static emCentavos(centavos: number): Dinheiro {
    if (!Number.isInteger(centavos) || centavos < 0) {
      throw new ErroDeDominio('Valor monetário inválido.')
    }
    return new Dinheiro(centavos)
  }

  static zero(): Dinheiro {
    return new Dinheiro(0)
  }

  somar(outro: Dinheiro): Dinheiro {
    return new Dinheiro(this.centavos + outro.centavos)
  }

  multiplicar(quantidade: number): Dinheiro {
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      throw new ErroDeDominio('Quantidade inválida.')
    }
    return new Dinheiro(this.centavos * quantidade)
  }

  valorEmCentavos(): number {
    return this.centavos
  }

  ehPositivo(): boolean {
    return this.centavos > 0
  }

  igualA(outro: Dinheiro): boolean {
    return this.centavos === outro.centavos
  }

  formatar(): string {
    const reais = Math.floor(this.centavos / 100)
    const resto = String(this.centavos % 100).padStart(2, '0')
    const milhar = reais.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    return `R$ ${milhar},${resto}`
  }
}
