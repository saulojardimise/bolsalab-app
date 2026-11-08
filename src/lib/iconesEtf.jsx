// Ícones próprios de alguns ETFs (desenhados aqui, sem depender da brapi).
// Cada um é um quadrado 40x40 com fundo colorido e um desenho que lembra o que o fundo compra.

const B = '#FFFFFF';

export const ICONES_ETF = {
  // Ethereum: o losango em duas metades
  EETH11: (
    <>
      <rect width="40" height="40" fill="#5E6FCF" />
      <path d="M20 7l-8 13 8 4.6 8-4.6z" fill={B} />
      <path d="M20 7v17.6l8-4.6z" fill="#DCE1FA" />
      <path d="M12 21.6L20 33l8-11.4-8 4.6z" fill={B} />
      <path d="M20 26.2V33l8-11.4z" fill="#DCE1FA" />
    </>
  ),
  // ouro: barras empilhadas
  GOLD11: (
    <>
      <rect width="40" height="40" fill="#2B2F3A" />
      <path d="M8 30l2.5-7h8l2.5 7z" fill="#F5B82E" />
      <path d="M19 30l2.5-7h8l2.5 7z" fill="#E09A12" />
      <path d="M13.5 22.5l2.5-7h8l2.5 7z" fill="#FFD25A" />
      <path d="M16.5 17.5h7" stroke="#FFF1BF" strokeWidth="1.2" strokeLinecap="round" />
    </>
  ),
  // renda fixa: um título com juros
  // games: controle
  JOGO11: (
    <>
      <rect width="40" height="40" fill="#6D3FC0" />
      <path d="M13 14h14a6 6 0 0 1 5.8 4.6l1.7 7.3a3.3 3.3 0 0 1-5.7 2.9L25.5 25h-11l-3.3 3.8a3.3 3.3 0 0 1-5.7-2.9l1.7-7.3A6 6 0 0 1 13 14z" fill={B} />
      <path d="M13 17.5v5M10.5 20h5" stroke="#6D3FC0" strokeWidth="1.9" strokeLinecap="round" />
      <circle cx="26.5" cy="18.5" r="1.5" fill="#F5B82E" /><circle cx="29" cy="21.5" r="1.5" fill="#3FD2A3" />
    </>
  ),
  // dividendos de empresas brasileiras: bandeira do Brasil
  DIVO11: (
    <>
      <rect width="40" height="40" fill="#009C3B" />
      <path d="M20 6L36 20 20 34 4 20z" fill="#FFDF00" />
      <circle cx="20" cy="20" r="7.6" fill="#002776" />
      <path d="M12.6 18.6c4.8-1.3 10-.6 14.6 1.9" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
    </>
  ),
  // dólar: uma nota com o cifrão
  DOLA11: (
    <>
      <rect width="40" height="40" fill="#E7F3EA" />
      <rect x="5" y="11" width="30" height="18" rx="2.5" fill="#2E7D4F" />
      <rect x="7.5" y="13.5" width="25" height="13" rx="1.5" fill="none" stroke="#BFE3CB" strokeWidth="1" />
      <circle cx="20" cy="20" r="5.6" fill="#BFE3CB" />
      <path d="M22 17.6c-.5-.8-1.3-1.1-2.1-1.1-1.2 0-2 .6-2 1.5 0 2 4.2 1.1 4.2 3.2 0 1-.9 1.6-2.2 1.6-.9 0-1.8-.4-2.3-1.2M20 15.4v9.2" fill="none" stroke="#2E7D4F" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="10.5" cy="20" r="1.4" fill="#BFE3CB" /><circle cx="29.5" cy="20" r="1.4" fill="#BFE3CB" />
    </>
  ),
  // mundo: globo
  WRLD11: (
    <>
      <rect width="40" height="40" fill="#1E5FA8" />
      <circle cx="20" cy="20" r="11" fill="#5BB6F0" />
      <path d="M14 12.5c2 1 1.5 3 3.5 3.5s2 2.5.5 3.5-3.5.5-4.5 2.5.5 4 -.5 5.5c-2-1.5-3.5-4-3.8-6.5 1.2-3.5 2.5-6.5 4.8-8.5zM23.5 10.5c1.5 1.2 4 1 5 3s-1 2.5-2.5 2.5-2 2 -.5 3.5 3.5 1 4.3 2.4c-.6 3.4-2.6 6.2-5.3 7.8-.5-2 .3-3.8-1-5s-3-1.5-2.5-3.5 2.5-1.5 2.5-3.5-2.5-2-2.5-4 .7-2.7 2.5-3.2z" fill="#3FB08C" />
      <circle cx="20" cy="20" r="11" fill="none" stroke={B} strokeWidth="1.5" />
    </>
  ),
};

// Ícones em imagem (enviados pelo professor), em public/etfs/
export const IMAGENS_ETF = {
  BBOI11: 'etfs/bboi11.png',
  BOVA11: 'etfs/bova11.png',
  NASD11: 'etfs/nasd11.png',
  IVVB11: 'etfs/ivvb11.png',
  BITC11: 'etfs/bitc11.png',
  XINA11: 'etfs/xina11.png',
  FIXA11: 'etfs/fixa11.png',
  IMAB11: 'etfs/imab11.png',
  CHIP11: 'etfs/chip11.png',
};

ICONES_ETF.SMAL11 = ICONES_ETF.DIVO11;

export const temIconeEtf = (ticker) => Boolean(IMAGENS_ETF[ticker] || ICONES_ETF[ticker]);

export function IconeEtf({ ticker }) {
  const imagem = IMAGENS_ETF[ticker];
  if (imagem) return <img src={import.meta.env.BASE_URL + imagem} alt="" loading="lazy" />;
  const desenho = ICONES_ETF[ticker];
  if (!desenho) return null;
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" aria-hidden="true" focusable="false">{desenho}</svg>
  );
}
