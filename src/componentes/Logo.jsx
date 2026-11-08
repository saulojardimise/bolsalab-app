import { useState } from 'react';
import { ICONES_ETF, IconeEtf } from '../lib/iconesEtf.jsx';

// Logo da empresa (vem da brapi). Alguns ETFs têm ícone próprio, desenhado no app.
// Sem logo, ou se a imagem falhar, mostra a sigla.
export default function Logo({ ticker, url, tamanho = 40 }) {
  const [falhou, setFalhou] = useState(false);
  const estilo = { width: tamanho, height: tamanho };
  if (ICONES_ETF[ticker]) {
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
