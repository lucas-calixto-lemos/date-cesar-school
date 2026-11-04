import { mascoteCreme } from '../../design/componentes/Marca'
import './inicio.css'

const DESTINOS = [
  { href: '/aluno', titulo: 'App do aluno', texto: 'Abra numa aba. Tudo o que fizer aparece na cantina.' },
  { href: '/cantina', titulo: 'App da cantina', texto: 'Abra noutra aba. Sincroniza com o aluno em tempo real.' },
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
      <p className="inicio__dica">
        Abra os dois em abas do mesmo navegador. Para recomeçar um teste, use <b>Resetar teste</b> na abinha
        lateral de qualquer um dos apps.
      </p>
    </main>
  )
}
