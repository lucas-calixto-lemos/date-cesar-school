/** Tema visual do app do aluno (claro/escuro). Assunto só da UI — o domínio não sabe disso. */
export type Tema = 'claro' | 'escuro'

const CHAVE = 'date:tema'

/** Preferência salva neste navegador; senão, a do sistema operacional. */
export function temaInicial(): Tema {
  try {
    const salvo = localStorage.getItem(CHAVE)
    if (salvo === 'claro' || salvo === 'escuro') return salvo
  } catch {
    /* armazenamento indisponível (aba anônima etc.): segue sem */
  }
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'escuro' : 'claro'
}

export function salvarTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    /* sem armazenamento: o tema vale só nesta sessão */
  }
}
