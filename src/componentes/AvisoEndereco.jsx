import { useState } from 'react';
import { api } from '../api/index.js';
import Icone from './Icone.jsx';

// Aviso da mudança de endereço (saulojardimise.github.io/bolsalab -> bolsalab.app).
// Aparece no Início até 08/12/2026 ou até o aluno fechar.
export const AVISO_ENDERECO = 'endereco-bolsalab-app';
const ATE = '2026-12-08';
const hojeBR = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const chave = (uid) => `bolsalab:aviso:${AVISO_ENDERECO}:${uid}`;

export default function AvisoEndereco({ perfil }) {
  const [fechado, setFechado] = useState(() => {
    if (hojeBR() > ATE || perfil.avisos_vistos?.includes(AVISO_ENDERECO)) return true;
    try { return Boolean(localStorage.getItem(chave(perfil.user_id))); } catch { return false; }
  });
  if (fechado) return null;

  const fechar = () => {
    setFechado(true);
    try { localStorage.setItem(chave(perfil.user_id), '1'); } catch { /* sem armazenamento */ }
    api.marcarAvisoVisto?.(AVISO_ENDERECO).catch(() => {});
  };

  return (
    <section className="cartao aviso-endereco" aria-labelledby="titulo-endereco">
      <div>
        <h2 id="titulo-endereco">O BolsaLab tem endereço novo: <strong>bolsalab.app</strong></h2>
        <p>
          O link antigo continua funcionando e traz você para cá. Se você instalou o app na tela inicial do celular,
          apague o ícone antigo e instale de novo por <strong>bolsalab.app</strong> (no navegador:
          Compartilhar → Adicionar à Tela de Início, ou menu ⋮ → Instalar app).
        </p>
      </div>
      <button className="botao-icone" onClick={fechar} aria-label="Fechar aviso"><Icone nome="fechar" /></button>
    </section>
  );
}
