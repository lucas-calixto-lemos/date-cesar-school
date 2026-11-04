import { useMemo } from 'react'
import {
  criarArmazemEmMemoria,
  montarServicosDaCantina,
  montarServicosDoAluno,
} from '../../core/composicao/composicao'
import { AppDaCantina } from '../cantina/AppDaCantina'
import { AppDoAluno } from '../aluno/AppDoAluno'
import './demo.css'

/**
 * Bancada de TESTE: os dois apps lado a lado, cada um na sua "moldura de celular".
 * Os apps continuam separados (não importam um ao outro); só esta página, que
 * existe para demonstração, junta os dois.
 */
// PRINCÍPIO: Inversão de Dependências — aqui se escolhe a implementação 1
// (memória, uma instância para os dois). Os apps recebem só os seus serviços.
export function Demo() {
  const { aluno, cantina } = useMemo(() => {
    const armazem = criarArmazemEmMemoria()
    return { aluno: montarServicosDoAluno(armazem), cantina: montarServicosDaCantina(armazem) }
  }, [])

  return (
    <div className="demo">
      <header className="demo__topo">
        <h1 className="demo__titulo">
          DATÊ <span>· demo</span>
        </h1>
        <p className="demo__texto">
          Os dois apps compartilham o mesmo estado <b>em memória</b>: o que acontece em um aparece no outro na hora.
          Para testar em abas separadas (sincronia por <b>BroadcastChannel</b>), abra{' '}
          <a href="/aluno" target="_blank" rel="noreferrer">/aluno</a> e{' '}
          <a href="/cantina" target="_blank" rel="noreferrer">/cantina</a>.
        </p>
      </header>

      <div className="demo__palco">
        <figure className="demo__celular">
          <figcaption className="demo__legenda">App do aluno</figcaption>
          <div className="demo__tela">
            <AppDoAluno servicos={aluno} />
          </div>
        </figure>
        <figure className="demo__celular">
          <figcaption className="demo__legenda">App da cantina</figcaption>
          <div className="demo__tela">
            <AppDaCantina servicos={cantina} />
          </div>
        </figure>
      </div>
    </div>
  )
}
