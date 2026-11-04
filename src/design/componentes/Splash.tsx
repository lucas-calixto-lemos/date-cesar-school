import { useEffect } from 'react'
import { mascoteCreme } from './Marca'

const DURACAO_EM_MS = 2600

/** Abertura animada: o mascote entra quicando e "corre" no lugar (só CSS; o desenho não muda). */
/** As cores vêm do tema do app (tokens --splash-fundo / --splash-brilho). */
export function Splash({ aoTerminar, subtitulo = 'CESAR School' }: { aoTerminar: () => void; subtitulo?: string }) {
  useEffect(() => {
    const id = setTimeout(aoTerminar, DURACAO_EM_MS)
    return () => clearTimeout(id)
  }, [aoTerminar])

  return (
    <button className="splash" onClick={aoTerminar} aria-label="Entrar no Datê">
      <div className="splash__palco">
        <span className="splash__vento splash__vento--1" />
        <span className="splash__vento splash__vento--2" />
        <span className="splash__vento splash__vento--3" />
        <div className="splash__entrada">
          <img src={mascoteCreme} alt="" className="splash__mascote" />
        </div>
        <span className="splash__sombra" />
      </div>
      <h1 className="splash__nome">DATÊ</h1>
      <p className="splash__escola">{subtitulo}</p>
      <div className="splash__carregando" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </button>
  )
}
