import { useState } from 'react'
import { HoraDoDia } from '../../core/dominio/compartilhado/HoraDoDia'
import type { ControleDeRelogio } from '../../core/dominio/tempo/Relogio'
import { horaCurta } from '../formatar'
import { IconeFechar, IconeRelogio } from './Icones'

const ATALHOS = ['18:58', '19:05', '20:00', '20:15', '20:30', '21:00']

/** Controle discreto para simular o horário (o domínio inteiro usa o Relogio injetado). */
interface Props {
  controleDeRelogio: ControleDeRelogio
  agora: Date
}

/**
 * Compartilhado pelos dois apps. O relógio simulado vive no estado compartilhado,
 * então ajustar aqui também muda o horário do outro app.
 */
export function PainelDeDebug({ controleDeRelogio, agora }: Props) {
  const [aberto, setAberto] = useState(false)
  const aplicar = (acao: () => void) => acao()

  if (!aberto) {
    return (
      <button
        className={`debug-gatilho ${controleDeRelogio.estaAjustado() ? 'debug-gatilho--ativo' : ''}`}
        onClick={() => setAberto(true)}
        aria-label="Abrir simulador de horário (debug)"
        title="Simular horário (debug)"
      >
        <IconeRelogio width={16} height={16} />
      </button>
    )
  }

  return (
    <div className="debug" role="dialog" aria-label="Simulador de horário">
      <div className="debug__topo">
        <strong>Simular horário</strong>
        <span className="debug__agora">{horaCurta(agora)}</span>
        <button className="debug__fechar" onClick={() => setAberto(false)} aria-label="Fechar">
          <IconeFechar width={16} height={16} />
        </button>
      </div>
      <div className="debug__atalhos">
        {ATALHOS.map((h) => (
          <button key={h} onClick={() => aplicar(() => controleDeRelogio.ajustarPara(HoraDoDia.deTexto(h)))}>
            {h}
          </button>
        ))}
        <button onClick={() => aplicar(() => controleDeRelogio.avancarMinutos(5))}>+5 min</button>
        <button onClick={() => aplicar(() => controleDeRelogio.voltarAoHorarioReal())}>Real</button>
      </div>
      <label className="debug__campo">
        Ir para
        <input
          type="time"
          onChange={(e) => e.target.value && aplicar(() => controleDeRelogio.ajustarPara(HoraDoDia.deTexto(e.target.value)))}
        />
      </label>
    </div>
  )
}
