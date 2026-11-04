import { useState } from 'react'
import { ErroDeDominio } from '../../../core/dominio/compartilhado/ErroDeDominio'
import { IconeMais, IconeMenos } from '../../../design/componentes/Icones'
import { ImagemDoItem } from '../../../design/componentes/ImagemDoItem'
import { useCantina } from '../contexto'

/** Quantidade disponível de cada item. Zerou → "Esgotado" no app do aluno, na hora. */
export function ListaDeEstoque() {
  const { cantina } = useCantina()
  const [erro, setErro] = useState<string | null>(null)
  const linhas = cantina.estoque.listar()
  const esgotados = linhas.filter((l) => l.quantidade === 0).length

  const ajustar = (acao: () => void) => {
    setErro(null)
    try {
      acao()
    } catch (e) {
      setErro(e instanceof ErroDeDominio ? e.message : 'Não foi possível ajustar.')
    }
  }

  return (
    <section className="estoque">
      <p className="dica-cantina">
        {esgotados === 0 ? 'Tudo disponível.' : `${esgotados} ${esgotados === 1 ? 'item esgotado' : 'itens esgotados'}.`}{' '}
        Reservas descontam daqui automaticamente.
      </p>
      {erro && <p className="aviso">{erro}</p>}
      <ul className="lista-estoque">
        {linhas.map(({ item, quantidade }) => {
          const esgotado = quantidade === 0
          return (
            <li key={item.id()} className={`estoque-linha ${esgotado ? 'estoque-linha--esgotado' : ''}`}>
              <span className="estoque-linha__foto">
                <ImagemDoItem chave={item.imagem()} />
              </span>
              <span className="estoque-linha__texto">
                <strong>{item.nome()}</strong>
                <small>{esgotado ? 'Esgotado' : item.preco().formatar()}</small>
              </span>
              <span className="estoque-linha__controle">
                <button
                  className="botao-redondo botao-redondo--claro"
                  onClick={() => ajustar(() => cantina.estoque.diminuir(item.id()))}
                  disabled={esgotado}
                  aria-label={`Diminuir ${item.nome()}`}
                >
                  <IconeMenos width={16} height={16} />
                </button>
                <output className="estoque-linha__qtd" aria-label={`${quantidade} unidades de ${item.nome()}`}>
                  {quantidade}
                </output>
                <button
                  className="botao-redondo botao-redondo--cheio"
                  onClick={() => ajustar(() => cantina.estoque.aumentar(item.id()))}
                  aria-label={`Aumentar ${item.nome()}`}
                >
                  <IconeMais width={16} height={16} />
                </button>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
