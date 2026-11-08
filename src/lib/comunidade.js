// Comunidade: textos e contas das publicações (operações dos alunos).
import { numero, reais } from './formato.js';
import { pontos } from './futuros.js';

export const REACOES = [
  { id: 'curtir', emoji: '👍', rotulo: 'Curtir' },
  { id: 'palmas', emoji: '👏', rotulo: 'Palmas' },
  { id: 'risada', emoji: '😂', rotulo: 'Risada' },
  { id: 'surpresa', emoji: '😮', rotulo: 'Surpresa' },
  { id: 'duvida', emoji: '🤔', rotulo: 'Dúvida' },
];

const VERBOS = {
  compra: 'comprou',
  venda: 'vendeu',
  venda_descoberto: 'vendeu a descoberto',
  recompra: 'recomprou',
};

/** Ganha quando o preço sobe? (compra e recompra) */
export const apostaNaAlta = (lado) => lado === 'compra' || lado === 'recompra';

/** Preço no formato do ativo: R$ 30,00 (ação) ou 131.005 pts (minicontrato) */
export function precoPublicacao(p, valor = p.preco) {
  return p.origem === 'futuro' ? `${pontos(valor, p.base)} pts` : reais(valor);
}

/** Partes da frase, para destacar o ativo: { antes: 'comprou 100', ativo: 'PETR4', depois: 'a R$ 30,00' } */
export function partesOperacao(p) {
  const unidade = p.origem === 'futuro' ? (Number(p.quantidade) === 1 ? ' contrato' : ' contratos') : '';
  return { antes: `${VERBOS[p.lado] ?? p.lado} ${numero(p.quantidade)}${unidade}`, ativo: p.ativo, depois: `a ${precoPublicacao(p)}` };
}

/** "comprou 100 PETR4 a R$ 30,00" */
export function fraseOperacao(p) {
  const { antes, ativo, depois } = partesOperacao(p);
  return `${antes} ${ativo} ${depois}`;
}

/**
 * Quanto o preço andou desde a operação, a favor de quem operou:
 * compra ganha se subiu; venda e venda a descoberto ganham se caiu.
 * null quando não há preço de agora.
 */
export function desdeOperacao(p) {
  const atual = Number(p.preco_atual);
  const preco = Number(p.preco);
  if (!atual || !preco) return null;
  const mudou = (atual / preco - 1) * 100;
  return Math.round((apostaNaAlta(p.lado) ? mudou : -mudou) * 100) / 100;
}

/** Total de reações e as mais usadas primeiro: [{ id, emoji, n }] */
export function resumoReacoes(reacoes = {}) {
  const lista = REACOES.map((r) => ({ ...r, n: Number(reacoes?.[r.id] ?? 0) })).filter((r) => r.n > 0)
    .sort((a, b) => b.n - a.n);
  return { total: lista.reduce((s, r) => s + r.n, 0), lista };
}

/** Primeiro nome e inicial do sobrenome: "Bruno L." */
export function nomeCurto(nome) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (!partes.length) return 'Aluno';
  return partes.length > 1 ? `${partes[0]} ${partes.at(-1)[0]}.` : partes[0];
}
