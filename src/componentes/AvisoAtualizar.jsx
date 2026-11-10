import { useEffect, useRef, useState } from 'react';
import { aoTerVersaoNova, atualizarAgora } from '../lib/atualizacao.js';
import Icone from './Icone.jsx';

const ESPERA = 30;   // segundos até atualizar sozinho

// Versão nova publicada com o app aberto: tela que não dá para fechar.
// Atualiza no botão ou sozinha depois de alguns segundos.
export default function AvisoAtualizar() {
  const [versao, setVersao] = useState(null);
  const [falta, setFalta] = useState(ESPERA);
  const [indo, setIndo] = useState(false);
  const dialogo = useRef(null);

  useEffect(() => aoTerVersaoNova(setVersao), []);
  useEffect(() => {
    if (!versao) return undefined;
    dialogo.current?.showModal?.();
    const t = setInterval(() => setFalta((f) => f - 1), 1000);
    return () => clearInterval(t);
  }, [versao]);
  useEffect(() => { if (versao && falta <= 0 && !indo) atualizar(); });   // eslint-disable-line react-hooks/exhaustive-deps

  function atualizar() {
    setIndo(true);
    atualizarAgora(versao).finally(() => setTimeout(() => setIndo(false), 4000));
  }

  if (!versao) return null;
  return (
    <dialog ref={dialogo} className="folha aviso-atualizar" aria-labelledby="atualizar-titulo"
            onCancel={(e) => e.preventDefault()}>
      <div className="aviso-conteudo">
        <span className="aviso-atualizar-icone" aria-hidden="true"><Icone nome="baixar" tamanho={28} /></span>
        <h2 id="atualizar-titulo">Nova versão do BolsaLab</h2>
        <p>O app foi atualizado. Para continuar, é preciso carregar a versão nova. Sua carteira e seus dados não mudam.</p>
        <button className="botao botao-principal" onClick={atualizar} disabled={indo}>
          {indo ? 'Atualizando…' : 'Atualizar agora'}
        </button>
        <p className="nota" aria-live="polite">{indo ? ' ' : `Atualiza sozinho em ${Math.max(falta, 0)} s.`}</p>
      </div>
    </dialog>
  );
}
