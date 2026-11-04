import type { PedidoSerializado } from '../pedido/Pedido'

/**
 * Tudo o que os dois apps compartilham, em formato serializável (JSON puro).
 * Serializável de propósito: assim o mesmo estado pode viver em memória,
 * atravessar abas (BroadcastChannel) ou, no futuro, vir de um servidor.
 */
export interface EstadoDaCantina {
  /** Cresce a cada alteração; usado para decidir qual cópia é a mais nova. */
  versao: number
  cantinaAberta: boolean
  reservasAbertas: boolean
  /** Quantidade disponível por id de item. */
  estoque: Record<string, number>
  pedidos: PedidoSerializado[]
  ultimaComanda: number
  /** Deslocamento do relógio simulado (debug), compartilhado entre os apps. */
  deslocamentoDoRelogioMs: number
}

export type Ouvinte = (estado: EstadoDaCantina) => void

/**
 * O "estado da cantina" compartilhado entre o app do aluno e o da cantina.
 *
 * Contrato (verificado em ArmazemDaCantina.contrato.test.ts para TODA implementação):
 *  - `ler()` devolve o estado atual;
 *  - `alterar(f)` aplica `f`, incrementa a versão e avisa os ouvintes;
 *  - `assinar(o)` registra um ouvinte e devolve a função que cancela a assinatura.
 */
// PRINCÍPIO: Inversão de Dependências — os dois apps dependem desta abstração,
// nunca de "memória" ou "BroadcastChannel". Trocar a implementação é decisão
// só da raiz de composição.
// PRINCÍPIO: padrão Observer — `assinar` é como as telas ficam sabendo, em tempo
// real, do que o outro app fez.
// PRINCÍPIO: Substituição de Liskov — qualquer implementação (memória, abas,
// servidor no futuro) precisa passar no mesmo teste de contrato.
export interface ArmazemDaCantina {
  ler(): EstadoDaCantina
  alterar(alteracao: (atual: EstadoDaCantina) => Omit<EstadoDaCantina, 'versao'>): void
  assinar(ouvinte: Ouvinte): () => void
}
