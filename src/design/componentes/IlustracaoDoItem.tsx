import type { JSX } from 'react'

/*
 * Ilustrações genéricas desenhadas para a PoC (sem fotos e sem logos de marca).
 * A chave vem de `item.imagem()` — o domínio não sabe como a imagem é desenhada.
 */

const Sombra = () => <ellipse cx="60" cy="106" rx="36" ry="6" fill="#2A1610" opacity=".12" />

function Lata({ corpo, faixa, detalhe, largura = 44, altura = 68 }: {
  corpo: string; faixa: string; detalhe: string; largura?: number; altura?: number
}) {
  const x = 60 - largura / 2
  const y = 102 - altura
  return (
    <>
      <Sombra />
      <rect x={x} y={y} width={largura} height={altura} rx="7" fill={corpo} />
      <rect x={x} y={y + altura * 0.42} width={largura} height={altura * 0.2} fill={faixa} />
      <path d={`M${x} ${y + altura * 0.62} q ${largura / 4} -8 ${largura / 2} 0 t ${largura / 2} 0`} stroke={detalhe} strokeWidth="3" fill="none" />
      <rect x={x + 5} y={y + 7} width="5" height={altura - 14} rx="2.5" fill="#fff" opacity=".3" />
      <ellipse cx="60" cy={y} rx={largura / 2} ry="4.5" fill="#D5D9E0" />
      <ellipse cx="60" cy={y} rx={largura / 2 - 4} ry="2.6" fill="#B6BCC6" />
      <rect x="55" y={y - 2.5} width="10" height="4" rx="2" fill="#9AA1AC" />
      <ellipse cx="60" cy={y + altura} rx={largura / 2} ry="3.5" fill="#AEB4BD" />
    </>
  )
}

function Garrafa({ liquido, tampa, rotulo, bolhas = false }: {
  liquido: string; tampa: string; rotulo: string; bolhas?: boolean
}) {
  return (
    <>
      <Sombra />
      <rect x="52" y="12" width="16" height="11" rx="3" fill={tampa} />
      <path d="M53 23h14l5 13H48z" fill={liquido} opacity=".75" />
      <rect x="40" y="35" width="40" height="69" rx="13" fill={liquido} />
      <rect x="40" y="58" width="40" height="22" fill={rotulo} />
      <rect x="45" y="40" width="5" height="58" rx="2.5" fill="#fff" opacity=".45" />
      {bolhas && (
        <g fill="#fff" opacity=".85">
          <circle cx="66" cy="45" r="2.2" /><circle cx="58" cy="50" r="1.6" /><circle cx="70" cy="90" r="2" />
          <circle cx="62" cy="94" r="1.4" /><circle cx="54" cy="88" r="2.2" />
        </g>
      )}
    </>
  )
}

const ILUSTRACOES: Record<string, () => JSX.Element> = {
  coxinha: () => (
    <>
      <Sombra />
      <path d="M60 14c6 15 30 36 32 62 2 20-14 28-32 28s-34-8-32-28c2-26 26-47 32-62z" fill="#E28A2B" />
      <path d="M60 14c4 13 18 28 24 45-12-10-22-22-24-45z" fill="#F6B55A" opacity=".85" />
      <g fill="#B8621A"><circle cx="46" cy="80" r="2" /><circle cx="70" cy="88" r="2.2" /><circle cx="58" cy="70" r="1.6" /><circle cx="76" cy="74" r="1.6" /><circle cx="50" cy="94" r="1.8" /></g>
    </>
  ),
  'pao-de-queijo': () => (
    <>
      <Sombra />
      <circle cx="40" cy="78" r="23" fill="#EDB143" />
      <circle cx="82" cy="80" r="21" fill="#E6A535" />
      <circle cx="61" cy="50" r="23" fill="#F4C25A" />
      <g fill="#fff" opacity=".35"><ellipse cx="53" cy="41" rx="7" ry="4" /><ellipse cx="32" cy="70" rx="6" ry="3.5" /><ellipse cx="76" cy="72" rx="5" ry="3" /></g>
      <g fill="#C98A22"><circle cx="66" cy="58" r="1.8" /><circle cx="46" cy="86" r="1.6" /><circle cx="88" cy="88" r="1.8" /><circle cx="70" cy="44" r="1.4" /></g>
    </>
  ),
  esfirra: () => (
    <>
      <Sombra />
      <path d="M60 20c3 0 5 2 7 5l32 58c3 6 0 13-8 13H29c-8 0-11-7-8-13l32-58c2-3 4-5 7-5z" fill="#E9AC59" />
      <path d="M60 40l25 46H35z" fill="#A9442A" strokeLinejoin="round" stroke="#A9442A" strokeWidth="6" />
      <g fill="#6FA84B"><circle cx="58" cy="66" r="2.4" /><circle cx="66" cy="78" r="2.2" /><circle cx="50" cy="80" r="2" /></g>
      <g fill="#F5D7A0" opacity=".6"><circle cx="40" cy="92" r="2" /><circle cx="80" cy="92" r="2" /></g>
    </>
  ),
  enroladinho: () => (
    <>
      <Sombra />
      <rect x="10" y="54" width="100" height="22" rx="11" fill="#D65A45" />
      <rect x="24" y="44" width="72" height="42" rx="20" fill="#E8A44C" />
      <g stroke="#C47F2C" strokeWidth="3.5" strokeLinecap="round"><path d="M40 46l-8 38" /><path d="M58 45l-8 40" /><path d="M76 45l-8 40" /><path d="M92 50l-5 30" /></g>
      <rect x="30" y="50" width="56" height="6" rx="3" fill="#fff" opacity=".25" />
    </>
  ),
  'misto-quente': () => (
    <>
      <Sombra />
      <rect x="18" y="74" width="84" height="20" rx="10" fill="#E3A04D" />
      <path d="M18 70h84v4c0 3-4 3-6 6s-3 8-6 8-3-6-6-8-8 4-12 2-2-6-6-6-6 8-10 6-2-6-6-6-6 4-8 2-4-5-8-5-6 2-6 0z" fill="#FFD24A" />
      <rect x="16" y="60" width="88" height="12" rx="6" fill="#F08E8A" />
      <path d="M22 60c0-18 14-28 38-28s38 10 38 28z" fill="#EDAE58" />
      <g stroke="#B9732B" strokeWidth="3.5" strokeLinecap="round" opacity=".8"><path d="M38 40l-6 16" /><path d="M54 35l-6 21" /><path d="M70 35l-6 21" /><path d="M86 42l-5 14" /></g>
    </>
  ),
  'sanduiche-natural': () => (
    <>
      <Sombra />
      <rect x="18" y="80" width="84" height="16" rx="8" fill="#B98552" />
      <path d="M16 78c6-6 10 4 16-2s10 4 16-2 10 4 16-2 10 4 16-2 10 4 16-2v6H16z" fill="#78B84A" />
      <rect x="18" y="66" width="84" height="8" rx="4" fill="#F28C2B" />
      <rect x="18" y="58" width="84" height="9" rx="4.5" fill="#FBEFD9" />
      <path d="M20 58c0-16 16-26 40-26s40 10 40 26z" fill="#C49461" />
      <g fill="#8A5E33"><circle cx="44" cy="44" r="1.6" /><circle cx="60" cy="40" r="1.6" /><circle cx="76" cy="46" r="1.6" /><circle cx="52" cy="50" r="1.4" /><circle cx="70" cy="52" r="1.4" /></g>
    </>
  ),
  tapioca: () => (
    <>
      <Sombra />
      <path d="M14 86a46 46 0 0 1 92 0z" fill="#FFF8EC" stroke="#EAD8B8" strokeWidth="3" />
      <path d="M20 86c10-8 70-8 80 0z" fill="#FFD866" />
      <g fill="#E8C98E"><circle cx="40" cy="60" r="3" /><circle cx="62" cy="52" r="2.4" /><circle cx="80" cy="64" r="3" /><circle cx="54" cy="70" r="2" /><circle cx="72" cy="74" r="1.8" /></g>
    </>
  ),
  pastel: () => (
    <>
      <Sombra />
      <rect x="14" y="40" width="92" height="56" rx="14" fill="#EFB056" />
      <rect x="21" y="47" width="78" height="42" rx="9" fill="none" stroke="#CF8C33" strokeWidth="3" strokeDasharray="1 6" strokeLinecap="round" />
      <g fill="#F8CF86"><circle cx="40" cy="62" r="4" /><circle cx="64" cy="70" r="3" /><circle cx="82" cy="60" r="3.6" /><circle cx="52" cy="78" r="2.4" /></g>
    </>
  ),
  empada: () => (
    <>
      <Sombra />
      <path d="M28 62h64l-8 38H36z" fill="#D69443" />
      <g stroke="#B9772E" strokeWidth="3"><path d="M40 64l3 34" /><path d="M52 64l1 35" /><path d="M68 64l-1 35" /><path d="M80 64l-3 34" /></g>
      <ellipse cx="60" cy="60" rx="35" ry="15" fill="#F0BA62" />
      <ellipse cx="60" cy="58" rx="12" ry="5" fill="#E09A3E" />
    </>
  ),
  'bolo-de-pote': () => (
    <>
      <Sombra />
      <rect x="32" y="34" width="56" height="70" rx="12" fill="#FFF" opacity=".7" stroke="#E6D4C4" strokeWidth="2" />
      <rect x="37" y="86" width="46" height="13" rx="6" fill="#6B3A20" />
      <rect x="37" y="74" width="46" height="12" fill="#8E4E2A" />
      <rect x="37" y="62" width="46" height="12" fill="#6B3A20" />
      <rect x="37" y="50" width="46" height="12" fill="#9A5A33" />
      <g fill="#F7E3C8"><circle cx="46" cy="52" r="1.6" /><circle cx="58" cy="54" r="1.6" /><circle cx="72" cy="52" r="1.6" /></g>
      <rect x="29" y="24" width="62" height="14" rx="6" fill="#F93209" />
      <rect x="36" y="28" width="20" height="4" rx="2" fill="#fff" opacity=".4" />
    </>
  ),
  brownie: () => (
    <>
      <Sombra />
      <path d="M18 56l42-18 42 18-42 18z" fill="#6E3C22" />
      <path d="M18 56l42 18v26L18 82z" fill="#47230F" />
      <path d="M102 56L60 74v26l42-18z" fill="#5A2E17" />
      <g stroke="#9A6340" strokeWidth="2.5" strokeLinecap="round" fill="none"><path d="M40 52l10 4 6-5" /><path d="M62 46l8 6 10-2" /><path d="M50 62l10-2 8 4" /></g>
    </>
  ),
  'red-bull': () => <Lata corpo="#2C4D9C" faixa="#D3D9E4" detalhe="#2C4D9C" largura={34} altura={78} />,
  'monster': () => <Lata corpo="#1F2429" faixa="#8BD13D" detalhe="#1F2429" largura={42} altura={86} />,
  'coca-cola': () => <Lata corpo="#D8261E" faixa="#D8261E" detalhe="#FFFFFF" />,
  'guarana': () => <Lata corpo="#23863A" faixa="#FFFFFF" detalhe="#F2C230" />,
  'agua': () => <Garrafa liquido="#CFE8F6" tampa="#2F7FD0" rotulo="#FFFFFF" />,
  'agua-com-gas': () => <Garrafa liquido="#CFE8F6" tampa="#2E9E5B" rotulo="#E3F4EA" bolhas />,
  'gatorade': () => <Garrafa liquido="#FF8A1F" tampa="#2A1610" rotulo="#FFFFFF" />,
  'suco-caixinha': () => (
    <>
      <Sombra />
      <path d="M72 36l14-8v62l-14 10z" fill="#5E2A82" />
      <path d="M36 36l14-8h36l-14 8z" fill="#9C5CC4" />
      <rect x="36" y="36" width="36" height="64" fill="#7C3FA6" />
      <g fill="#C79BE3"><circle cx="50" cy="66" r="4" /><circle cx="58" cy="66" r="4" /><circle cx="54" cy="73" r="4" /><circle cx="46" cy="73" r="4" /><circle cx="62" cy="73" r="4" /><circle cx="54" cy="80" r="4" /></g>
      <path d="M57 60c2-4 6-5 9-4" stroke="#6FA84B" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M66 32V14l8-6" stroke="#F93209" strokeWidth="4" fill="none" strokeLinecap="round" />
    </>
  ),
}

export function IlustracaoDoItem({ imagem, className }: { imagem: string; className?: string }) {
  const Desenho = ILUSTRACOES[imagem] ?? ILUSTRACOES.coxinha
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-hidden="true">
      <Desenho />
    </svg>
  )
}
