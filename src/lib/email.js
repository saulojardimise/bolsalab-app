// Pega erros de digitação no domínio do e-mail (ex.: "gamil.com" -> "gmail.com")
// e confere se o domínio existe (consulta DNS pública, no navegador).
export const DOMINIOS_COMUNS = [
  'gmail.com', 'hotmail.com', 'hotmail.com.br', 'outlook.com', 'outlook.com.br', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.com.br', 'icloud.com', 'me.com', 'bol.com.br', 'uol.com.br', 'terra.com.br',
  'globo.com', 'ig.com.br', 'protonmail.com', 'proton.me', 'id.uff.br', 'isecensa.edu.br',
];

// distância de edição contando a troca de duas letras vizinhas como 1 erro ("gamil" x "gmail")
export function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const c = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
    }
  }
  return d[a.length][b.length];
}

/** Sugestão de e-mail corrigido, ou null se o domínio parece certo. */
export function sugerirEmail(email) {
  const e = String(email ?? '').trim().toLowerCase();
  const m = e.match(/^([^@\s]+)@([^@\s]+)$/);
  if (!m) return null;
  const [, usuario, dominio] = m;
  if (DOMINIOS_COMUNS.includes(dominio)) return null;
  let melhor = null; let menor = Infinity;
  for (const d of DOMINIOS_COMUNS) {
    const dist = distancia(dominio, d);
    if (dist < menor) { menor = dist; melhor = d; }
  }
  const limite = dominio.length >= 8 ? 2 : 1;
  return menor > 0 && menor <= limite ? `${usuario}@${melhor}` : null;
}

/** O domínio existe e recebe e-mail? true / false / null (não deu para saber). */
export async function dominioExiste(email, espera = 3500) {
  const dominio = String(email ?? '').trim().toLowerCase().split('@')[1];
  if (!dominio || DOMINIOS_COMUNS.includes(dominio)) return true;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), espera);
  try {
    const r = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=MX`, { signal: ctrl.signal });
    if (!r.ok) return null;
    const j = await r.json();
    if (j.Status === 3) return false;                       // o domínio não existe
    if (j.Status !== 0) return null;
    if (j.Answer?.some((a) => a.type === 15)) return true;   // tem servidor de e-mail
    const a = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(dominio)}&type=A`, { signal: ctrl.signal }).then((x) => x.json());
    return a.Status === 0 && Boolean(a.Answer?.length);      // sem MX, aceita se ao menos existir
  } catch { return null; } finally { clearTimeout(t); }
}
