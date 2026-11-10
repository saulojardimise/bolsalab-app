import { ESCOLARIDADES, pedeSituacao, pedeUniversidade, SITUACOES, UNIVERSIDADES_SUGERIDAS } from '../lib/termos.js';

// Escolaridade, situação do curso (graduação, mestrado e doutorado) e universidade.
// valor = { escolaridade, situacao, universidade }
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
        <label className="campo">
          <span>Universidade ou faculdade</span>
          <input value={valor.universidade} onChange={(e) => mudar('universidade', e.target.value)} maxLength={120}
                 list="lista-universidades" autoComplete="organization" placeholder="Ex.: ISECENSA" required />
          <datalist id="lista-universidades">
            {UNIVERSIDADES_SUGERIDAS.map((u) => <option key={u} value={u} />)}
          </datalist>
        </label>
      )}
    </>
  );
}

export { conferirEscolaridade } from '../lib/termos.js';
