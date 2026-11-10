// Atualização obrigatória.
// Muitos alunos deixam o app aberto por dias (aba esquecida, app instalado que nunca é fechado)
// e ficam presos numa versão antiga. Aqui:
//  1. o service worker procura versão nova a cada 5 minutos e sempre que o app volta para a tela;
//  2. o app compara a sua versão com a publicada (versao.json, sempre lida da rede).
//     Se estiver velho e o app estava em segundo plano, recarrega na hora;
//     se estiver na tela, avisa (tela bloqueante "Atualizar agora").
/* global __VERSAO__ */
export const VERSAO = typeof __VERSAO__ === 'string' ? __VERSAO__ : '';
const URL_VERSAO = `${import.meta.env.BASE_URL}versao.json`;
const INTERVALO = 5 * 60 * 1000;
const ouvintes = new Set();
let pendente = null;          // versão nova encontrada

/** avisa quando há versão nova (devolve a função que para de ouvir) */
export function aoTerVersaoNova(f) {
  ouvintes.add(f);
  if (pendente) f(pendente);
  return () => ouvintes.delete(f);
}

async function versaoPublicada() {
  const r = await fetch(`${URL_VERSAO}?t=${Date.now()}`, { cache: 'no-store' });
  if (!r.ok) return null;
  return (await r.json())?.versao ?? null;
}

/** apaga o service worker e o cache e abre a versão nova */
export async function atualizarAgora(versao = pendente) {
  // evita ficar recarregando sem parar se o servidor ainda entrega a versão antiga
  const chave = `bolsalab:atualizando:${versao}`;
  try {
    const n = Number(sessionStorage.getItem(chave) || 0);
    if (n >= 2) { pendente = null; return; }
    sessionStorage.setItem(chave, String(n + 1));
  } catch { /* sem armazenamento */ }
  try {
    const regs = (await navigator.serviceWorker?.getRegistrations?.()) ?? [];
    await Promise.all(regs.map((r) => r.unregister()));
    const nomes = (await globalThis.caches?.keys?.()) ?? [];
    await Promise.all(nomes.map((n) => caches.delete(n)));
  } catch { /* segue para o recarregamento */ }
  const url = new URL(location.href);
  url.searchParams.set('v', String(versao || Date.now()).replace(/\D/g, ''));
  location.replace(url.toString());
}

let checando = false;
export async function checarVersao({ emSegundoPlano = false } = {}) {
  if (!VERSAO || checando || !navigator.onLine) return;
  checando = true;
  try {
    const publicada = await versaoPublicada();
    if (!publicada || publicada <= VERSAO) return;
    pendente = publicada;
    if (emSegundoPlano) { await atualizarAgora(publicada); return; }
    ouvintes.forEach((f) => f(publicada));
  } catch { /* sem rede: tenta de novo depois */ } finally { checando = false; }
}

/** liga a verificação (chamado uma vez, em main.jsx) */
let registro = null;
export const guardarRegistro = (r) => { registro = r; };
export function vigiarAtualizacoes() {
  if (!VERSAO) return;
  const verificar = (emSegundoPlano) => {
    registro?.update?.().catch(() => {});
    checarVersao({ emSegundoPlano });
  };
  // ao voltar para a tela, o aluno ainda não começou nada: dá para recarregar direto
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') verificar(true); });
  window.addEventListener('online', () => verificar(false));
  setInterval(() => verificar(document.visibilityState !== 'visible'), INTERVALO);
  verificar(true);
  // tira o ?v= do endereço depois de atualizar
  try {
    const url = new URL(location.href);
    if (url.searchParams.has('v')) { url.searchParams.delete('v'); history.replaceState(history.state, '', url.toString()); }
  } catch { /* nada */ }
}
