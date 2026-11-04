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
import { Demo } from './apps/demo/Demo'
import { Inicio } from './apps/demo/Inicio'

/*
 * Rotas:
 *   /aluno   → app do aluno, sincronizado com outras abas (BroadcastChannel)
 *   /cantina → app da cantina, sincronizado com outras abas (BroadcastChannel)
 *   /demo    → os dois lado a lado, compartilhando o estado em memória
 *   /        → página inicial com os links
 *
 * PRINCÍPIO: Inversão de Dependências — é aqui (e no Demo) que se escolhe a
 * implementação do armazém. Os apps só recebem seus serviços prontos.
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
  '/demo': { titulo: 'Datê · Demo', tela: () => <Demo /> },
  '/': { titulo: 'Datê · CESAR School', tela: () => <Inicio /> },
}

const caminho = window.location.pathname.replace(/\/+$/, '') || '/'
const rota = ROTAS[caminho] ?? ROTAS['/']
document.title = rota.titulo

createRoot(document.getElementById('root')!).render(<StrictMode>{rota.tela()}</StrictMode>)
