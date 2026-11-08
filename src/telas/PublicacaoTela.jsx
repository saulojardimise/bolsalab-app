import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import Publicacao from '../componentes/Publicacao.jsx';
import Icone from '../componentes/Icone.jsx';

// Uma publicação da comunidade aberta sozinha (a partir de uma notificação),
// com todos os comentários e rolando até o comentário da notificação.
export default function PublicacaoTela({ id, comentario, aoVoltar, avisar, aoEscolher, aoAbrirFuturo }) {
  const [p, setP] = useState(undefined);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    api.publicacao(id).then((x) => vivo && setP(x)).catch((e) => { if (vivo) { setErro(e.message); setP(null); } });
    return () => { vivo = false; };
  }, [id]);

  const escolher = (x) => (x.origem === 'futuro' ? aoAbrirFuturo(x.base) : aoEscolher(x.ativo));

  return (
    <div className="pilha">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>Comunidade</h1>
        <span style={{ width: 40 }} />
      </header>
      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {p === undefined && <p className="carregando" aria-busy="true">Carregando…</p>}
      {p === null && !erro && <p className="cartao vazio">Essa publicação não está mais disponível.</p>}
      {p && <Publicacao p={p} aoMudar={setP} aoEscolher={escolher} avisar={avisar} destaque={comentario} />}
    </div>
  );
}
