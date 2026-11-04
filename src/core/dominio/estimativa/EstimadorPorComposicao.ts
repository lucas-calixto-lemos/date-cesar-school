import type {
  ComponenteDeTempo,
  ContextoDaEstimativa,
  EstimadorDeTempo,
  Estimativa,
} from './EstimadorDeTempo'

// PRINCÍPIO: Composição em vez de Herança — o estimador não é uma hierarquia
// (EstimadorComFila extends EstimadorComPreparo...). Ele é montado com uma lista
// de componentes; para considerar um fator novo (ex.: chuva), cria-se outro
// componente e adiciona-se à lista na composição — Aberto/Fechado de brinde.
export class EstimadorPorComposicao implements EstimadorDeTempo {
  constructor(private readonly componentes: ComponenteDeTempo[]) {}

  estimar(contexto: ContextoDaEstimativa): Estimativa {
    const parcelas = this.componentes.map((componente) => componente.calcular(contexto))
    const total = parcelas.reduce((soma, parcela) => soma + parcela.minutos, 0)
    return { minutosNecessarios: Math.ceil(total), parcelas }
  }
}
