import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { quando } from '../lib/noticias.js';
import { REACOES, fraseOperacao, nomeCurto } from '../lib/comunidade.js';
import Avatar from '../componentes/Avatar.jsx';
import Icone from '../componentes/Icone.jsx';

const EMOJI = Object.fromEntries(REACOES.map((r) => [r.id, r.emoji]));

// Notificações: reações e comentários de colegas e operações automáticas na conta.
// Abrir a tela marca tudo como lido.
export default function Notificacoes({ versao, aoVoltar, aoLer, aoAbrirPublicacao, aoAbrirExtrato }) {
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    api.notificacoes(60).then((l) => {
      if (!vivo) return;
      setLista(l);
      if (l.some((n) => !n.lida)) api.marcarNotificacoesLidas().then(aoLer).catch(() => {});
      else aoLer();
    }).catch((e) => { if (vivo) { setErro(e.message); setLista([]); } });
    return () => { vivo = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [versao]);

  return (
    <div className="pilha">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>Notificações</h1>
        <span style={{ width: 40 }} />
      </header>

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {lista === null && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length === 0 && !erro && (
        <p className="cartao vazio">
          Nada por aqui ainda. Quando um colega reagir ou comentar nas suas operações, ou quando acontecer
          alguma operação automática na sua conta, avisamos aqui.
        </p>
      )}
      {lista?.length > 0 && (
        <ul className="cartao cartao-lista notificacoes">
          {lista.map((n) => (
            <li key={n.id} className={n.lida ? '' : 'nao-lida'}>
              <button onClick={() => (n.tipo === 'automatica' ? aoAbrirExtrato()
                : aoAbrirPublicacao(n.publicacao_id, n.id.startsWith('comentario-') ? Number(n.id.slice(11)) : null))}>
                {n.tipo === 'automatica'
                  ? <span className="notificacao-icone"><Icone nome="alerta" tamanho={20} /></span>
                  : <span className="notificacao-foto">
                      <Avatar foto={n.foto_url} tamanho={40} />
                      <span className="notificacao-selo" aria-hidden="true">
                        {n.tipo === 'reacao' ? EMOJI[n.reacao] : '💬'}
                      </span>
                    </span>}
                <span className="notificacao-texto">
                  <span>{frase(n)}</span>
                  {n.texto && n.tipo !== 'automatica' && <span className="notificacao-citacao">“{n.texto}”</span>}
                  {n.tipo === 'automatica' && <span className="suave">{n.texto}</span>}
                  <small className="suave">{quando(n.criado_em)}{!n.lida && <span className="sr-only"> · nova</span>}</small>
                </span>
                {!n.lida && <span className="ponto-novo" aria-hidden="true" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      {lista?.length > 0 && <p className="nota">Mostramos os últimos 30 dias.</p>}
    </div>
  );
}

function frase(n) {
  const op = n.operacao ? fraseOperacao({ ...n.operacao }) : '';
  const quem = nomeCurto(n.autor);
  if (n.tipo === 'reacao') return <><strong>{quem}</strong> reagiu {EMOJI[n.reacao]} à sua operação: você {op}.</>;
  if (n.tipo === 'comentario') return <><strong>{quem}</strong> comentou na sua operação: você {op}.</>;
  if (n.tipo === 'resposta_comentario') return <><strong>{quem}</strong> respondeu seu comentário.</>;
  if (n.tipo === 'resposta') {
    return <><strong>{quem}</strong> também comentou na operação de {nomeCurto(n.operacao?.autor)} que você comentou.</>;
  }
  return <strong>{n.titulo}</strong>;
}
