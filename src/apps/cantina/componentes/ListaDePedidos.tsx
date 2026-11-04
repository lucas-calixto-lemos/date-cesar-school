import { useState, type KeyboardEvent } from 'react'
import { ErroDeDominio } from '../../../core/dominio/compartilhado/ErroDeDominio'
import type { Pedido, PrevisaoDeChegada, SituacaoDoPedido } from '../../../core/dominio/pedido/Pedido'
import { DialogoDeConfirmacao } from '../../../design/componentes/DialogoDeConfirmacao'
import { IconeLocal, IconeRelogio } from '../../../design/componentes/Icones'
import { ImagemDoItem } from '../../../design/componentes/ImagemDoItem'
import { useCantina } from '../contexto'

const ROTULO: Record<SituacaoDoPedido, string> = {
  reservado: 'Reservado',
  'a-caminho': 'A caminho',
  entregue: 'Entregue',
  cancelado: 'Cancelado',
}

const SECOES: Array<{ titulo: string; filtro(p: Pedido): boolean }> = [
  { titulo: 'A caminho', filtro: (p) => p.situacaoAtual() === 'a-caminho' },
  { titulo: 'Reservados', filtro: (p) => p.situacaoAtual() === 'reservado' },
  { titulo: 'Finalizados', filtro: (p) => !p.estaEmAberto() },
]

interface Props {
  pedidos: Pedido[]
  aoErro(mensagem: string | null): void
}

export function ListaDePedidos({ pedidos, aoErro }: Props) {
  const { cantina } = useCantina()
  const [selecionado, setSelecionado] = useState<Pedido | null>(null)
  const [confirmandoCancelamento, setConfirmandoCancelamento] = useState(false)

  function executar(acao: () => void) {
    aoErro(null)
    try {
      acao()
    } catch (e) {
      aoErro(e instanceof ErroDeDominio ? e.message : 'Não foi possível concluir.')
    }
    fechar()
  }

  function fechar() {
    setSelecionado(null)
    setConfirmandoCancelamento(false)
  }

  if (pedidos.length === 0) {
    return <p className="vazio">Nenhum pedido ainda. Assim que um aluno reservar, ele aparece aqui na hora.</p>
  }

  return (
    <>
      <p className="dica-cantina">Toque duas vezes num pedido para entregar.</p>
      {SECOES.map(({ titulo, filtro }) => {
        const daSecao = pedidos.filter(filtro)
        if (daSecao.length === 0) return null
        return (
          <section key={titulo} className="secao-pedidos">
            <h2 className="secao-titulo">
              {titulo} <span className="secao-titulo__contador">{daSecao.length}</span>
            </h2>
            <ul className="lista-pedidos">
              {daSecao.map((pedido) => (
                <li key={pedido.numeroDaComanda()}>
                  <CartaoDePedido pedido={pedido} aoAbrir={() => pedido.estaEmAberto() && setSelecionado(pedido)} />
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      {selecionado && !confirmandoCancelamento && (
        <DialogoDeConfirmacao
          titulo={`Comanda ${selecionado.numeroDaComanda()}`}
          rotuloConfirmar="Pedido entregue"
          rotuloCancelar="Cancelar"
          aoConfirmar={() => executar(() => cantina.atendimento.marcarEntregue(selecionado.comanda()))}
          aoCancelar={fechar}
          extra={
            <button className="link-perigo" onClick={() => setConfirmandoCancelamento(true)}>
              Cancelar este pedido…
            </button>
          }
        >
          <p>
            <b>{selecionado.descricaoCurta()}</b> · {selecionado.total().formatar()}
          </p>
          <p>
            {selecionado.estaPago()
              ? `${selecionado.nomeDaFormaDePagamento()} · já pago`
              : `Receber ${selecionado.total().formatar()} no balcão`}
          </p>
        </DialogoDeConfirmacao>
      )}

      {selecionado && confirmandoCancelamento && (
        <DialogoDeConfirmacao
          titulo={`Cancelar o pedido ${selecionado.numeroDaComanda()}?`}
          rotuloConfirmar="Cancelar pedido"
          rotuloCancelar="Voltar"
          tom="perigo"
          aoConfirmar={() => executar(() => cantina.atendimento.cancelar(selecionado.comanda()))}
          aoCancelar={() => setConfirmandoCancelamento(false)}
        >
          <p>O aluno verá o pedido como cancelado e as unidades voltam ao estoque.</p>
        </DialogoDeConfirmacao>
      )}
    </>
  )
}

function CartaoDePedido({ pedido, aoAbrir }: { pedido: Pedido; aoAbrir(): void }) {
  const { cantina, agora } = useCantina()
  const situacao = pedido.situacaoAtual()
  const previsao = cantina.chegada.prever(pedido)

  const aoTeclar = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      aoAbrir()
    }
  }

  return (
    <article
      className={`pedido-card pedido-card--${situacao}`}
      onDoubleClick={aoAbrir}
      onKeyDown={aoTeclar}
      tabIndex={pedido.estaEmAberto() ? 0 : -1}
      aria-label={`Comanda ${pedido.numeroDaComanda()}, ${ROTULO[situacao]}. Toque duas vezes para entregar.`}
    >
      <div className="pedido-card__foto">
        <ImagemDoItem chave={pedido.imagemDoItem()} />
        {previsao && <TimerDeChegada previsao={previsao} agora={agora.getTime()} />}
      </div>

      <div className="pedido-card__info">
        <div className="pedido-card__topo">
          <span className="pedido-card__comanda">{pedido.numeroDaComanda()}</span>
          <span className={`chip-situacao chip-situacao--${situacao}`}>{ROTULO[situacao]}</span>
        </div>
        <strong className="pedido-card__item">{pedido.descricaoCurta()}</strong>
        <span className="pedido-card__linha">
          <IconeRelogio width={14} height={14} /> Janela {pedido.descricaoDaJanela()}
        </span>
        {pedido.localDoAluno() && (
          <span className="pedido-card__linha">
            <IconeLocal width={14} height={14} /> {pedido.localDoAluno()}
          </span>
        )}
        <div className="pedido-card__rodape">
          <b>{pedido.total().formatar()}</b>
          <span className={`pagamento ${pedido.estaPago() ? 'pagamento--pago' : 'pagamento--pendente'}`}>
            {pedido.nomeDaFormaDePagamento()} · {pedido.estaPago() ? 'pago' : 'a pagar'}
          </span>
        </div>
      </div>
    </article>
  )
}

const VERDE = [46, 158, 91]
const VERMELHO = [249, 50, 9]

/**
 * Camada sobre a foto: verde quando o aluno acabou de sair, vai ficando vermelha
 * conforme o tempo previsto de chegada se esgota.
 */
function TimerDeChegada({ previsao, agora }: { previsao: PrevisaoDeChegada; agora: number }) {
  const total = Math.max(1, previsao.fim - previsao.inicio)
  const progresso = Math.min(1, Math.max(0, (agora - previsao.inicio) / total))
  const restanteMs = Math.max(0, previsao.fim - agora)
  const cor = VERDE.map((v, i) => Math.round(v + (VERMELHO[i] - v) * progresso)).join(', ')
  const min = Math.floor(restanteMs / 60_000)
  const seg = Math.floor((restanteMs % 60_000) / 1000)
  const chegou = restanteMs === 0

  return (
    <div
      className={`timer-chegada ${chegou ? 'timer-chegada--chegou' : ''}`}
      style={{ backgroundColor: `rgba(${cor}, 0.42)` }}
      role="timer"
      aria-label={chegou ? 'Aluno chegando' : `Chega em ${min} minutos e ${seg} segundos`}
    >
      <span className="timer-chegada__valor">
        {chegou ? 'Chegando!' : `${String(min).padStart(2, '0')}:${String(seg).padStart(2, '0')}`}
      </span>
      {!chegou && <span className="timer-chegada__rotulo">chegada</span>}
    </div>
  )
}
