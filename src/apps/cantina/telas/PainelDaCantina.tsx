import { useState } from 'react'
import { ErroDeDominio } from '../../../core/dominio/compartilhado/ErroDeDominio'
import { DialogoDeConfirmacao } from '../../../design/componentes/DialogoDeConfirmacao'
import { IconeRelogio } from '../../../design/componentes/Icones'
import { Marca } from '../../../design/componentes/Marca'
import { horaCurta } from '../../../design/formatar'
import { ListaDeEstoque } from '../componentes/ListaDeEstoque'
import { ListaDePedidos } from '../componentes/ListaDePedidos'
import { useCantina } from '../contexto'

type Aba = 'pedidos' | 'estoque'

interface Confirmacao {
  titulo: string
  texto: string
  rotulo: string
  tom: 'normal' | 'perigo'
  acao(): void
}

const saudacao = (agora: Date) => {
  const h = agora.getHours()
  return h < 12 ? 'Bom dia!' : h < 18 ? 'Boa tarde!' : 'Boa noite!'
}

export function PainelDaCantina() {
  const { cantina, agora } = useCantina()
  const [aba, setAba] = useState<Aba>('pedidos')
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  const { operacao } = cantina
  const aberta = operacao.cantinaAberta()
  const reservas = operacao.reservasAbertas()
  const pedidos = cantina.atendimento.listarPedidos()
  const ativos = pedidos.filter((p) => p.estaEmAberto()).length
  const aCaminho = pedidos.filter((p) => p.situacaoAtual() === 'a-caminho').length

  function executar(acao: () => void) {
    setErro(null)
    try {
      acao()
    } catch (e) {
      setErro(e instanceof ErroDeDominio ? e.message : 'Não foi possível concluir.')
    }
    setConfirmacao(null)
  }

  return (
    <div className="tela tela--cantina">
      <header className="topo">
        <Marca subtitulo="Cantina · CESAR School" />
        <span className="relogio-pill" title="Horário atual">
          <IconeRelogio width={16} height={16} />
          {horaCurta(agora)}
        </span>
      </header>

      <section className="saudacao">
        <h1 className="saudacao__titulo">{saudacao(agora)}</h1>
        <p className="saudacao__resumo">
          {ativos === 0 ? 'Nenhum pedido em aberto' : `${ativos} ${ativos === 1 ? 'pedido em aberto' : 'pedidos em aberto'}`}
          {aCaminho > 0 && <b> · {aCaminho} a caminho</b>}
        </p>
      </section>

      <section className="controles" aria-label="Controles da cantina">
        <CartaoDeControle
          titulo="Cantina"
          estado={aberta ? 'Aberta' : 'Fechada'}
          ligado={aberta}
          rotulo={aberta ? 'Fechar cantina' : 'Reabrir cantina'}
          aoTocar={() =>
            setConfirmacao(
              aberta
                ? { titulo: 'Fechar cantina?', texto: 'Os alunos verão o aviso de cantina fechada e não poderão reservar.', rotulo: 'Fechar cantina', tom: 'perigo', acao: () => operacao.fecharCantina() }
                : { titulo: 'Reabrir cantina?', texto: 'Os alunos voltam a poder reservar (se as reservas estiverem liberadas).', rotulo: 'Reabrir cantina', tom: 'normal', acao: () => operacao.abrirCantina() },
            )
          }
        />
        <CartaoDeControle
          titulo="Reservas"
          estado={reservas ? 'Recebendo' : 'Finalizadas'}
          ligado={reservas}
          rotulo={reservas ? 'Finalizar reservas' : 'Reabrir reservas'}
          aoTocar={() =>
            setConfirmacao(
              reservas
                ? { titulo: 'Finalizar reservas?', texto: 'Ninguém mais consegue reservar hoje. Os pedidos já feitos continuam valendo.', rotulo: 'Finalizar reservas', tom: 'perigo', acao: () => operacao.finalizarReservas() }
                : { titulo: 'Reabrir reservas?', texto: 'Os alunos voltam a poder reservar.', rotulo: 'Reabrir reservas', tom: 'normal', acao: () => operacao.reabrirReservas() },
            )
          }
        />
      </section>

      {erro && (
        <p className="aviso" role="alert">
          {erro}
        </p>
      )}

      <div className="segmentado abas" role="tablist" aria-label="Seções">
        <button
          role="tab"
          aria-selected={aba === 'pedidos'}
          className={`segmentado__opcao ${aba === 'pedidos' ? 'segmentado__opcao--ativa' : ''}`}
          onClick={() => setAba('pedidos')}
        >
          Pedidos{ativos > 0 && <span className="abas__contador">{ativos}</span>}
        </button>
        <button
          role="tab"
          aria-selected={aba === 'estoque'}
          className={`segmentado__opcao ${aba === 'estoque' ? 'segmentado__opcao--ativa' : ''}`}
          onClick={() => setAba('estoque')}
        >
          Estoque
        </button>
      </div>

      {aba === 'pedidos' ? <ListaDePedidos pedidos={pedidos} aoErro={setErro} /> : <ListaDeEstoque />}

      {confirmacao && (
        <DialogoDeConfirmacao
          titulo={confirmacao.titulo}
          rotuloConfirmar={confirmacao.rotulo}
          tom={confirmacao.tom}
          aoConfirmar={() => executar(confirmacao.acao)}
          aoCancelar={() => setConfirmacao(null)}
        >
          <p>{confirmacao.texto}</p>
        </DialogoDeConfirmacao>
      )}
    </div>
  )
}

function CartaoDeControle(props: { titulo: string; estado: string; ligado: boolean; rotulo: string; aoTocar(): void }) {
  return (
    <div className={`controle ${props.ligado ? 'controle--ligado' : 'controle--desligado'}`}>
      <span className="controle__titulo">{props.titulo}</span>
      <span className="controle__estado">
        <span className="controle__ponto" aria-hidden="true" />
        {props.estado}
      </span>
      <button className={`pilula controle__botao ${props.ligado ? 'pilula--contorno' : 'pilula--cheia'}`} onClick={props.aoTocar}>
        {props.rotulo}
      </button>
    </div>
  )
}
