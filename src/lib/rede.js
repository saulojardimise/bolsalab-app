// Erros de rede (sem internet, servidor fora do ar) viram uma mensagem clara.
export const SEM_CONEXAO = 'Sem conexão com a internet. Confira o Wi-Fi ou os dados móveis e tente de novo.';

export function ehErroDeRede(e) {
  const m = String(e?.message ?? e ?? '');
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  return /Load failed|Failed to fetch|NetworkError|Network request failed|network error|fetch failed|ERR_INTERNET|ERR_NETWORK|timed? ?out/i.test(m);
}

export function traduzirErro(e) {
  if (ehErroDeRede(e)) {
    const n = new Error(SEM_CONEXAO);
    n.semConexao = true;
    return n;
  }
  return e instanceof Error ? e : new Error(String(e?.message ?? e));
}

// Envolve cada função da API: qualquer erro de rede chega às telas já traduzido.
export function comErrosTraduzidos(api) {
  return new Proxy(api, {
    get(alvo, chave) {
      const v = alvo[chave];
      if (typeof v !== 'function') return v;
      return (...args) => {
        try {
          const r = v.apply(alvo, args);
          return r && typeof r.then === 'function' ? r.catch((e) => { throw traduzirErro(e); }) : r;
        } catch (e) { throw traduzirErro(e); }
      };
    },
  });
}
