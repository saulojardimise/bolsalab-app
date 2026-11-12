import { useState } from 'react';
import { temIconeEtf, IconeEtf } from '../lib/iconesEtf.jsx';
import { ehTesouro } from '../lib/tesouro.js';

// título do Tesouro: cor e rótulo pelo indexador
const TESOURO = { SELIC: ['#1F8A5B', 'SELIC', 9], PRE: ['#2563B8', 'PRÉ', 11], IPCA: ['#C27A12', 'IPCA+', 9] };

// Logo da empresa (vem da brapi). Alguns ETFs têm ícone próprio, desenhado no app.
// Sem logo, ou se a imagem falhar, mostra a sigla.
export default function Logo({ ticker, url, tamanho = 40 }) {
  const [falhou, setFalhou] = useState(false);
  const estilo = { width: tamanho, height: tamanho };
  if (ehTesouro(ticker)) {
    const [cor, rotulo, fonte] = TESOURO[ticker.match(/^[A-Z]+/)[0]];
    return (
      <span className="logo logo-etf" style={estilo} aria-hidden="true">
        <svg viewBox="0 0 40 40" width="100%" height="100%" focusable="false">
          <rect width="40" height="40" fill={cor} />
          <path d="M9 12.5h22M9 12.5l11-5 11 5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinejoin="round" />
          <text x="20" y="25.5" textAnchor="middle" fontSize={fonte} fontWeight="800" fill="#fff" fontFamily="system-ui, sans-serif">{rotulo}</text>
          <path d="M9 30.5h22" stroke="#fff" strokeWidth="1.6" />
        </svg>
      </span>
    );
  }
  if (temIconeEtf(ticker)) {
    return (
      <span className="logo logo-etf" style={estilo}>
        <IconeEtf ticker={ticker} />
      </span>
    );
  }
  if (url && !falhou) {
    return (
      <span className="logo" style={estilo}>
        <img src={url} alt="" loading="lazy" onError={() => setFalhou(true)} />
      </span>
    );
  }
  return (
    <span className="logo logo-sigla" style={{ ...estilo, fontSize: tamanho * 0.32 }} aria-hidden="true">
      {ticker.slice(0, 2)}
    </span>
  );
}
