// ETFs: o app trata como "cotas" (não "ações") e mostra o setor como "ETF · <setor>".
import { ehTesouro, titulos } from './tesouro.js';
import { numero } from './formato.js';

export const tickersEtf = (mercado = []) => new Set(mercado.filter((e) => e.tipo === 'etf').map((e) => e.ticker));
// BDR: códigos terminados em 31 a 39 (AAPL34, XPBR31...). Nenhuma ação brasileira termina assim.
export const ehBdr = (ticker) => /[A-Z]3[1-9]$/.test(ticker ?? '');
export const unidade = (ehEtf, n = 2, ticker = '') => (ehEtf ? (n === 1 ? 'cota' : 'cotas')
  : ehBdr(ticker) ? (n === 1 ? 'BDR' : 'BDRs') : (n === 1 ? 'ação' : 'ações'));
export const setorExibido = (setor, ehEtf, ticker = '') => (ehEtf ? `ETF · ${setor || 'outros'}` : ehBdr(ticker) ? `BDR · ${setor || 'outros'}` : setor || 'Outros');

/** "100 ações", "3 cotas" ou, no Tesouro, "0,25 título" (a quantidade do Tesouro é em centésimos) */
export const quantidadeAtivo = (ticker, q, ehEtf = false) =>
  (ehTesouro(ticker) ? titulos(q) : `${numero(q)} ${unidade(ehEtf, Number(q), ticker)}`);
/** preço como o aluno vê: por ação/cota ou, no Tesouro, por título */
export const precoAtivo = (ticker, preco) => (ehTesouro(ticker) ? Math.round(Number(preco) * 10000) / 100 : Number(preco));
