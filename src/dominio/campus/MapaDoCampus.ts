import type { Predio } from './Predio'

// PRINCÍPIO: Inversão de Dependências — o domínio só conhece este contrato.
// Hoje o mapa vem de dados em memória (infra/dadosDoCampus.ts); quando Apolo e
// Tiradentes forem mapeados, ou se vier de uma API, nada no domínio ou na UI muda.
export interface MapaDoCampus {
  predios(): Predio[]
}
