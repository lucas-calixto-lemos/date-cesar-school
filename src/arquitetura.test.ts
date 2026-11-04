import { describe, expect, it } from 'vitest'

// Código-fonte de todo o projeto, como texto (sem executar nada).
const fontes = import.meta.glob<string>(['./**/*.ts', './**/*.tsx', '!./**/*.test.ts'], {
  query: '?raw',
  import: 'default',
  eager: true,
})

/** Resolve os imports relativos de um arquivo para caminhos a partir de src/. */
function dependencias(arquivo: string, codigo: string): string[] {
  const pasta = arquivo.split('/').slice(0, -1)
  return [...codigo.matchAll(/(?:from|import)\s+['"]([^'"]+)['"]/g)]
    .map((m) => m[1])
    .map((espec) => {
      if (!espec.startsWith('.')) return espec // pacote externo (react...)
      const partes = [...pasta]
      for (const p of espec.split('/')) {
        if (p === '..') partes.pop()
        else if (p !== '.') partes.push(p)
      }
      return partes.join('/')
    })
}

const ARQUIVOS = Object.entries(fontes).map(([caminho, codigo]) => ({
  caminho,
  deps: dependencias(caminho, codigo),
}))
const de = (prefixo: string) => ARQUIVOS.filter((a) => a.caminho.startsWith(prefixo))

/** Para cada arquivo da pasta, nenhuma dependência pode casar com o padrão proibido. */
function proibir(pasta: string, proibido: RegExp) {
  const arquivos = de(pasta)
  expect(arquivos.length).toBeGreaterThan(0)
  const violacoes = arquivos.flatMap((a) => a.deps.filter((d) => proibido.test(d)).map((d) => `${a.caminho} → ${d}`))
  expect(violacoes).toEqual([])
}

// PRINCÍPIO: apps realmente separados — as regras abaixo transformam a
// arquitetura em algo verificável. Quebrou a regra, quebrou o teste.
describe('Arquitetura do projeto', () => {
  it('o app do ALUNO não importa nada do app da cantina nem da página inicial', () => {
    proibir('./apps/aluno/', /^\.\/apps\/(cantina|inicio)\//)
  })

  it('o app da CANTINA não importa nada do app do aluno nem da página inicial', () => {
    proibir('./apps/cantina/', /^\.\/apps\/(aluno|inicio)\//)
  })

  it('o núcleo (src/core) não conhece apps, design nem React', () => {
    proibir('./core/', /^(\.\/apps\/|\.\/design\/|react)/)
  })

  it('o domínio (src/core/dominio) não conhece infra, composição nem bibliotecas', () => {
    proibir('./core/dominio/', /^(\.\/core\/(infra|composicao)\/|[^.])/)
  })

  it('o design compartilhado não conhece nenhum app', () => {
    proibir('./design/', /^\.\/apps\//)
  })
})
