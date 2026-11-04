import { describe, expect, it } from 'vitest'

// Lê o código-fonte de todo o domínio como texto.
const fontes = import.meta.glob<string>('./**/*.ts', { query: '?raw', import: 'default', eager: true })

const importsDe = (codigo: string) =>
  [...codigo.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1])

// PRINCÍPIO: Inversão de Dependências (regra de dependência) — o domínio é o
// centro: não importa React, nem infra, nem UI, nem a raiz de composição.
// Este teste transforma a regra de arquitetura em algo verificável.
describe('Arquitetura: o domínio é TypeScript puro', () => {
  const arquivos = Object.entries(fontes).filter(([caminho]) => !caminho.endsWith('.test.ts'))

  it('encontrou os arquivos do domínio', () => {
    expect(arquivos.length).toBeGreaterThan(15)
  })

  it.each(arquivos)('%s não depende de React, UI, infra ou app', (_caminho, codigo) => {
    for (const modulo of importsDe(codigo)) {
      expect(modulo).not.toMatch(/^react/)
      expect(modulo).not.toMatch(/(^|\/)(infra|composicao|apps|design)\//)
      expect(modulo.startsWith('.')).toBe(true) // nenhuma biblioteca externa
    }
  })
})
