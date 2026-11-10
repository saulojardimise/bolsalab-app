import { useState } from 'react';
import { CURSOS_SUGERIDOS, ESCOLARIDADES, pedeSituacao, pedeUniversidade, SITUACOES, UNIVERSIDADES_SUGERIDAS } from '../lib/termos.js';

// Escolaridade, situação do curso (graduação, mestrado e doutorado) e universidade.
// valor = { escolaridade, situacao, curso, universidade }
export default function CamposEscolaridade({ valor, aoMudar }) {
  const mudar = (campo, v) => aoMudar({ ...valor, [campo]: v });
  return (
    <>
      <label className="campo">
        <span>Escolaridade <small className="suave">(o nível mais alto, concluído ou não)</small></span>
        <select value={valor.escolaridade} required
                onChange={(e) => aoMudar({ ...valor, escolaridade: e.target.value, situacao: pedeSituacao(e.target.value) ? valor.situacao : '' })}>
          <option value="">Escolha</option>
          {ESCOLARIDADES.map(([id, rotulo]) => <option key={id} value={id}>{rotulo}</option>)}
        </select>
      </label>

      {pedeSituacao(valor.escolaridade) && (
        <fieldset className="campo">
          <legend>Situação do curso</legend>
          <div className="chips chips-quebra" role="group">
            {SITUACOES.map(([id, rotulo]) => (
              <button type="button" key={id} aria-pressed={valor.situacao === id} onClick={() => mudar('situacao', id)}>{rotulo}</button>
            ))}
          </div>
        </fieldset>
      )}

      {pedeUniversidade(valor.escolaridade) && (
        <EscolhaOuOutro rotulo="Curso" opcoes={CURSOS_SUGERIDOS} valor={valor.curso ?? ''} aoMudar={(v) => mudar('curso', v)}
                        dica="Qual é o seu curso?" maximo={80} />
      )}
      {pedeUniversidade(valor.escolaridade) && (
        <EscolhaOuOutro rotulo="Universidade ou faculdade" opcoes={UNIVERSIDADES_SUGERIDAS} valor={valor.universidade ?? ''}
                        aoMudar={(v) => mudar('universidade', v)} dica="Qual é a sua universidade ou faculdade?" maximo={120} />
      )}
    </>
  );
}

// Lista de opções com "Outro" no fim: escolhendo "Outro", aparece um campo para escrever.
function EscolhaOuOutro({ rotulo, opcoes, valor, aoMudar, dica, maximo }) {
  const [outro, setOutro] = useState(Boolean(valor) && !opcoes.includes(valor));
  const id = `campo-${rotulo.split(' ')[0].toLowerCase()}`;
  return (
    <div className="campo">
      <label htmlFor={id}><span>{rotulo}</span></label>
      <select id={id} value={outro ? '__outro' : valor} required
              onChange={(e) => {
                if (e.target.value === '__outro') { setOutro(true); aoMudar(''); }
                else { setOutro(false); aoMudar(e.target.value); }
              }}>
        <option value="">Escolha</option>
        {opcoes.map((o) => <option key={o} value={o}>{o}</option>)}
        <option value="__outro">Outro</option>
      </select>
      {outro && (
        <input aria-label={dica} value={valor} onChange={(e) => aoMudar(e.target.value)} maxLength={maximo}
               placeholder={dica} autoFocus required className="campo-outro" />
      )}
    </div>
  );
}

export { conferirEscolaridade } from '../lib/termos.js';
