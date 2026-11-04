import { useRef, useState } from 'react'
import { CATEGORIAS, type Categoria, type ItemDoCardapio } from '../../../core/dominio/cardapio/ItemDoCardapio'
import type { Pedido } from '../../../core/dominio/pedido/Pedido'
import { useApp } from '../contexto'
import { IconeBusca, IconeLua, IconeRelogio, IconeSeta, IconeSol } from '../../../design/componentes/Icones'
import { ImagemDoItem } from '../../../design/componentes/ImagemDoItem'
import { Marca, mascoteCreme } from '../../../design/componentes/Marca'
import { cronometro, horaCurta } from '../../../design/formatar'

interface Props {
  pedidoAtual: Pedido | null
  aoAbrirItem(itemId: string): void
  aoAbrirPedido(): void
}

export function Home({ pedidoAtual, aoAbrirItem, aoAbrirPedido }: Props) {
  const { aluno, agora, tema, alternarTema } = useApp()
  const [termo, setTermo] = useState('')
  const [categoria, setCategoria] = useState<Categoria | undefined>()
  const [destacarBusca, setDestacarBusca] = useState(false)
  const buscaRef = useRef<HTMLInputElement>(null)

  const itens = aluno.cardapio.pesquisar(termo, categoria)
  // O motivo vem do domínio (cantina fechada, reservas finalizadas, passou das 19h...).
  const motivoDoBloqueio = aluno.bloqueioDeReserva.motivoDoBloqueio()
  const reservasAbertas = !motivoDoBloqueio
  const limite = aluno.horarioLimite.horarioLimite()
  const passouDoHorario = !aluno.horarioLimite.estaAberta()

  function aoTocarReservar() {
    buscaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    buscaRef.current?.focus({ preventScroll: true })
    setDestacarBusca(true)
    setTimeout(() => setDestacarBusca(false), 2400)
  }

  return (
    <div className="tela tela--home">
      <header className="topo">
        <Marca />
        <div className="topo__direita">
          <span className="relogio-pill" title="Horário atual">
            <IconeRelogio width={16} height={16} />
            {horaCurta(agora)}
          </span>
          <button
            className="botao-tema"
            onClick={alternarTema}
            aria-label={tema === 'escuro' ? 'Ativar modo claro' : 'Ativar modo escuro'}
            title={tema === 'escuro' ? 'Modo claro' : 'Modo escuro'}
          >
            {tema === 'escuro' ? <IconeSol width={18} height={18} /> : <IconeLua width={18} height={18} />}
          </button>
        </div>
      </header>

      <section className={`hero ${reservasAbertas ? '' : 'hero--fechado'}`}>
        <div className="hero__principal">
          <p className="hero__chamada">Intervalo de 15 min?</p>
          <h1 className="hero__titulo">
            Seu lanche
            <br />
            te esperando.
          </h1>
          <button className="botao-reservar" onClick={aoTocarReservar} disabled={!reservasAbertas}>
            Reservar
          </button>
        </div>
        <div className="hero__lado">
          <img src={mascoteCreme} alt="" className="hero__mascote" />
          <div className="cronometro" aria-live="off">
            <span className="cronometro__rotulo">{reservasAbertas ? `fecha às ${limite}` : 'reservas'}</span>
            <strong className="cronometro__valor">
              {reservasAbertas ? cronometro(aluno.horarioLimite.msRestantes()) : passouDoHorario ? 'encerradas' : 'pausadas'}
            </strong>
          </div>
        </div>
        {!reservasAbertas && (
          <p className="hero__aviso" role="status">
            <b>{motivoDoBloqueio}</b>{' '}
            {passouDoHorario && <>Ou use o <b>Estimar</b> para ver se dá tempo de ir no balcão.</>}
          </p>
        )}
      </section>

      {pedidoAtual && (
        <button className="faixa-pedido" onClick={aoAbrirPedido}>
          <span className="faixa-pedido__comanda">{pedidoAtual.numeroDaComanda()}</span>
          <span className="faixa-pedido__texto">
            <strong>Sua comanda</strong>
            <small>
              {pedidoAtual.descricaoCurta()} · {pedidoAtual.descricaoDaJanela()}
            </small>
          </span>
          <IconeSeta />
        </button>
      )}

      <div className={`busca ${destacarBusca ? 'busca--destaque' : ''}`}>
        <IconeBusca />
        <input
          ref={buscaRef}
          type="search"
          placeholder="O que vai ser hoje?"
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          aria-label="Pesquisar no cardápio"
        />
      </div>
      {destacarBusca && <p className="dica">Escolha o que você quer reservar 👇</p>}

      <nav className="filtros" aria-label="Categorias">
        <button className={`chip ${!categoria ? 'chip--ativo' : ''}`} onClick={() => setCategoria(undefined)}>
          Todos
        </button>
        {CATEGORIAS.map((c) => (
          <button
            key={c.id}
            className={`chip ${categoria === c.id ? 'chip--ativo' : ''}`}
            onClick={() => setCategoria(c.id)}
          >
            {c.rotulo}
          </button>
        ))}
      </nav>

      <h2 className="secao-titulo">Cardápio de hoje</h2>
      {itens.length === 0 ? (
        <p className="vazio">Nada com “{termo}” por aqui. Tenta outro nome?</p>
      ) : (
        <ul className="grade">
          {itens.map((item) => (
            <li key={item.id()}>
              <CartaoDoItem item={item} aoTocar={() => aoAbrirItem(item.id())} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function CartaoDoItem({ item, aoTocar }: { item: ItemDoCardapio; aoTocar(): void }) {
  const esgotado = item.estaEsgotado()
  return (
    <button className={`cartao cat-${item.categoria()} ${esgotado ? 'cartao--esgotado' : ''}`} onClick={aoTocar}>
      <span className="cartao__foto">
        <ImagemDoItem chave={item.imagem()} className="cartao__ilustracao" />
        {esgotado && <span className="selo-esgotado">Esgotado</span>}
      </span>
      <span className="cartao__nome">{item.nome()}</span>
      <span className="cartao__preco">{item.preco().formatar()}</span>
    </button>
  )
}
