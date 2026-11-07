import { useState } from 'react';

// "Por que você está fazendo esta operação?" — opcional, aparece na comunidade
export default function CampoTese({ valor, aoMudar, id }) {
  const [aberto, setAberto] = useState(Boolean(valor));
  if (!aberto) {
    return (
      <button type="button" className="link campo-tese-abrir" onClick={() => setAberto(true)}>
        + Contar por que (aparece na Comunidade)
      </button>
    );
  }
  return (
    <label className="campo campo-tese" htmlFor={id}>
      <span>Por que você está fazendo esta operação? <small className="suave">(opcional)</small></span>
      <textarea id={id} rows={2} maxLength={280} value={valor} onChange={(e) => aoMudar(e.target.value)}
                placeholder="Ex.: o petróleo subiu e a empresa paga bons dividendos." />
      <small className="suave campo-tese-conta">{valor.length}/280 · seus colegas veem na Comunidade</small>
    </label>
  );
}

/** Grava a tese depois da ordem; se falhar, a ordem continua valendo. */
export async function gravarTese(api, origem, ordem, tese) {
  if (!tese?.trim() || !ordem?.id) return;
  try { await api.definirTese(origem, ordem.id, tese); } catch { /* a tese é opcional */ }
}
