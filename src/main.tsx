import { StrictMode, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'
// Primeiro a base visual compartilhada; os CSS de cada app (importados por eles) vêm depois e a especializam.
import './design/estilos.css'
import {
  criarArmazemEntreAbas,
  montarServicosDaCantina,
  montarServicosDoAluno,
} from './core/composicao/composicao'
import { AppDaCantina } from './apps/cantina/AppDaCantina'
import { AppDoAluno } from './apps/aluno/AppDoAluno'
import { Inicio } from './apps/inicio/Inicio'

/*
 * Rotas:
 *   /aluno   → app do aluno
 *   /cantina → app da cantina
 *   /        → página inicial com os links
 * Abertos em abas do mesmo navegador, aluno e cantina se sincronizam (BroadcastChannel).
 *
 * PRINCÍPIO: Inversão de Dependências — é aqui que se escolhe a implementação do
 * armazém. Os apps só recebem seus serviços prontos.
 */
const ROTAS: Record<string, { titulo: string; tela: () => ReactNode }> = {
  '/aluno': {
    titulo: 'Datê · Aluno',
    tela: () => <AppDoAluno servicos={montarServicosDoAluno(criarArmazemEntreAbas())} />,
  },
  '/cantina': {
    titulo: 'Datê · Cantina',
    tela: () => <AppDaCantina servicos={montarServicosDaCantina(criarArmazemEntreAbas())} />,
  },
  '/': { titulo: 'Datê · CESAR School', tela: () => <Inicio /> },
}

const caminho = window.location.pathname.replace(/\/+$/, '') || '/'
const rota = ROTAS[caminho] ?? ROTAS['/']
document.title = rota.titulo

createRoot(document.getElementById('root')!).render(<StrictMode>{rota.tela()}</StrictMode>)
