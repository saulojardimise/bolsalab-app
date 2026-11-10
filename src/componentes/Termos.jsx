import { useEffect, useRef } from 'react';
import Icone from './Icone.jsx';
import { TERMOS, TERMOS_DATA, TERMOS_VERSAO } from '../lib/termos.js';

// Termos de Uso e Política de Privacidade, numa folha que sobe por cima da tela.
export default function Termos({ aoFechar, aoAceitar }) {
  const dialogo = useRef(null);
  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    return () => d.close();
  }, []);

  return (
    <dialog ref={dialogo} className="folha folha-alta termos" aria-labelledby="titulo-termos"
            onCancel={(e) => { e.preventDefault(); aoFechar(); }}>
      <div className="termos-topo">
        <h2 id="titulo-termos">Termos de Uso e Política de Privacidade</h2>
        <button className="botao-icone" onClick={aoFechar} aria-label="Fechar"><Icone nome="fechar" /></button>
      </div>
      <div className="termos-texto">
        <p className="suave">Versão {TERMOS_VERSAO} · {TERMOS_DATA}</p>
        {TERMOS.map((s) => (
          <section key={s.titulo}>
            <h3>{s.titulo}</h3>
            {s.texto?.map((t) => <p key={t}>{t}</p>)}
            {s.itens && <ul>{s.itens.map((t) => <li key={t}>{t}</li>)}</ul>}
            {s.texto2?.map((t) => <p key={t}>{t}</p>)}
          </section>
        ))}
      </div>
      <div className="termos-rodape">
        {aoAceitar
          ? <button className="botao botao-principal" onClick={aoAceitar}>Li e aceito</button>
          : <button className="botao" onClick={aoFechar}>Fechar</button>}
      </div>
    </dialog>
  );
}
