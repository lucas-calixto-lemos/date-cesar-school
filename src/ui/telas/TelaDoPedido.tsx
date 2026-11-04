import { useState, type JSX } from 'react'
import type { LocalDoCampus } from '../../dominio/campus/LocalDoCampus'
import { ErroDeDominio } from '../../dominio/compartilhado/ErroDeDominio'
import { HoraDoDia } from '../../dominio/compartilhado/HoraDoDia'
import type { Pedido } from '../../dominio/pedido/Pedido'
import { useApp } from '../contexto'
import { IconeAlerta, IconeCheck, IconePlay, IconeVoltar } from '../componentes/Icones'
import { SeletorDeLocal } from '../componentes/SeletorDeLocal'
import { ImagemDoItem } from '../componentes/ImagemDoItem'
import { minutosPorExtenso } from '../formatar'

interface Props {
  pedido: Pedido
  aoVoltar(): void
}

export function TelaDoPedido({ pedido, aoVoltar }: Props) {
  const { agora } = useApp()
  const hora = HoraDoDia.deData(agora)

  // A tela pergunta ao PEDIDO em que pé ele está (Demeter); não abre a janela nem a cobrança.
  const situacao = pedido.situacaoAtual()
  const conteudo: Record<typeof situacao, () => JSX.Element> = {
    reservado: () => <Reservado pedido={pedido} hora={hora} />,
    'aluno-a-caminho': () => <ACaminho pedido={pedido} />,
    pronto: () => <Pronto pedido={pedido} />,
    retirado: () => <Pronto pedido={pedido} />,
  }

  return (
    <div className="tela tela--pedido">
      <header className="topo topo--tela">
        <button className="botao-redondo" onClick={aoVoltar} aria-label="Voltar ao cardápio">
          <IconeVoltar />
        </button>
        <h1 className="topo__titulo">Seu pedido</h1>
        <span className="topo__espaco" />
      </header>

      <article className="ticket">
        <p className="ticket__rotulo">Comanda</p>
        <p className="ticket__numero">{pedido.numeroDaComanda()}</p>
        <p className="ticket__dica">Mostre este número no balcão</p>
        <div className="ticket__picote" />
        <div className="ticket__linha">
          <span className="ticket__foto">
            <ImagemDoItem chave={pedido.imagemDoItem()} />
          </span>
          <span className="ticket__item">
            <strong>{pedido.descricaoCurta()}</strong>
            <small>Retirada {pedido.descricaoDaJanela()}</small>
          </span>
          <strong className="ticket__total">{pedido.total().formatar()}</strong>
        </div>
        <p className={`status-pagamento ${pedido.estaPago() ? 'status-pagamento--pago' : 'status-pagamento--pendente'}`}>
          {pedido.estaPago() ? <IconeCheck width={18} height={18} /> : <IconeAlerta width={18} height={18} />}
          {pedido.resumoDoPagamento()}
        </p>
      </article>

      {conteudo[situacao]()}
    </div>
  )
}

function Reservado({ pedido, hora }: { pedido: Pedido; hora: HoraDoDia }) {
  const momento = pedido.momentoDaJanela(hora)
  if (momento === 'antes') {
    const faltam = hora.minutosAte(pedido.inicioDaJanela())
    return (
      <section className="estado">
        <p className="estado__titulo">Sua janela abre às {pedido.inicioDaJanela().toString()}</p>
        <p className="estado__grande">em {minutosPorExtenso(faltam)}</p>
        <p className="estado__texto">
          Quando o intervalo começar, volte aqui, diga onde você está e aperte o <b>play</b>. A cantina já
          começa a separar.
        </p>
      </section>
    )
  }
  if (momento === 'depois') {
    return (
      <section className="estado estado--alerta">
        <p className="estado__titulo">Sua janela passou</p>
        <p className="estado__texto">
          Sem problema: vá até o balcão e mostre a comanda <b>{pedido.numeroDaComanda()}</b>.
        </p>
      </section>
    )
  }
  return <EstouIndo pedido={pedido} />
}

function EstouIndo({ pedido }: { pedido: Pedido }) {
  const { aluno, atualizar } = useApp()
  const [local, setLocal] = useState<LocalDoCampus | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  function play() {
    if (!local) return
    try {
      aluno.retirada.estouIndoBuscar(pedido, local)
      atualizar()
    } catch (e) {
      setErro(e instanceof ErroDeDominio ? e.message : 'Não foi possível avisar a cantina.')
    }
  }

  return (
    <section className="estado estado--ativo">
      <p className="estado__titulo">É hora! Onde você está?</p>
      <SeletorDeLocal local={local} aoEscolher={setLocal} />
      <button className="botao-play" onClick={play} disabled={!local} aria-label="Estou indo buscar">
        <IconePlay width={42} height={42} />
      </button>
      <p className="estado__texto estado__texto--centro">
        {local ? (
          <>
            Saindo de <b>{local.descricao()}</b>. Aperte o play: <b>“estou indo buscar”</b>
          </>
        ) : (
          'Escolha seu local para liberar o play'
        )}
      </p>
      {erro && <p className="aviso" role="alert">{erro}</p>}
    </section>
  )
}

function ACaminho({ pedido }: { pedido: Pedido }) {
  return (
    <section className="estado estado--ativo">
      <div className="preparando" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <p className="estado__titulo estado__titulo--centro">A cantina já sabe que você vem!</p>
      <p className="estado__texto estado__texto--centro">
        Saindo de <b>{pedido.localDoAluno()}</b>. Separando seu pedido…
      </p>
    </section>
  )
}

function Pronto({ pedido }: { pedido: Pedido }) {
  return (
    <section className="estado estado--pronto" role="status">
      <span className="estado__selo">
        <IconeCheck width={34} height={34} />
      </span>
      <p className="estado__titulo estado__titulo--centro">Pedido pronto</p>
      <p className="estado__texto estado__texto--centro">
        Retire com a comanda <b className="destaque-comanda">{pedido.numeroDaComanda()}</b>
      </p>
      {!pedido.estaPago() && (
        <p className="estado__texto estado__texto--centro">Leve {pedido.total().formatar()} para pagar no balcão.</p>
      )}
    </section>
  )
}
