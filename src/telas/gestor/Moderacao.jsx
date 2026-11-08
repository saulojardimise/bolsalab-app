import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { quando } from '../../lib/noticias.js';
import Comunidade from '../Comunidade.jsx';
import Discussoes from '../Discussoes.jsx';
import TopicoTela from '../TopicoTela.jsx';
import NovoTopico from '../NovoTopico.jsx';
import AvisosGestor from './AvisosGestor.jsx';

const ALVOS = {
  comentario: ['comentário do mural', 'Apagar comentário', (id) => api.apagarComentario(id)],
  topico: ['tópico', 'Apagar tópico', (id) => api.apagarTopico(id)],
  topico_resposta: ['resposta em discussão', 'Apagar resposta', (id) => api.apagarRespostaTopico(id)],
  publicacao: ['publicação', null, null],
};

// Comunidade vista pelo gestor: denúncias abertas e o mural, onde pode comentar, responder e apagar comentários.
export default function Moderacao({ avisar }) {
  const [denuncias, setDenuncias] = useState(null);
  const [versao, setVersao] = useState(0);
  const [parte, setParte] = useState('mural');      // mural | discussoes
  const [tela, setTela] = useState(null);           // { tipo: 'topico', id } | { tipo: 'novo', inicial }
  const [erro, setErro] = useState('');

  const carregar = useCallback(() => {
    api.denunciasAbertas().then(setDenuncias).catch((e) => { setErro(e.message); setDenuncias([]); });
  }, []);
  useEffect(carregar, [carregar]);

  async function agir(d, apagar) {
    try {
      if (apagar) await ALVOS[d.alvo][2](d.alvo_id);
      else await api.descartarDenuncias(d.alvo, d.alvo_id);
      avisar(apagar ? 'Apagado.' : 'Denúncia descartada.');
      carregar();
      setVersao((v) => v + 1);
    } catch (e) { setErro(e.message); }
  }

  if (tela?.tipo === 'topico') {
    return <TopicoTela key={tela.id} id={tela.id} moderar avisar={avisar}
                       aoVoltar={() => { setTela(null); setVersao((v) => v + 1); }} />;
  }
  if (tela?.tipo === 'novo') {
    return <NovoTopico inicial={tela.inicial} aoVoltar={() => setTela(null)}
                       aoCriado={(id) => { avisar('Tópico publicado.'); setTela({ tipo: 'topico', id }); }}
                       aoAbrirTopico={(id) => setTela({ tipo: 'topico', id })} />;
  }

  return (
    <div className="pilha">
      <div className="secao-topo"><h1>Comunidade</h1></div>
      <p className="suave">
        Você pode comentar, responder e apagar qualquer comentário ou resposta (apagar leva junto as respostas a ele).
        Nas discussões, também pode abrir tópicos, fixar no topo e apagar tópicos.
      </p>
      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}

      <AvisosGestor avisar={avisar} />

      <section aria-labelledby="titulo-denuncias">
        <h2 id="titulo-denuncias" className="secao-titulo">Denúncias {denuncias?.length ? `(${denuncias.length})` : ''}</h2>
        {denuncias?.length === 0 && <p className="cartao vazio">Nenhuma denúncia aberta.</p>}
        {denuncias?.length > 0 && (
          <ul className="cartao cartao-lista denuncias">
            {denuncias.map((d) => (
              <li key={`${d.alvo}-${d.alvo_id}`}>
                <p>
                  <strong>{d.autor}</strong> <span className="suave">· {d.grupo ? `${d.grupo} · ` : ''}{ALVOS[d.alvo]?.[0] ?? d.alvo}</span>
                </p>
                <p className="denuncia-conteudo">“{d.conteudo}”</p>
                <p className="suave">
                  {d.denuncias} {d.denuncias === 1 ? 'denúncia' : 'denúncias'} · {quando(d.ultima)}
                  {d.motivos?.length > 0 && ` · ${d.motivos.join('; ')}`}
                </p>
                <div className="denuncia-acoes">
                  {(d.alvo === 'topico' || d.alvo === 'topico_resposta') && (
                    <button className="botao" onClick={() => setTela({ tipo: 'topico', id: d.publicacao_id })}>Ver discussão</button>
                  )}
                  {ALVOS[d.alvo]?.[1] && (
                    <button className="botao botao-principal botao-venda" onClick={() => agir(d, true)}>{ALVOS[d.alvo][1]}</button>
                  )}
                  <button className="botao" onClick={() => agir(d, false)}>Descartar</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="chips" role="group" aria-label="Mostrar">
        <button aria-pressed={parte === 'mural'} onClick={() => setParte('mural')}>Mural de operações</button>
        <button aria-pressed={parte === 'discussoes'} onClick={() => setParte('discussoes')}>Discussões</button>
      </div>
      {parte === 'mural'
        ? <Comunidade moderar versao={versao} avisar={avisar} />
        : <Discussoes moderar versao={versao} aoAbrirTopico={(id) => setTela({ tipo: 'topico', id })}
                      aoNovoTopico={(inicial) => setTela({ tipo: 'novo', inicial })} />}
    </div>
  );
}
