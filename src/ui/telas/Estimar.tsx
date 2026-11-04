import { useState } from 'react'
import type { LocalDoCampus } from '../../dominio/campus/LocalDoCampus'
import { NivelDeChance } from '../../dominio/estimativa/ClassificadorDeChance'
import { ServicoDeEstimativa } from '../../dominio/estimativa/ServicoDeEstimativa'
import { useApp } from '../contexto'
import { IconeLocal, IconeVoltar } from '../componentes/Icones'
import { IlustracaoDoItem } from '../componentes/IlustracaoDoItem'

interface Props {
  itemId: string
  aoVoltar(): void
}

const NIVEIS = NivelDeChance.todos()

export function Estimar({ itemId, aoVoltar }: Props) {
  const { aluno } = useApp()
  const item = aluno.cardapio.buscar(itemId)
  const [local, setLocal] = useState<LocalDoCampus | null>(null)
  const [restantes, setRestantes] = useState(15)

  // Recalcula a cada render (a fila simulada muda com o horário).
  const resposta = local
    ? aluno.estimativa.responder({ item, local, minutosDeIntervaloRestantes: restantes })
    : null

  return (
    <div className="tela tela--estimar">
      <header className="topo topo--tela">
        <button className="botao-redondo" onClick={aoVoltar} aria-label="Voltar">
          <IconeVoltar />
        </button>
        <h1 className="topo__titulo">Dá tempo?</h1>
        <span className="topo__espaco" />
      </header>

      <div className={`resumo-item cat-${item.categoria()}`}>
        <span className="resumo-item__foto">
          <IlustracaoDoItem imagem={item.imagem()} />
        </span>
        <span className="resumo-item__texto">
          <strong>{item.nome()}</strong>
          <small>Vale a pena ir no balcão agora?</small>
        </span>
      </div>

      <section className="passo">
        <h2 className="passo__titulo">
          <span className="passo__numero">1</span> Onde você está?
        </h2>
        <div className="locais">
          {aluno.locais.map((l) => (
            <button
              key={l.id}
              className={`chip chip--local ${local?.id === l.id ? 'chip--ativo' : ''}`}
              onClick={() => setLocal(l)}
            >
              <IconeLocal width={16} height={16} /> {l.nome}
            </button>
          ))}
        </div>
      </section>

      <section className="passo">
        <h2 className="passo__titulo">
          <span className="passo__numero">2</span> Quanto falta do intervalo?
        </h2>
        <div className="minutos">
          <output className="minutos__valor">
            {restantes}
            <small>min</small>
          </output>
          <input
            type="range"
            min={0}
            max={ServicoDeEstimativa.MAXIMO_DE_MINUTOS_RESTANTES}
            value={restantes}
            onChange={(e) => setRestantes(Number(e.target.value))}
            aria-label="Minutos de intervalo restantes"
            className="minutos__slider"
          />
        </div>
      </section>

      {resposta ? (
        <section className={`resultado tom-${resposta.nivel.tom}`} aria-live="polite">
          <p className="resultado__titulo">{resposta.nivel.titulo}</p>
          <div className="medidor" aria-hidden="true">
            {NIVEIS.map((n) => (
              <span
                key={n.id}
                className={`medidor__barra tom-${n.tom} ${n.grau <= resposta.nivel.grau ? 'medidor__barra--acesa' : ''}`}
              />
            ))}
          </div>
          <p className="resultado__mensagem">{resposta.nivel.mensagem}</p>
          <p className="resultado__conta">
            Precisa de ~<b>{resposta.estimativa.minutosNecessarios} min</b> · você tem <b>{restantes} min</b>
          </p>
          <ul className="parcelas">
            {resposta.estimativa.parcelas.map((p) => (
              <li key={p.descricao}>
                <span>{p.descricao}</span>
                <b>{p.minutos.toLocaleString('pt-BR')} min</b>
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <p className="vazio">Escolha onde você está para calcular.</p>
      )}
    </div>
  )
}
