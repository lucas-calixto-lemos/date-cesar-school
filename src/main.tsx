import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { montarAplicacao } from './app/composicao'
import { App } from './ui/App'
import './ui/estilos.css'

const aplicacao = montarAplicacao()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App app={aplicacao} />
  </StrictMode>,
)
