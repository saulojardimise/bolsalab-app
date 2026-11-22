import { useState } from 'react';
import Icone from './Icone.jsx';

// Campo de senha com o "olho" para mostrar ou esconder o que foi digitado.
export default function CampoSenha(props) {
  const [ver, setVer] = useState(false);
  return (
    <span className="campo-senha">
      <input {...props} type={ver ? 'text' : 'password'} autoCapitalize="off" autoCorrect="off" spellCheck={false} />
      <button type="button" className="campo-senha-olho" onClick={() => setVer((v) => !v)}
              aria-label={ver ? 'Esconder senha' : 'Mostrar senha'} aria-pressed={ver}>
        <Icone nome={ver ? 'olho-fechado' : 'olho'} tamanho={20} />
      </button>
    </span>
  );
}
