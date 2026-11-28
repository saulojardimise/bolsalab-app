// Medalhas de conquista: desenhadas aqui (não são emoji), legíveis de 16px a 72px.

export const CONQUISTAS = [
  { codigo: 'lider', nome: 'Líder', regra: '1º lugar do ranking geral: a maior rentabilidade do BolsaLab.' },
  { codigo: 'natal', nome: 'Desafio de Natal', regra: 'Está participando do Desafio de Natal.' },
  { codigo: 'desafiante', nome: 'Desafiante 2027', regra: 'Faz parte de uma equipe aprovada no Desafio Carteira Recomendada 2027.' },
  { codigo: 'cdi', nome: 'Acima do CDI', regra: 'Rendeu mais que o CDI desde que entrou no BolsaLab.' },
  { codigo: 'arrojado', nome: 'Arrojado', regra: 'Tem minicontrato (Mini Ibovespa ou Mini dólar) na carteira.' },
  { codigo: 'constante', nome: 'Constante', regra: 'Entrou no app em pelo menos 3 dias nos últimos 7.' },
];
const POR_CODIGO = Object.fromEntries(CONQUISTAS.map((c) => [c.codigo, c]));
const ORDEM = CONQUISTAS.map((c) => c.codigo);
export const ordenar = (lista) => [...(lista ?? [])].filter((c) => POR_CODIGO[c]).sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b));

const ARO = <circle r="37" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="1.5" />;
const DESENHOS = {
  lider: (
    <>
      <circle r="44" fill="#E8A317" />{ARO}
      <polygon points="-22,8 -26,-16 -11,-4 0,-22 11,-4 26,-16 22,8" fill="#fff" />
      <rect x="-22" y="12" width="44" height="7" rx="2" fill="#fff" />
      <circle cx="0" cy="-2" r="3" fill="#E8A317" />
    </>
  ),
  natal: (
    <>
      <circle r="44" fill="#D63C3C" />{ARO}
      <circle cx="0" cy="4" r="14" fill="#F6D2B5" />
      <path d="M-16,4 Q-16,27 0,29 Q16,27 16,4 Q8,13 0,13 Q-8,13 -16,4Z" fill="#fff" />
      <path d="M-9,13 Q-4,9 0,12 Q4,9 9,13 Q4,16 0,14 Q-4,16 -9,13Z" fill="#fff" />
      <circle cx="0" cy="8" r="2.6" fill="#E88C7A" />
      <circle cx="-5" cy="2" r="1.7" fill="#3A2A20" /><circle cx="5" cy="2" r="1.7" fill="#3A2A20" />
      <path d="M-15,-7 L15,-7 L6,-30 Z" fill="#9E1C1C" />
      <rect x="-18" y="-11" width="36" height="7" rx="3.5" fill="#fff" />
      <circle cx="6" cy="-31" r="4.5" fill="#fff" />
    </>
  ),
  arrojado: (
    <>
      <circle r="44" fill="#EE6A1E" />{ARO}
      <polygon points="5,-27 -13,4 -1,4 -6,27 13,-6 1,-6" fill="#fff" />
    </>
  ),
  cdi: (
    <>
      <circle r="44" fill="#1FA874" />{ARO}
      <path d="M-14,-22 L14,-22 L14,-8 C14,4 7,10 0,10 C-7,10 -14,4 -14,-8Z" fill="#fff" />
      <path d="M-14,-17 C-24,-17 -24,-2 -12,0" fill="none" stroke="#fff" strokeWidth="3.5" />
      <path d="M14,-17 C24,-17 24,-2 12,0" fill="none" stroke="#fff" strokeWidth="3.5" />
      <rect x="-3" y="9" width="6" height="9" fill="#fff" />
      <rect x="-12" y="17" width="24" height="6" rx="2" fill="#fff" />
      <text x="0" y="-8" textAnchor="middle" fill="#1FA874" fontSize="11" fontWeight="800" fontFamily="inherit">CDI</text>
    </>
  ),
  constante: (
    <>
      <circle r="44" fill="#2F6FDB" />{ARO}
      <path d="M0,-27 C10,-15 18,-7 16,8 C14,20 7,26 0,26 C-7,26 -14,20 -16,8 C-17,-2 -10,-8 -8,-17 C-4,-9 -2,-7 0,-5 C2,-13 1,-21 0,-27Z" fill="#fff" />
      <path d="M0,4 C5,10 7,14 6,18 C5,22 2,24 0,24 C-2,24 -5,22 -6,18 C-7,14 -4,10 0,4Z" fill="#2F6FDB" />
    </>
  ),
  desafiante: (
    <>
      <circle r="44" fill="#062344" />
      <circle r="37" fill="none" stroke="#3DDCAA" strokeOpacity=".7" strokeWidth="1.5" />
      <path d="M0,-26 L20,-18 L20,1 C20,15 10,23 0,28 C-10,23 -20,15 -20,1 L-20,-18Z" fill="#3DDCAA" />
      <text x="0" y="9" textAnchor="middle" fill="#062344" fontSize="16" fontWeight="800" fontFamily="inherit">27</text>
    </>
  ),
};

export default function Medalha({ codigo, tamanho = 20, apagada = false, rotulo = true }) {
  const c = POR_CODIGO[codigo];
  if (!c) return null;
  return (
    <svg className={`medalha${apagada ? ' medalha-apagada' : ''}`} width={tamanho} height={tamanho} viewBox="-45 -45 90 90"
         role={rotulo ? 'img' : undefined} aria-hidden={rotulo ? undefined : true} aria-label={rotulo ? c.nome : undefined}>
      {rotulo && <title>{c.nome}</title>}
      {DESENHOS[codigo]}
    </svg>
  );
}

// Fileira pequena ao lado do nome: até 3 medalhas e "+N".
export function Medalhas({ lista, tamanho = 18, maximo = 3 }) {
  const todas = ordenar(lista);
  if (!todas.length) return null;
  const vistas = todas.slice(0, maximo);
  return (
    <span className="medalhas" aria-label={`Conquistas: ${todas.map((c) => POR_CODIGO[c].nome).join(', ')}`}>
      {vistas.map((c) => <Medalha key={c} codigo={c} tamanho={tamanho} rotulo={false} />)}
      {todas.length > maximo && <small className="medalhas-mais">+{todas.length - maximo}</small>}
    </span>
  );
}
