import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Aplicacao } from '../app/composicao'
import type { Pedido } from '../dominio/pedido/Pedido'
import { PainelDeDebug } from './componentes/PainelDeDebug'
import { Contexto, type ContextoDoApp } from './contexto'
import { DetalheDoItem } from './telas/DetalheDoItem'
import { Estimar } from './telas/Estimar'
import { Home } from './telas/Home'
import { Reservar } from './telas/Reservar'
import { Splash } from './telas/Splash'
import { TelaDoPedido } from './telas/TelaDoPedido'

type Rota =
  | { tela: 'home' }
  | { tela: 'detalhe'; itemId: string }
  | { tela: 'reservar'; itemId: string; quantidade: number }
  | { tela: 'estimar'; itemId: string }
  | { tela: 'pedido' }

export function App({ app }: { app: Aplicacao }) {
  const [mostrarSplash, setMostrarSplash] = useState(true)
  const [pilha, setPilha] = useState<Rota[]>([{ tela: 'home' }])
  const [pedidoAtual, setPedidoAtual] = useState<Pedido | null>(null)
  const [agora, setAgora] = useState(() => app.aluno.relogio.agora())

  const atualizar = useCallback(() => setAgora(app.aluno.relogio.agora()), [app])

  useEffect(() => {
    const id = setInterval(atualizar, 1000)
    return () => clearInterval(id)
  }, [atualizar])

  const rota = pilha[pilha.length - 1]
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [rota])

  const ir = (proxima: Rota) => setPilha((p) => [...p, proxima])
  const voltar = () => setPilha((p) => (p.length > 1 ? p.slice(0, -1) : p))
  const terminarSplash = useCallback(() => setMostrarSplash(false), [])

  const contexto = useMemo<ContextoDoApp>(
    () => ({ aluno: app.aluno, controleDeRelogio: app.controleDeRelogio, agora, atualizar }),
    [app, agora, atualizar],
  )

  function concluirReserva(pedido: Pedido) {
    setPedidoAtual(pedido)
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
      <div className="aparelho">
        {mostrarSplash ? <Splash aoTerminar={terminarSplash} /> : renderizarTela()}
        {!mostrarSplash && <PainelDeDebug />}
      </div>
    </Contexto.Provider>
  )
}
