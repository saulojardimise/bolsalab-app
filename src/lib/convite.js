// Link de convite para um grupo (QR code de feira, aula etc.): bolsalab.app/?grupo=TOKEN
// O token fica guardado nesta aba até a pessoa criar a conta ou entrar no grupo,
// e sai do endereço para não ficar repetindo.
const CHAVE = 'bolsalab:convite';

export function lerConvite() {
  try {
    const url = new URL(location.href);
    const t = url.searchParams.get('grupo');
    if (t) {
      const limpo = t.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12);
      if (limpo) sessionStorage.setItem(CHAVE, limpo);
      url.searchParams.delete('grupo');
      history.replaceState(history.state, '', url.toString());
    }
    return sessionStorage.getItem(CHAVE) || '';
  } catch { return ''; }
}

export function esquecerConvite() {
  try { sessionStorage.removeItem(CHAVE); } catch { /* sem armazenamento */ }
}

export const linkDeConvite = (token, base = 'https://bolsalab.app/') => `${base}?grupo=${encodeURIComponent(token)}`;
