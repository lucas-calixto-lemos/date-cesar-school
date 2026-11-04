import { useState } from 'react'
import { HoraDoDia } from '../../core/dominio/compartilhado/HoraDoDia'
import type { ControleDeRelogio } from '../../core/dominio/tempo/Relogio'
import { horaCurta } from '../formatar'
import { DialogoDeConfirmacao } from './DialogoDeConfirmacao'
import { IconeFechar, IconeRelogio } from './Icones'

const ATALHOS = ['18:58', '19:05', '20:00', '20:15', '20:30', '21:00']

interface Props {
  controleDeRelogio: ControleDeRelogio
  agora: Date
  /** Apaga tudo o que foi feito no teste (nos dois apps). */
  aoResetar(): void
}

/**
 * Painel discreto de testes, compartilhado pelos dois apps.
 * O relógio simulado e o reset agem sobre o estado compartilhado, então
 * valem também para o outro app (inclusive em outra aba).
 */
export function PainelDeDebug({ controleDeRelogio, agora, aoResetar }: Props) {
  const [aberto, setAberto] = useState(false)
  const [confirmandoReset, setConfirmandoReset] = useState(false)

  if (!aberto) {
    return (
      <button
        className={`debug-gatilho ${controleDeRelogio.estaAjustado() ? 'debug-gatilho--ativo' : ''}`}
        onClick={() => setAberto(true)}
        aria-label="Abrir painel de testes (debug)"
        title="Painel de testes (debug)"
      >
        <IconeRelogio width={16} height={16} />
      </button>
    )
  }

  return (
    <>
      {/* Enquanto confirma o reset, o painel sai da frente do diálogo. */}
      <div className="debug" role="dialog" aria-label="Painel de testes" hidden={confirmandoReset}>
        <div className="debug__topo">
          <strong>Simular horário</strong>
          <span className="debug__agora">{horaCurta(agora)}</span>
          <button className="debug__fechar" onClick={() => setAberto(false)} aria-label="Fechar">
            <IconeFechar width={16} height={16} />
          </button>
        </div>
        <div className="debug__atalhos">
          {ATALHOS.map((h) => (
            <button key={h} onClick={() => controleDeRelogio.ajustarPara(HoraDoDia.deTexto(h))}>
              {h}
            </button>
          ))}
          <button onClick={() => controleDeRelogio.avancarMinutos(5)}>+5 min</button>
          <button onClick={() => controleDeRelogio.voltarAoHorarioReal()}>Real</button>
        </div>
        <label className="debug__campo">
          Ir para
          <input
            type="time"
            onChange={(e) => e.target.value && controleDeRelogio.ajustarPara(HoraDoDia.deTexto(e.target.value))}
          />
        </label>
        <button className="debug__resetar" onClick={() => setConfirmandoReset(true)}>
          Resetar teste
        </button>
      </div>

      {confirmandoReset && (
        <DialogoDeConfirmacao
          titulo="Resetar o teste?"
          rotuloConfirmar="Resetar tudo"
          tom="perigo"
          aoConfirmar={() => {
            aoResetar()
            setConfirmandoReset(false)
            setAberto(false)
          }}
          aoCancelar={() => setConfirmandoReset(false)}
        >
          <p>
            Apaga <b>todas as reservas</b> e volta estoque, comandas (a partir de 019), horário e status da cantina
            ao início — <b>no app do aluno e no da cantina</b>.
          </p>
        </DialogoDeConfirmacao>
      )}
    </>
  )
}
