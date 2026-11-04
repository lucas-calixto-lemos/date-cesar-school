import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ServicosDoAluno } from '../../core/composicao/composicao'
import { Comanda } from '../../core/dominio/comanda/Comanda'
import type { Pedido } from '../../core/dominio/pedido/Pedido'
import { useAoVivo } from '../../design/aoVivo'
import { PainelDeDebug } from '../../design/componentes/PainelDeDebug'
import { Splash } from '../../design/componentes/Splash'
import { Contexto, type ContextoDoApp } from './contexto'
import { salvarTema, temaInicial, type Tema } from './tema'
import { DetalheDoItem } from './telas/DetalheDoItem'
import { Estimar } from './telas/Estimar'
import { Home } from './telas/Home'
import { Reservar } from './telas/Reservar'
import { TelaDoPedido } from './telas/TelaDoPedido'

type Rota =
  | { tela: 'home' }
  | { tela: 'detalhe'; itemId: string }
  | { tela: 'reservar'; itemId: string; quantidade: number }
  | { tela: 'estimar'; itemId: string }
  | { tela: 'pedido' }

const CHAVE_COMANDA = 'date:minha-comanda'
const lerComanda = (): number | null => {
  try {
    const n = Number(localStorage.getItem(CHAVE_COMANDA))
    return Number.isInteger(n) && n > 0 ? n : null
  } catch {
    return null
  }
}
const gravarComanda = (n: number) => {
  try {
    localStorage.setItem(CHAVE_COMANDA, String(n))
  } catch {
    /* sem armazenamento: vale só nesta sessão */
  }
}

/**
 * App do ALUNO. Recebe os serviços prontos (injetados) — não sabe se o estado
 * vem da memória (/demo) ou de outras abas (/aluno).
 */
// PRINCÍPIO: Inversão de Dependências — a raiz do app depende de ServicosDoAluno
// (abstração montada fora dele), não de implementações concretas.
export function AppDoAluno({ servicos }: { servicos: ServicosDoAluno }) {
  const [mostrarSplash, setMostrarSplash] = useState(true)
  const [pilha, setPilha] = useState<Rota[]>([{ tela: 'home' }])
  const [minhaComanda, setMinhaComanda] = useState<number | null>(lerComanda)
  const [tema, setTema] = useState<Tema>(temaInicial)
  const rolagem = useRef<HTMLDivElement>(null)

  // Re-renderiza a cada segundo e sempre que o estado compartilhado mudar.
  const agora = useAoVivo(servicos)

  // O pedido é relido do estado a cada render: quem muda ele pode ser a cantina.
  const pedidoAtual: Pedido | null =
    (minhaComanda && servicos.retirada.acompanhar(Comanda.de(minhaComanda))) || null

  const alternarTema = useCallback(() => {
    setTema((atual) => {
      const novo: Tema = atual === 'escuro' ? 'claro' : 'escuro'
      salvarTema(novo)
      return novo
    })
  }, [])

  const rota = pilha[pilha.length - 1]
  useEffect(() => {
    rolagem.current?.scrollTo(0, 0)
  }, [rota])

  const ir = (proxima: Rota) => setPilha((p) => [...p, proxima])
  const voltar = () => setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p))
  const terminarSplash = useCallback(() => setMostrarSplash(false), [])

  const contexto = useMemo<ContextoDoApp>(
    () => ({ aluno: servicos, agora, tema, alternarTema }),
    [servicos, agora, tema, alternarTema],
  )

  function concluirReserva(pedido: Pedido) {
    const numero = Number(pedido.numeroDaComanda())
    setMinhaComanda(numero)
    gravarComanda(numero)
    setPilha([{ tela: 'home' }, { tela: 'pedido' }])
  }

  function renderizarTela() {
    switch (rota.tela) {
      case 'home':
        return (
          <Home
            pedidoAtual={pedidoAtual}
            aoAbrirItem={(itemId) => ir({ tela: 'detalhe', itemId })}
            aoAbrirPedido={() => ir({ tela: 'pedido' })}
          />
        )
      case 'detalhe':
        return (
          <DetalheDoItem
            itemId={rota.itemId}
            aoVoltar={voltar}
            aoReservar={(quantidade) => ir({ tela: 'reservar', itemId: rota.itemId, quantidade })}
            aoEstimar={() => ir({ tela: 'estimar', itemId: rota.itemId })}
          />
        )
      case 'reservar':
        return (
          <Reservar itemId={rota.itemId} quantidade={rota.quantidade} aoVoltar={voltar} aoConcluir={concluirReserva} />
        )
      case 'estimar':
        return <Estimar itemId={rota.itemId} aoVoltar={voltar} />
      case 'pedido':
        return pedidoAtual ? <TelaDoPedido pedido={pedidoAtual} aoVoltar={voltar} /> : null
    }
  }

  return (
    <Contexto.Provider value={contexto}>
      <div className="aparelho tema-aluno" data-modo={tema}>
        <div className="aparelho__rolagem" ref={rolagem}>
          {mostrarSplash ? <Splash aoTerminar={terminarSplash} /> : renderizarTela()}
        </div>
        {!mostrarSplash && <PainelDeDebug controleDeRelogio={servicos.controleDeRelogio} agora={agora} />}
      </div>
    </Contexto.Provider>
  )
}
