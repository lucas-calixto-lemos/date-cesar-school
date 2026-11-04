import { mascoteCreme } from '../../design/componentes/Marca'
import './demo.css'

const DESTINOS = [
  { href: '/demo', titulo: 'Demo lado a lado', texto: 'Aluno e cantina juntos, sincronizados em memória.' },
  { href: '/aluno', titulo: 'App do aluno', texto: 'Abra numa aba. Sincroniza com /cantina por BroadcastChannel.' },
  { href: '/cantina', titulo: 'App da cantina', texto: 'Abra noutra aba. Sincroniza com /aluno por BroadcastChannel.' },
]

/** Página inicial ("/"): só aponta para os apps. */
export function Inicio() {
  return (
    <main className="inicio">
      <img src={mascoteCreme} alt="" className="inicio__mascote" />
      <h1 className="inicio__nome">DATÊ</h1>
      <p className="inicio__escola">CESAR School</p>
      <nav className="inicio__lista">
        {DESTINOS.map((d) => (
          <a key={d.href} href={d.href} className="inicio__destino">
            <strong>{d.titulo}</strong>
            <small>{d.texto}</small>
            <code>{d.href}</code>
          </a>
        ))}
      </nav>
    </main>
  )
}
