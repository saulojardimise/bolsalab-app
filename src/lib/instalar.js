// Instalar o BolsaLab como app (ícone na tela de início).
// Android/Chrome e PC (Chrome/Edge): o navegador avisa que dá para instalar (beforeinstallprompt)
// e o app abre a janela de instalação com um toque.
// iPhone/iPad: nenhum site pode abrir a instalação; mostramos o passo a passo
// (Compartilhar > Adicionar à Tela de Início).

let pedido = null;                 // evento guardado para chamar prompt() depois
const ouvintes = new Set();
const avisar = () => ouvintes.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();            // não mostra a barrinha do Chrome; usamos o nosso botão
    pedido = e;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    pedido = null;
    lembrar(CHAVE_INSTALADO, Date.now());
    avisar();
  });
}

export function ouvirInstalacao(f) {
  ouvintes.add(f);
  return () => ouvintes.delete(f);
}

const CHAVE_DEPOIS = 'bolsalab:instalar:depois';
const CHAVE_INSTALADO = 'bolsalab:instalar:feito';
const ESPERA_DIAS = 3;             // "Agora não" volta a perguntar depois de 3 dias

function ler(chave) { try { return localStorage.getItem(chave); } catch { return null; } }
function lembrar(chave, valor) { try { localStorage.setItem(chave, String(valor)); } catch { /* sem armazenamento */ } }

/** Aberto como app instalado (sem a barra do navegador)? */
export function abertoComoApp() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(display-mode: standalone)').matches
    || window.matchMedia?.('(display-mode: fullscreen)').matches
    || window.matchMedia?.('(display-mode: minimal-ui)').matches
    || window.navigator.standalone === true;
}

/** 'ios' | 'android' | 'pc' */
export function plataforma(ua = navigator.userAgent, toques = navigator.maxTouchPoints ?? 0) {
  if (/iPhone|iPad|iPod/i.test(ua) || (/Macintosh/i.test(ua) && toques > 1)) return 'ios';
  if (/Android/i.test(ua)) return 'android';
  return 'pc';
}

/** Navegador de dentro de outro app (Instagram, Facebook, WhatsApp...): não instala. */
export function navegadorDeApp(ua = navigator.userAgent) {
  return /FBAN|FBAV|FB_IAB|Instagram|Line\/|WhatsApp|Twitter|TikTok|musical_ly|Snapchat|GSA\//i.test(ua);
}

export const podeInstalarDireto = () => Boolean(pedido);

/** Abre a janela de instalação do navegador. Devolve true se a pessoa instalou. */
export async function instalar() {
  if (!pedido) return false;
  const e = pedido;
  pedido = null;
  avisar();
  e.prompt();
  const { outcome } = await e.userChoice;
  if (outcome === 'accepted') lembrar(CHAVE_INSTALADO, Date.now());
  return outcome === 'accepted';
}

export function deixarParaDepois() {
  lembrar(CHAVE_DEPOIS, Date.now());
}

/** Mostrar a tela "Instalar app" sozinha? Só no celular, fora do app instalado, e respeitando o "Agora não". */
export function deveSugerirInstalar(agora = Date.now()) {
  if (abertoComoApp()) return false;
  if (ler(CHAVE_INSTALADO)) return false;
  const p = plataforma();
  if (p === 'pc' && !pedido) return false;
  const depois = Number(ler(CHAVE_DEPOIS) || 0);
  return agora - depois > ESPERA_DIAS * 24 * 3600 * 1000;
}

/** Mostrar a opção "Instalar app" no menu? Sempre que não estiver aberto como app. */
export const mostrarOpcaoInstalar = () => !abertoComoApp();
