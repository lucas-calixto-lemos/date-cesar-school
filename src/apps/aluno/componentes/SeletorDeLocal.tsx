import { useState } from 'react'
import type { LocalDoCampus } from '../../../core/dominio/campus/LocalDoCampus'
import type { Bloco, Predio } from '../../../core/dominio/campus/Predio'
import { useApp } from '../contexto'
import { IconeLocal } from '../../../design/componentes/Icones'

/** "Sala 110" vira "110" no botão (o título "Salas" já dá o contexto). */
const rotuloCurto = (nome: string) => nome.replace(/^Sala (\d+)$/, '$1')

interface Props {
  local: LocalDoCampus | null
  aoEscolher(local: LocalDoCampus | null): void
}

/**
 * Seleção em cascata: Prédio → Bloco → Local.
 * Tudo vem do MapaDoCampus injetado; a tela não conhece nenhum prédio pelo nome.
 */
export function SeletorDeLocal({ local, aoEscolher }: Props) {
  const { aluno } = useApp()
  const predios = aluno.campus.predios()
  const [predio, setPredio] = useState<Predio | null>(null)
  const [bloco, setBloco] = useState<Bloco | null>(null)

  function escolherPredio(p: Predio) {
    setPredio(p)
    // Se o prédio tiver um bloco só, já abre direto nele.
    const blocos = p.blocos()
    setBloco(blocos.length === 1 ? blocos[0] : null)
    aoEscolher(null)
  }

  function escolherBloco(b: Bloco) {
    setBloco(b)
    aoEscolher(null)
  }

  return (
    <div className="seletor-local">
      <div className="locais">
        {predios.map((p) => (
          <button
            key={p.id}
            className={`chip chip--local ${predio?.id === p.id ? 'chip--ativo' : ''}`}
            onClick={() => escolherPredio(p)}
            aria-pressed={predio?.id === p.id}
          >
            <IconeLocal width={16} height={16} /> {p.nome}
          </button>
        ))}
      </div>

      {predio && !predio.estaDisponivel() && (
        <p className="seletor-local__aviso" role="status">
          <strong>{predio.nome}</strong> — em desenvolvimento
        </p>
      )}

      {predio?.estaDisponivel() && predio.blocos().length > 1 && (
        <div className="seletor-local__nivel">
          <div className="seletor-local__blocos">
            {predio.blocos().map((b) => (
              <button
                key={b.id}
                className={`bloco-opcao ${bloco?.id === b.id ? 'bloco-opcao--ativa' : ''}`}
                onClick={() => escolherBloco(b)}
                aria-pressed={bloco?.id === b.id}
              >
                <strong>{b.nome}</strong>
                <small>{b.referencia}</small>
              </button>
            ))}
          </div>
        </div>
      )}

      {bloco && (
        <div className="seletor-local__nivel">
          <p className="seletor-local__rotulo">
            Salas e espaços · {predio?.nome} {bloco.nome}
          </p>
          <div className="seletor-local__salas">
            {bloco.locais().map((l) => {
              const rotulo = rotuloCurto(l.nome)
              const largo = !/^\d+$/.test(rotulo)
              return (
                <button
                  key={l.id}
                  className={`chip chip--sala ${largo ? 'chip--sala-larga' : ''} ${local?.id === l.id ? 'chip--ativo' : ''}`}
                  onClick={() => aoEscolher(l)}
                  aria-pressed={local?.id === l.id}
                  aria-label={l.nome}
                >
                  {rotulo}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
