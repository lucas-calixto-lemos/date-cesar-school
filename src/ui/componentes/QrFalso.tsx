/** Desenha um QR Code FALSO (padrão determinístico a partir do texto). Não é escaneável. */
const TAMANHO = 25

function gerador(semente: string) {
  let h = 2166136261
  for (const c of semente) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return () => {
    h ^= h << 13
    h ^= h >>> 17
    h ^= h << 5
    return ((h >>> 0) % 1000) / 1000
  }
}

const ehLocalizador = (x: number, y: number) => {
  const dentro = (ox: number, oy: number) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7
  return dentro(0, 0) || dentro(TAMANHO - 7, 0) || dentro(0, TAMANHO - 7)
}

export function QrFalso({ conteudo }: { conteudo: string }) {
  const aleatorio = gerador(conteudo)
  const modulos: Array<[number, number]> = []
  for (let y = 0; y < TAMANHO; y++) {
    for (let x = 0; x < TAMANHO; x++) {
      if (!ehLocalizador(x, y) && aleatorio() > 0.52) modulos.push([x, y])
    }
  }
  const localizadores = [[0, 0], [TAMANHO - 7, 0], [0, TAMANHO - 7]]
  return (
    <svg viewBox={`-2 -2 ${TAMANHO + 4} ${TAMANHO + 4}`} className="qr" role="img" aria-label="QR Code Pix (simulado)">
      <rect x="-2" y="-2" width={TAMANHO + 4} height={TAMANHO + 4} fill="#fff" rx="2" />
      {modulos.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#2A1610" />
      ))}
      {localizadores.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="7" height="7" rx="1.6" fill="#2A1610" />
          <rect x={x + 1} y={y + 1} width="5" height="5" rx="1" fill="#fff" />
          <rect x={x + 2} y={y + 2} width="3" height="3" rx=".8" fill="#F93209" />
        </g>
      ))}
    </svg>
  )
}
