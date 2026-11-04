import type { ItemDoCardapio } from './ItemDoCardapio'

// PRINCÍPIO: Inversão de Dependências — o domínio define o contrato do repositório;
// a implementação (em memória hoje, API/banco amanhã) é injetada de fora.
export interface CardapioRepository {
  listarTodos(): ItemDoCardapio[]
  buscarPorId(id: string): ItemDoCardapio | undefined
}
