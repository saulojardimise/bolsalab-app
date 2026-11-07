import { pct, tendencia } from '../lib/formato.js';
import Termo from './Termo.jsx';

const SERIES = [
  { id: 'aluno', rotulo: 'Você', classe: 'serie-aluno' },
  { id: 'ibov', rotulo: 'Ibovespa', classe: 'serie-ibov', termo: 'ibovespa' },
  { id: 'cdi', rotulo: 'CDI', classe: 'serie-cdi', termo: 'cdi' },
];

// Legenda do gráfico de patrimônio: quanto rendeu você, o Ibovespa e o CDI no período
export default function Comparativo({ comparacao }) {
  const { final } = comparacao;
  const visiveis = SERIES.filter((s) => final[s.id] != null);
  return (
    <div className="comparativo">
      <ul className="comparativo-legenda">
        {visiveis.map((s) => (
          <li key={s.id}>
            <span className={`legenda-traco ${s.classe} ${s.id === 'aluno' && final.aluno < 0 ? 'serie-aluno-baixa' : ''}`} aria-hidden="true" />
            <span>{s.termo ? <Termo id={s.termo}>{s.rotulo}</Termo> : s.rotulo}</span>
            <strong className={`num ${tendencia(final[s.id])}`}>{pct(final[s.id])}</strong>
          </li>
        ))}
      </ul>
      {visiveis.length > 1 && <p className="comparativo-frase">{frase(visiveis, final)}</p>}
    </div>
  );
}

/** Ibovespa e CDI convertidos para reais: quanto valeria o patrimônio do início do período. */
export function extrasComparacao(comparacao, base) {
  if (!comparacao) return [];
  return SERIES.filter((s) => s.id !== 'aluno' && comparacao.final[s.id] != null).map((s) => ({
    id: s.id,
    classe: s.classe,
    valores: comparacao.pontos.map((p) => (p[s.id] == null ? null : base * (1 + p[s.id] / 100))),
  }));
}

// "Você ficou à frente do CDI, mas atrás do Ibovespa." etc.
function frase(visiveis, final) {
  const outros = visiveis.filter((s) => s.id !== 'aluno');
  const atras = outros.filter((s) => final[s.id] > final.aluno).map((s) => s.rotulo);
  const frente = outros.filter((s) => final[s.id] <= final.aluno).map((s) => s.rotulo);
  const e = (l) => l.join(' e do ');
  if (!atras.length) return `Você está à frente do ${e(frente)} no período.`;
  if (!frente.length) return `Você está atrás do ${e(atras)} no período.`;
  return `Você está à frente do ${e(frente)}, mas atrás do ${e(atras)}.`;
}
