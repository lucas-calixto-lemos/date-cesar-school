/** Tema visual (claro/escuro). Assunto só da UI — o domínio não sabe disso. */
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

export function aplicarTema(tema: Tema): void {
  document.documentElement.dataset.theme = tema === 'escuro' ? 'dark' : 'light'
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tema === 'escuro' ? '#121214' : '#f93209')
}

export function salvarTema(tema: Tema): void {
  try {
    localStorage.setItem(CHAVE, tema)
  } catch {
    /* sem armazenamento: o tema vale só nesta sessão */
  }
}
