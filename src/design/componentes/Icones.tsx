import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>

const base = (props: P) => ({
  width: 22,
  height: 22,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
  ...props,
})

export const IconeVoltar = (p: P) => (
  <svg {...base(p)}><path d="M15 18l-6-6 6-6" /></svg>
)
export const IconeBusca = (p: P) => (
  <svg {...base(p)}><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
)
export const IconeRelogio = (p: P) => (
  <svg {...base(p)}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
)
export const IconeLocal = (p: P) => (
  <svg {...base(p)}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></svg>
)
export const IconeCheck = (p: P) => (
  <svg {...base(p)}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
)
export const IconeMais = (p: P) => (
  <svg {...base(p)}><path d="M12 5v14M5 12h14" /></svg>
)
export const IconeMenos = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14" /></svg>
)
export const IconeFechar = (p: P) => (
  <svg {...base(p)}><path d="M6 6l12 12M18 6L6 18" /></svg>
)
export const IconeCopiar = (p: P) => (
  <svg {...base(p)}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></svg>
)
export const IconeSeta = (p: P) => (
  <svg {...base(p)}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
)
export const IconeCarteira = (p: P) => (
  <svg {...base(p)}><rect x="3" y="6" width="18" height="13" rx="3" /><path d="M16 12.5h2M3 9h18" /></svg>
)
export const IconeAlerta = (p: P) => (
  <svg {...base(p)}><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.2v.1" /></svg>
)
export const IconeLua = (p: P) => (
  <svg {...base(p)}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
)
export const IconeSol = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4" />
  </svg>
)
export const IconePlay =(p: P) => (
  <svg {...base({ ...p, fill: 'currentColor', stroke: 'none' })}>
    <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
  </svg>
)
