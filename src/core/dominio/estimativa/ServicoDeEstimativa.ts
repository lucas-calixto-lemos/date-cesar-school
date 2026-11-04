import type { LocalDoCampus } from '../campus/LocalDoCampus'
import type { ItemDoCardapio } from '../cardapio/ItemDoCardapio'
import { ErroDeDominio } from '../compartilhado/ErroDeDominio'
import type { ClassificadorDeChance, NivelDeChance } from './ClassificadorDeChance'
import type { EstimadorDeTempo, Estimativa } from './EstimadorDeTempo'

export interface PerguntaDeEstimativa {
  item: ItemDoCardapio
  local: LocalDoCampus
  minutosDeIntervaloRestantes: number
}

export interface RespostaDeEstimativa {
  estimativa: Estimativa
  nivel: NivelDeChance
  folgaEmMinutos: number
}

/** Caso de uso "Estimar": junta o cálculo de tempo com a classificação. */
export class ServicoDeEstimativa {
  static readonly MAXIMO_DE_MINUTOS_RESTANTES = 30

  constructor(
    private readonly estimador: EstimadorDeTempo,
    private readonly classificador: ClassificadorDeChance,
  ) {}

  responder(pergunta: PerguntaDeEstimativa): RespostaDeEstimativa {
    const restantes = pergunta.minutosDeIntervaloRestantes
    if (!Number.isInteger(restantes) || restantes < 0 || restantes > ServicoDeEstimativa.MAXIMO_DE_MINUTOS_RESTANTES) {
      throw new ErroDeDominio(
        `Informe de 0 a ${ServicoDeEstimativa.MAXIMO_DE_MINUTOS_RESTANTES} minutos restantes.`,
      )
    }
    const estimativa = this.estimador.estimar({ item: pergunta.item, local: pergunta.local })
    return {
      estimativa,
      nivel: this.classificador.classificar(estimativa.minutosNecessarios, restantes),
      folgaEmMinutos: restantes - estimativa.minutosNecessarios,
    }
  }
}
