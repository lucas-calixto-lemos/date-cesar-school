import { useState } from 'react'
import { ErroDeDominio } from '../../dominio/compartilhado/ErroDeDominio'
import type { Pedido } from '../../dominio/pedido/Pedido'
import { JanelaDeRetirada } from '../../dominio/reserva/JanelaDeRetirada'
import { useApp } from '../contexto'
import { IconeAlerta, IconeCarteira, IconeCheck, IconeCopiar, IconeVoltar } from '../componentes/Icones'
import { ImagemDoItem } from '../componentes/ImagemDoItem'
import { QrFalso } from '../componentes/QrFalso'
import { RodaDeSelecao } from '../componentes/RodaDeSelecao'

interface Props {
  itemId: string
  quantidade: number
  aoVoltar(): void
  aoConcluir(pedido: Pedido): void
}

// As opções vêm do próprio objeto de valor: a UI não conhece as regras da janela.
const INICIOS = JanelaDeRetirada.iniciosPossiveis()
const DURACOES = JanelaDeRetirada.duracoesPossiveis()

export function Reservar({ itemId, quantidade, aoVoltar, aoConcluir }: Props) {
  const { aluno } = useApp()
  const item = aluno.cardapio.buscar(itemId)
  const formas = aluno.formasDePagamento.listar()

  const [indiceDoInicio, setIndiceDoInicio] = useState(0)
  const inicio = INICIOS[indiceDoInicio]
  const [duracao, setDuracao] = useState(DURACOES[0])
  const [formaId, setFormaId] = useState<string | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  const [pedidoComQr, setPedidoComQr] = useState<Pedido | null>(null)

  const janela = JanelaDeRetirada.criar(inicio, duracao)
  const reservasAbertas = aluno.horarioLimite.estaAberta()
  const podeConfirmar = Boolean(janela && formaId && reservasAbertas)

  function confirmar() {
    if (!janela || !formaId) return
    setErro(null)
    try {
      const pedido = aluno.reserva.reservar({
        itemId,
        quantidade,
        janela,
        // PRINCÍPIO: Aberto/Fechado — a forma vem do registro pelo id; nenhum if/switch por tipo.
        formaDePagamento: aluno.formasDePagamento.buscar(formaId),
      })
      // Se a cobrança gerou um QR (hoje, o Pix), mostramos. Pergunta-se pelo DADO, não pelo tipo.
      if (pedido.codigoQrDoPagamento()) setPedidoComQr(pedido)
      else aoConcluir(pedido)
    } catch (e) {
      setErro(e instanceof ErroDeDominio ? e.message : 'Algo deu errado. Tente de novo.')
    }
  }

  return (
    <div className="tela tela--reservar">
      <header className="topo topo--tela">
        <button className="botao-redondo" onClick={aoVoltar} aria-label="Voltar">
          <IconeVoltar />
        </button>
        <h1 className="topo__titulo">Reservar</h1>
        <span className="topo__espaco" />
      </header>

      <div className={`resumo-item cat-${item.categoria()}`}>
        <span className="resumo-item__foto">
          <ImagemDoItem chave={item.imagem()} />
        </span>
        <span className="resumo-item__texto">
          <strong>{item.nome()}</strong>
          <small>{quantidade} {quantidade > 1 ? 'unidades' : 'unidade'}</small>
        </span>
        <span className="resumo-item__preco">{item.precoPara(quantidade).formatar()}</span>
      </div>

      <section className="passo">
        <h2 className="passo__titulo">
          <span className="passo__numero">1</span> Quando deve ser seu intervalo?
        </h2>
        <p className="passo__ajuda">
          Gire para escolher o início provável. Retiradas de {INICIOS[0].toString()} até{' '}
          {INICIOS[INICIOS.length - 1].toString()}.
        </p>
        <div className="seletor-horario">
          <div className="seletor-horario__rotulos" aria-hidden="true">
            <span>hora</span>
            <span>min</span>
          </div>
          <RodaDeSelecao
            opcoes={INICIOS}
            indice={indiceDoInicio}
            aoMudar={setIndiceDoInicio}
            rotuloAcessivel="Horário de início do intervalo"
            textoAcessivel={(h) => h.toString()}
            renderizar={(h) => (
              <span className="horario-roda">
                <span>{String(h.horas()).padStart(2, '0')}</span>
                <span className="horario-roda__sep">:</span>
                <span>{String(h.minutos()).padStart(2, '0')}</span>
              </span>
            )}
          />
        </div>

        <h3 className="passo__subtitulo">Duração da janela</h3>
        <div className="segmentado" role="radiogroup" aria-label="Duração da janela">
          {DURACOES.map((d) => (
            <button
              key={d}
              role="radio"
              aria-checked={duracao === d}
              className={`segmentado__opcao ${duracao === d ? 'segmentado__opcao--ativa' : ''}`}
              onClick={() => setDuracao(d)}
            >
              {d} min
            </button>
          ))}
        </div>
        <p className="passo__ajuda">15 min de intervalo + até 15 min de margem se o professor atrasar.</p>

        <div className={`janela-preview ${janela ? 'janela-preview--ok' : ''}`}>
          {janela ? (
            <>
              <span>Você retira entre</span>
              <strong>{janela.descricao()}</strong>
            </>
          ) : (
            <span>Escolha um horário de início</span>
          )}
        </div>
      </section>

      <section className="passo">
        <h2 className="passo__titulo">
          <span className="passo__numero">2</span> Como quer pagar?
        </h2>
        <div className="formas" role="radiogroup" aria-label="Forma de pagamento">
          {formas.map((forma) => (
            <button
              key={forma.id}
              role="radio"
              aria-checked={formaId === forma.id}
              className={`forma ${formaId === forma.id ? 'forma--ativa' : ''}`}
              onClick={() => setFormaId(forma.id)}
            >
              <span className="forma__icone">
                <IconeCarteira />
              </span>
              <span className="forma__texto">
                <strong>{forma.nome}</strong>
                <small>{forma.descricao}</small>
              </span>
              <span className="forma__radio" />
            </button>
          ))}
        </div>
      </section>

      {!reservasAbertas && (
        <p className="aviso">
          <IconeAlerta width={18} height={18} /> Reservas encerradas às {aluno.horarioLimite.horarioLimite().toString()}.
        </p>
      )}
      {erro && (
        <p className="aviso" role="alert">
          <IconeAlerta width={18} height={18} /> {erro}
        </p>
      )}

      <div className="barra-acao">
        <button className="pilula pilula--cheia pilula--larga" onClick={confirmar} disabled={!podeConfirmar}>
          Confirmar reserva · {item.precoPara(quantidade).formatar()}
        </button>
      </div>

      {pedidoComQr && <FolhaPix pedido={pedidoComQr} aoContinuar={() => aoConcluir(pedidoComQr)} />}
    </div>
  )
}

function FolhaPix({ pedido, aoContinuar }: { pedido: Pedido; aoContinuar(): void }) {
  const codigo = pedido.codigoQrDoPagamento() ?? ''
  const [copiado, setCopiado] = useState(false)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(codigo)
    } catch {
      /* sem permissão de área de transferência: tudo bem, é simulado */
    }
    setCopiado(true)
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-pix">
      <div className="modal__folha">
        <span className="modal__alca" />
        <h2 id="titulo-pix" className="modal__titulo">Pix · {pedido.total().formatar()}</h2>
        <p className="modal__texto">Escaneie ou copie o código. <em>(Simulado — nada é cobrado.)</em></p>
        <div className="qr-moldura">
          <QrFalso conteudo={codigo} />
        </div>
        <button className="copia-e-cola" onClick={copiar}>
          <span>{codigo.slice(0, 30)}…</span>
          {copiado ? <IconeCheck width={18} height={18} /> : <IconeCopiar width={18} height={18} />}
        </button>
        <p className={`status-pagamento ${pedido.estaPago() ? 'status-pagamento--pago' : ''}`}>
          <IconeCheck width={18} height={18} /> {pedido.resumoDoPagamento()}
        </p>
        <button className="pilula pilula--cheia pilula--larga" onClick={aoContinuar}>
          Ver minha comanda
        </button>
      </div>
    </div>
  )
}
