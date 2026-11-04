// O mascote é da Fernanda: usado exatamente como foi entregue (sem alterações).
import mascoteCreme from '../../assets/mascote-creme.svg'
import mascoteVermelho from '../../assets/mascote-vermelho.svg'

const MASCOTES = { vermelha: mascoteVermelho, creme: mascoteCreme }

interface Props {
  variante?: keyof typeof MASCOTES
  tamanho?: 'p' | 'g'
  /** Linha embaixo do DATÊ: 'CESAR School' no aluno, 'Cantina · CESAR School' na cantina. */
  subtitulo?: string
}

export function Marca({ variante = 'vermelha', tamanho = 'p', subtitulo = 'CESAR School' }: Props) {
  return (
    <div className={`marca marca--${tamanho} marca--${variante}`}>
      <img src={MASCOTES[variante]} alt="Mascote do Datê" className="marca__mascote" />
      <div className="marca__texto">
        <span className="marca__nome">DATÊ</span>
        <span className="marca__escola">{subtitulo}</span>
      </div>
    </div>
  )
}

export { mascoteCreme, mascoteVermelho }
