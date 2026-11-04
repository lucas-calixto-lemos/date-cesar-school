import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  titulo: string
  children?: ReactNode
  rotuloConfirmar: string
  rotuloCancelar?: string
  /** 'perigo' pinta o botão de confirmação com a cor de destaque (vermelho). */
  tom?: 'normal' | 'perigo'
  aoConfirmar(): void
  aoCancelar(): void
  /** Ação extra, discreta (ex.: "Cancelar este pedido…"). */
  extra?: ReactNode
}

/** Confirmação antes de ações que mudam o estado (folha que sobe de baixo). */
export function DialogoDeConfirmacao({
  titulo,
  children,
  rotuloConfirmar,
  rotuloCancelar = 'Cancelar',
  tom = 'normal',
  aoConfirmar,
  aoCancelar,
  extra,
}: Props) {
  const confirmar = useRef<HTMLButtonElement>(null)
  useEffect(() => confirmar.current?.focus(), [])

  return (
    <div
      className="modal"
      role="alertdialog"
      aria-modal="true"
      aria-label={titulo}
      onClick={(e) => e.target === e.currentTarget && aoCancelar()}
      onKeyDown={(e) => e.key === 'Escape' && aoCancelar()}
    >
      <div className="modal__folha dialogo">
        <span className="modal__alca" />
        <h2 className="modal__titulo">{titulo}</h2>
        {children && <div className="dialogo__corpo">{children}</div>}
        <div className="dialogo__acoes">
          <button
            ref={confirmar}
            className={`pilula pilula--cheia pilula--larga ${tom === 'perigo' ? 'pilula--perigo' : ''}`}
            onClick={aoConfirmar}
          >
            {rotuloConfirmar}
          </button>
          <button className="pilula pilula--contorno pilula--larga" onClick={aoCancelar}>
            {rotuloCancelar}
          </button>
        </div>
        {extra}
      </div>
    </div>
  )
}
