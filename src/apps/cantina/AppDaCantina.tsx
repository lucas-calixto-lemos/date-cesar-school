import { useCallback, useMemo, useState } from 'react'
import type { ServicosDaCantina } from '../../core/composicao/composicao'
import { useAoVivo } from '../../design/aoVivo'
import { PainelDeDebug } from '../../design/componentes/PainelDeDebug'
import { Splash } from '../../design/componentes/Splash'
import './cantina.css'
import { Contexto, type ContextoDaCantina } from './contexto'
import { PainelDaCantina } from './telas/PainelDaCantina'

/**
 * App da CANTINA (tela da tia). Mesmos componentes visuais do aluno, outro tema.
 * Recebe os serviços prontos: não sabe se o estado vem da memória (/demo) ou de
 * outras abas (/cantina).
 */
// PRINCÍPIO: Inversão de Dependências — depende de ServicosDaCantina (abstração).
export function AppDaCantina({ servicos }: { servicos: ServicosDaCantina }) {
  const [mostrarSplash, setMostrarSplash] = useState(true)
  const terminarSplash = useCallback(() => setMostrarSplash(false), [])

  // Observer: qualquer mudança no estado (vinda do app do aluno) re-renderiza.
  const agora = useAoVivo(servicos)
  const contexto = useMemo<ContextoDaCantina>(() => ({ cantina: servicos, agora }), [servicos, agora])

  return (
    <Contexto.Provider value={contexto}>
      <div className="aparelho tema-cantina">
        <div className="aparelho__rolagem">
          {mostrarSplash ? (
            <Splash aoTerminar={terminarSplash} subtitulo="Cantina · CESAR School" />
          ) : (
            <PainelDaCantina />
          )}
        </div>
        {!mostrarSplash && <PainelDeDebug controleDeRelogio={servicos.controleDeRelogio} agora={agora} />}
      </div>
    </Contexto.Provider>
  )
}
