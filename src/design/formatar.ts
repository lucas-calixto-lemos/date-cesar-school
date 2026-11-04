const dois = (n: number) => String(n).padStart(2, '0')

/** 8_073_000 ms → "02:14:33" */
export function cronometro(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  return `${dois(Math.floor(total / 3600))}:${dois(Math.floor((total % 3600) / 60))}:${dois(total % 60)}`
}

/** 65 → "1h 05min"; 12 → "12 min" */
export function minutosPorExtenso(minutos: number): string {
  if (minutos < 60) return `${minutos} min`
  return `${Math.floor(minutos / 60)}h ${dois(minutos % 60)}min`
}

export function horaCurta(data: Date): string {
  return `${dois(data.getHours())}:${dois(data.getMinutes())}`
}
