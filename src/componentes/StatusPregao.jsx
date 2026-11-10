import { textoStatus } from '../lib/pregao.js';

// Etiqueta que diz se o aluno pode negociar agora e até quando.
export default function StatusPregao({ liberada, pausada, demo, feriados, abre, fecha }) {
  const s = textoStatus({ liberada, pausada, demo, feriados, abre, fecha });
  return (
    <p className={`status ${s.aberto ? 'status-aberto' : 'status-fechado'}`} role="status">
      <span className="status-sinal" aria-hidden="true" />
      <span><strong>{s.titulo}.</strong> {s.detalhe}</span>
    </p>
  );
}
