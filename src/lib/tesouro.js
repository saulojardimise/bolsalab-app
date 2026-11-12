// Tesouro Direto: Tesouro Selic, Prefixado e IPCA+.
// O banco guarda a quantidade em centésimos de título (o mínimo do Tesouro Direto é 0,01 título)
// e o preço de cotacoes é o de um centésimo. Na tela, tudo aparece por título.

export const ehTesouro = (ticker) => /^(SELIC|PRE|IPCA)\d{4}/.test(ticker ?? '');

const dec = (v, casas = 2) => Number(v).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas });

/** 25 -> "0,25 título"; 300 -> "3,00 títulos" */
export function titulos(centesimos) {
  const t = Number(centesimos || 0) / 100;
  return `${dec(t)} ${t < 2 ? 'título' : 'títulos'}`;
}

/** preço de um centésimo -> preço do título inteiro */
export const precoTitulo = (precoCentesimo) => Math.round(Number(precoCentesimo) * 10000) / 100;

/** "Selic + 0,06% a.a.", "14,71% a.a.", "IPCA + 7,83% a.a." */
export function textoTaxa(indexador, taxa) {
  if (taxa == null) return '';
  const t = `${dec(taxa)}% a.a.`;
  if (indexador === 'selic') return `Selic + ${t}`;
  if (indexador === 'ipca') return `IPCA + ${t}`;
  return t;
}

/** Quantos centésimos cabem num valor (compra) */
export const centesimosPorValor = (valor, precoCentesimo) =>
  precoCentesimo > 0 ? Math.floor((Number(valor) || 0) / Number(precoCentesimo) + 1e-9) : 0;

export const INDEXADORES = [
  {
    id: 'selic',
    titulo: 'Tesouro Selic',
    termo: 'tesouro_selic',
    curto: 'Rende a taxa Selic, dia após dia.',
    texto: 'Acompanha a taxa básica de juros (Selic). O preço quase não oscila, por isso é o título usado como reserva de emergência: '
      + 'quem vende antes do vencimento recebe praticamente o que rendeu até ali.',
    risco: 'Baixo. É o investimento mais seguro do país.',
  },
  {
    id: 'prefixado',
    titulo: 'Tesouro Prefixado',
    termo: 'tesouro_prefixado',
    curto: 'Taxa combinada na compra. Paga R$ 1.000 por título no vencimento.',
    texto: 'Você sabe hoje quanto vai receber: R$ 1.000 por título no vencimento. A taxa é fixa, mas o preço muda todo dia com os juros '
      + 'do mercado. Se os juros sobem, o preço cai; se caem, o preço sobe. Quem vende antes do vencimento pode ganhar ou perder.',
    risco: 'Médio, se vender antes do vencimento (marcação a mercado). Levando até o fim, recebe a taxa combinada.',
  },
  {
    id: 'ipca',
    titulo: 'Tesouro IPCA+',
    termo: 'tesouro_ipca',
    curto: 'Rende a inflação mais uma taxa. Protege o poder de compra.',
    texto: 'Paga a inflação (IPCA) mais uma taxa fixa, então o dinheiro nunca perde para a inflação se for levado até o vencimento. '
      + 'Os prazos são longos e o preço oscila bastante com os juros, como no Prefixado.',
    risco: 'Médio a alto, se vender antes do vencimento: quanto mais longo o título, mais o preço oscila.',
  },
];
export const indexador = (id) => INDEXADORES.find((i) => i.id === id);

/** "mar/2029" */
export const mesAno = (iso) => (iso ? new Date(`${iso}T12:00:00Z`)
  .toLocaleDateString('pt-BR', { month: 'short', year: 'numeric', timeZone: 'UTC' }).replace('. de ', '/').replace(' de ', '/').replace('.', '') : '');
