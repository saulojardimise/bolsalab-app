import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { quando } from '../../lib/noticias.js';
import Comunidade from '../Comunidade.jsx';

// Comunidade vista pelo gestor: denúncias abertas e o mural, onde pode comentar, responder e apagar comentários.
export default function Moderacao({ avisar }) {
  const [denuncias, setDenuncias] = useState(null);
  const [versao, setVersao] = useState(0);
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    api.denunciasAbertas().then(setDenuncias).catch((e) => { setErro(e.message); setDenuncias([]); });
  }, []);
  useEffect(carregar, [carregar]);

  async function agir(d, apagar) {
    try {
      if (apagar) await api.apagarComentario(d.alvo_id);
      else await api.descartarDenuncias(d.alvo, d.alvo_id);
      avisar(apagar ? 'Comentário apagado.' : 'Denúncia descartada.');
      carregar();
      setVersao((v) => v + 1);
    } catch (e) { setErro(e.message); }
  }

  return (
    <div className="pilha">
      <div className="secao-topo"><h1>Comunidade</h1></div>
      <p className="suave">
        Você pode comentar, responder e apagar qualquer comentário. Apagar um comentário apaga também as respostas a ele.
      </p>
      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}

      <section aria-labelledby="titulo-denuncias">
        <h2 id="titulo-denuncias" className="secao-titulo">Denúncias {denuncias?.length ? `(${denuncias.length})` : ''}</h2>
        {denuncias?.length === 0 && <p className="cartao vazio">Nenhuma denúncia aberta.</p>}
        {denuncias?.length > 0 && (
          <ul className="cartao cartao-lista denuncias">
            {denuncias.map((d) => (
              <li key={`${d.alvo}-${d.alvo_id}`}>
                <p>
                  <strong>{d.autor}</strong> <span className="suave">· {d.grupo} · {d.alvo === 'comentario' ? 'comentário' : 'publicação'}</span>
                </p>
                <p className="denuncia-conteudo">“{d.conteudo}”</p>
                <p className="suave">
                  {d.denuncias} {d.denuncias === 1 ? 'denúncia' : 'denúncias'} · {quando(d.ultima)}
                  {d.motivos?.length > 0 && ` · ${d.motivos.join('; ')}`}
                </p>
                <div className="denuncia-acoes">
                  {d.alvo === 'comentario' && (
                    <button className="botao botao-principal botao-venda" onClick={() => agir(d, true)}>Apagar comentário</button>
                  )}
                  <button className="botao" onClick={() => agir(d, false)}>Descartar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-mural-gestor">
        <h2 id="titulo-mural-gestor" className="secao-titulo">Mural</h2>
        <Comunidade moderar versao={versao} avisar={avisar} />
      </section>
    </div>
  );
}
