import { useEffect, useState } from 'react';
import Icone from './Icone.jsx';

// Tela de "sem internet": aparece quando o app não consegue carregar.
// Tenta de novo sozinho assim que o aparelho volta a ficar online.
export default function SemConexao({ aoTentar }) {
  const [tentando, setTentando] = useState(false);

  useEffect(() => {
    const voltou = () => aoTentar();
    window.addEventListener('online', voltou);
    return () => window.removeEventListener('online', voltou);
  }, [aoTentar]);

  async function tentar() {
    setTentando(true);
    try { await aoTentar(); } finally { setTentando(false); }
  }

  return (
    <main className="carregando-tela">
      <div className="sem-conexao" role="alert">
        <span className="sem-conexao-icone" aria-hidden="true"><Icone nome="semrede" tamanho={44} /></span>
        <h1>Sem conexão</h1>
        <p>Não conseguimos falar com o BolsaLab. Confira o Wi-Fi ou os dados móveis.</p>
        <p className="suave">Assim que a internet voltar, o app carrega sozinho.</p>
        <button className="botao botao-principal" onClick={tentar} disabled={tentando}>
          {tentando ? 'Tentando…' : 'Tentar de novo'}
        </button>
      </div>
    </main>
  );
}

// Faixa no topo quando a conexão cai com o app já aberto.
export function AvisoOffline() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const cai = () => setOffline(true);
    const volta = () => setOffline(false);
    window.addEventListener('offline', cai);
    window.addEventListener('online', volta);
    return () => { window.removeEventListener('offline', cai); window.removeEventListener('online', volta); };
  }, []);
  if (!offline) return null;
  return (
    <p className="faixa-offline" role="status">
      <Icone nome="semrede" tamanho={16} />Sem internet. Você está vendo os últimos dados carregados.
    </p>
  );
}
