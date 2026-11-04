import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

/*
 * Roda de seleção no estilo dos seletores de horário do celular, porém CIRCULAR:
 * depois da última opção vem a primeira (e vice-versa). Quem decide quais opções
 * existem é quem a usa — a roda não conhece regra nenhuma.
 *
 * Como o "infinito" funciona: a lista é repetida COPIAS vezes. Quando o giro
 * para perto das pontas, a roda pula, sem animação, para a mesma opção na cópia
 * do meio. Para o usuário, nada muda.
 */
const ALTURA_DO_ITEM = 46
const VISIVEIS = 5 // ímpar: um no centro, dois acima, dois abaixo
const COPIAS = 9
const ESPERA_PARA_ASSENTAR_MS = 120

interface Props<T> {
  opcoes: T[]
  indice: number
  aoMudar(indice: number): void
  renderizar(opcao: T): ReactNode
  rotuloAcessivel: string
  textoAcessivel(opcao: T): string
}

const modulo = (i: number, n: number) => ((i % n) + n) % n

export function RodaDeSelecao<T>({ opcoes, indice, aoMudar, renderizar, rotuloAcessivel, textoAcessivel }: Props<T>) {
  const n = opcoes.length
  const inicioDoMeio = Math.floor(COPIAS / 2) * n
  const roda = useRef<HTMLDivElement>(null)
  const temporizador = useRef<number | undefined>(undefined)
  const quadro = useRef<number | undefined>(undefined)
  const [posicao, setPosicao] = useState(inicioDoMeio + indice)

  const rolarPara = useCallback((posicaoAbsoluta: number, suave: boolean) => {
    roda.current?.scrollTo({ top: posicaoAbsoluta * ALTURA_DO_ITEM, behavior: suave ? 'smooth' : 'instant' })
  }, [])

  // Posição inicial (sem animação), já na cópia do meio.
  useLayoutEffect(() => {
    rolarPara(inicioDoMeio + indice, false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(
    () => () => {
      window.clearTimeout(temporizador.current)
      if (quadro.current) cancelAnimationFrame(quadro.current)
    },
    [],
  )

  function assentar() {
    const el = roda.current
    if (!el) return
    const absoluto = Math.round(el.scrollTop / ALTURA_DO_ITEM)
    const real = modulo(absoluto, n)
    // Perto das pontas da lista repetida? Volta para a cópia do meio, sem animação.
    if (absoluto < n * 2 || absoluto >= n * (COPIAS - 2)) rolarPara(inicioDoMeio + real, false)
    if (real !== indice) aoMudar(real)
  }

  function aoRolar() {
    if (quadro.current) cancelAnimationFrame(quadro.current)
    quadro.current = requestAnimationFrame(() => {
      if (roda.current) setPosicao(roda.current.scrollTop / ALTURA_DO_ITEM)
    })
    window.clearTimeout(temporizador.current)
    temporizador.current = window.setTimeout(assentar, ESPERA_PARA_ASSENTAR_MS)
  }

  function aoTeclar(e: KeyboardEvent) {
    const passo = { ArrowDown: 1, ArrowUp: -1, PageDown: 3, PageUp: -3 }[e.key]
    if (!passo) return
    e.preventDefault()
    rolarPara(Math.round(posicao) + passo, true)
  }

  const espacamento = ((VISIVEIS - 1) / 2) * ALTURA_DO_ITEM

  return (
    <div className="roda" style={{ height: VISIVEIS * ALTURA_DO_ITEM }}>
      <div className="roda__faixa" style={{ top: espacamento, height: ALTURA_DO_ITEM }} aria-hidden="true" />
      <div
        ref={roda}
        className="roda__trilho"
        onScroll={aoRolar}
        onKeyDown={aoTeclar}
        tabIndex={0}
        role="spinbutton"
        aria-label={rotuloAcessivel}
        aria-valuetext={textoAcessivel(opcoes[indice])}
        aria-valuenow={indice}
        aria-valuemin={0}
        aria-valuemax={n - 1}
        style={{ paddingBlock: espacamento }}
      >
        {Array.from({ length: n * COPIAS }, (_, i) => {
          const distancia = i - posicao
          // Só desenha o efeito nos itens perto da faixa; os outros ficam invisíveis.
          const perto = Math.abs(distancia) < VISIVEIS
          const centro = Math.abs(distancia) < 0.5
          return (
            <div
              key={i}
              className={`roda__item ${centro ? 'roda__item--centro' : ''}`}
              style={{
                height: ALTURA_DO_ITEM,
                opacity: perto ? Math.max(0.15, 1 - Math.abs(distancia) * 0.3) : 0,
                transform: perto
                  ? `rotateX(${Math.max(-75, Math.min(75, -distancia * 20))}deg) scale(${1 - Math.min(Math.abs(distancia), 3) * 0.06})`
                  : undefined,
              }}
              onClick={() => rolarPara(i, true)}
              aria-hidden="true"
            >
              {renderizar(opcoes[modulo(i, n)])}
            </div>
          )
        })}
      </div>
    </div>
  )
}
