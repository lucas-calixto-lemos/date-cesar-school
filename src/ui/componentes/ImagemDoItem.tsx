import { IlustracaoDoItem } from './IlustracaoDoItem'

/*
 * Fotos dos produtos: basta colocar `src/assets/produtos/<chave>.(jpg|png|webp)`.
 * A chave é a mesma de `item.imagem()` (igual ao id do item).
 * Sem foto, cai na ilustração SVG — trocar as fotos não exige mudar código.
 */
const ARQUIVOS = import.meta.glob<string>('../../assets/produtos/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
})

const FOTOS = new Map(
  Object.entries(ARQUIVOS).map(([caminho, url]) => [caminho.split('/').pop()!.replace(/\.\w+$/, ''), url]),
)

export const temFoto = (chave: string) => FOTOS.has(chave)

export function ImagemDoItem({ chave, className = '' }: { chave: string; className?: string }) {
  const url = FOTOS.get(chave)
  if (!url) return <IlustracaoDoItem imagem={chave} className={className} />
  return <img src={url} alt="" className={`foto-item ${className}`} draggable={false} />
}
