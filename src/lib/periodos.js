import { diasAtras } from './formato.js';

// Períodos dos gráficos. Guardamos um preço por dia (fechamento), então não há "1D".
// 6M e 1A só aparecem quando a série já cobre esse tempo (o histórico cresce um dia por pregão).
export const PERIODOS = [
  { id: '1S', rotulo: '1S', dias: 7 },
  { id: '1M', rotulo: '1M', dias: 31 },
  { id: '3M', rotulo: '3M', dias: 92 },
  { id: '6M', rotulo: '6M', dias: 183, sob: true },
  { id: '1A', rotulo: '1A', dias: 366, sob: true },
  { id: 'TUDO', rotulo: 'Tudo', dias: null },
];

/** Períodos a mostrar para uma série que começa em `desde` ('AAAA-MM-DD'). */
export function periodosDisponiveis(desde) {
  return PERIODOS.filter((p) => !p.sob || (desde && desde <= diasAtras(p.dias - 3)));
}

/** Filtra uma série [{data:'AAAA-MM-DD', ...}] pelo período escolhido. */
export function noPeriodo(serie, periodoId) {
  const p = PERIODOS.find((x) => x.id === periodoId);
  if (!p?.dias) return serie;
  const desde = diasAtras(p.dias);
  return serie.filter((x) => x.data >= desde);
}

/** Variação % entre o primeiro e o último ponto. */
export function variacaoSerie(serie, campo = 'valor') {
  if (serie.length < 2) return 0;
  const a = Number(serie[0][campo]);
  const b = Number(serie.at(-1)[campo]);
  return a > 0 ? (b / a - 1) * 100 : 0;
}
