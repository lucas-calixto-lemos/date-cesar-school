import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { montarAplicacao } from './app/composicao'
import { App } from './ui/App'
import './ui/estilos.css'
import { aplicarTema, temaInicial } from './ui/tema'

aplicarTema(temaInicial()) // antes do 1º render, para a tela não piscar no tema errado
const aplicacao = montarAplicacao()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App app={aplicacao} />
  </StrictMode>,
)
