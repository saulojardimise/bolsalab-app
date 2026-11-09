// ETFs: o app trata como "cotas" (não "ações") e mostra o setor como "ETF · <setor>".
export const tickersEtf = (mercado = []) => new Set(mercado.filter((e) => e.tipo === 'etf').map((e) => e.ticker));
export const unidade = (ehEtf, n = 2) => (ehEtf ? (n === 1 ? 'cota' : 'cotas') : (n === 1 ? 'ação' : 'ações'));
export const setorExibido = (setor, ehEtf) => (ehEtf ? `ETF · ${setor || 'outros'}` : setor || 'Outros');
