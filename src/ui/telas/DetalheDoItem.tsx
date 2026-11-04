import { useState } from 'react'
import { CATEGORIAS } from '../../dominio/cardapio/ItemDoCardapio'
import { Pedido } from '../../dominio/pedido/Pedido'
import { useApp } from '../contexto'
import { IconeMais, IconeMenos, IconeRelogio, IconeVoltar } from '../componentes/Icones'
import { ImagemDoItem, temFoto } from '../componentes/ImagemDoItem'

interface Props {
  itemId: string
  aoVoltar(): void
  aoReservar(quantidade: number): void
  aoEstimar(): void
}

export function DetalheDoItem({ itemId, aoVoltar, aoReservar, aoEstimar }: Props) {
  const { aluno } = useApp()
  const item = aluno.cardapio.buscar(itemId)
  const [quantidade, setQuantidade] = useState(1)

  const esgotado = item.estaEsgotado()
  const reservasAbertas = aluno.horarioLimite.estaAberta()
  const rotuloCategoria = CATEGORIAS.find((c) => c.id === item.categoria())?.rotulo
  const preparo = item.minutosDePreparo() < 1 ? 'na hora' : `${item.minutosDePreparo()} min`

  return (
    <div className={`tela tela--detalhe cat-${item.categoria()} ${esgotado ? 'tela--esgotado' : ''}`}>
      <div className={`detalhe__palco ${temFoto(item.imagem()) ? 'detalhe__palco--foto' : ''}`}>
        {temFoto(item.imagem()) ? (
          <ImagemDoItem chave={item.imagem()} className="detalhe__foto" />
        ) : (
          <div className="detalhe__prato">
            <ImagemDoItem chave={item.imagem()} className="detalhe__ilustracao" />
          </div>
        )}
        <button className="botao-redondo detalhe__voltar" onClick={aoVoltar} aria-label="Voltar">
          <IconeVoltar />
        </button>
        {esgotado && <span className="selo-esgotado selo-esgotado--grande">Esgotado</span>}
      </div>

      <div className="folha">
        <div className="folha__cabeca">
          <div>
            <p className="folha__categoria">{rotuloCategoria}</p>
            <h1 className="folha__titulo">{item.nome()}</h1>
          </div>
          <p className="folha__preco">{item.preco().formatar()}</p>
        </div>

        <ul className="infos">
          <li>
            <IconeRelogio width={18} height={18} />
            <strong>{preparo}</strong>
            <small>preparo</small>
          </li>
          <li>
            <strong>{esgotado ? 'Não' : 'Sim'}</strong>
            <small>disponível</small>
          </li>
          <li>
            <strong>{item.precoPara(quantidade).formatar()}</strong>
            <small>total</small>
          </li>
        </ul>

        <h2 className="folha__subtitulo">Descrição</h2>
        <p className="folha__texto">{item.descricao()}</p>

        {!esgotado && (
          <div className="quantidade">
            <span>Quantidade</span>
            <div className="quantidade__controle">
              <button
                className="botao-redondo botao-redondo--claro"
                onClick={() => setQuantidade((q) => Math.max(1, q - 1))}
                disabled={quantidade <= 1}
                aria-label="Diminuir"
              >
                <IconeMenos width={18} height={18} />
              </button>
              <output className="quantidade__valor">{String(quantidade).padStart(2, '0')}</output>
              <button
                className="botao-redondo botao-redondo--cheio"
                onClick={() => setQuantidade((q) => Math.min(Pedido.QUANTIDADE_MAXIMA, q + 1))}
                disabled={quantidade >= Pedido.QUANTIDADE_MAXIMA}
                aria-label="Aumentar"
              >
                <IconeMais width={18} height={18} />
              </button>
            </div>
          </div>
        )}

        {!reservasAbertas && !esgotado && (
          <p className="aviso">Reservas encerradas por hoje (limite às {aluno.horarioLimite.horarioLimite().toString()}).</p>
        )}
      </div>

      <div className="barra-acao">
        <button className="pilula pilula--contorno" onClick={aoEstimar} disabled={esgotado}>
          Estimar
        </button>
        <button
          className="pilula pilula--cheia"
          onClick={() => aoReservar(quantidade)}
          disabled={esgotado || !reservasAbertas}
        >
          {esgotado ? 'Esgotado' : `Reservar · ${item.precoPara(quantidade).formatar()}`}
        </button>
      </div>
    </div>
  )
}
