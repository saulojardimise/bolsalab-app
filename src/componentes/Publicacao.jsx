import { useState } from 'react';
import { api } from '../api/index.js';
import { quando } from '../lib/noticias.js';
import { pct, tendencia } from '../lib/formato.js';
import { REACOES, desdeOperacao, nomeCurto, partesOperacao, resumoReacoes } from '../lib/comunidade.js';
import Avatar from './Avatar.jsx';
import Icone from './Icone.jsx';

// Uma operação no mural: quem fez, o que fez, como está desde então,
// reações e comentários (com respostas). moderar = visão do gestor (apaga comentários).
export default function Publicacao({ p, aoEscolher, aoMudar, moderar = false, avisar }) {
  const [abertos, setAbertos] = useState(false);
  const [comentarios, setComentarios] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [denunciando, setDenunciando] = useState(null);   // id do comentário
  const [respondendo, setRespondendo] = useState(null);   // comentário que está sendo respondido

  const desde = desdeOperacao(p);
  const frase = partesOperacao(p);
  const { total } = resumoReacoes(p.reacoes);

  async function carregarComentarios() {
    try { setComentarios(await api.comentarios(p.id)); } catch (e) { setErro(e.message); }
  }

  function alternarComentarios() {
    const abrir = !abertos;
    setAbertos(abrir);
    if (abrir && comentarios === null) carregarComentarios();
  }

  async function reagir(tipo) {
    if (moderar) return;
    const anterior = p.minha_reacao;
    const nova = anterior === tipo ? null : tipo;
    const contagem = { ...p.reacoes };
    if (anterior) contagem[anterior] = (contagem[anterior] ?? 1) - 1;
    if (nova) contagem[nova] = (contagem[nova] ?? 0) + 1;
    aoMudar({ ...p, minha_reacao: nova, reacoes: contagem });
    try { await api.reagir(p.id, tipo); } catch (e) { aoMudar(p); setErro(e.message); }
  }

  async function comentar(e) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true); setErro('');
    try {
      await api.comentar(p.id, texto, respondendo?.id ?? null);
      setTexto(''); setRespondendo(null);
      await carregarComentarios();
      aoMudar({ ...p, comentarios: p.comentarios + 1 });
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  async function apagar(c) {
    try {
      await api.apagarComentario(c.id);
      // apagar um comentário apaga também as respostas a ele
      const some = (x) => x.id === c.id || x.resposta_a === c.id;
      const n = comentarios.filter(some).length;
      setComentarios((l) => l.filter((x) => !some(x)));
      aoMudar({ ...p, comentarios: Math.max(0, p.comentarios - n) });
    } catch (err) { setErro(err.message); }
  }

  async function denunciar() {
    try {
      await api.denunciar('comentario', denunciando);
      setDenunciando(null);
      avisar?.('Denúncia enviada ao professor. Obrigado.');
    } catch (err) { setErro(err.message); }
  }

  function responder(c) {
    setRespondendo(c);
    setTimeout(() => document.getElementById(`comentar-${p.id}`)?.focus(), 0);
  }

  const raizes = comentarios?.filter((c) => !c.resposta_a) ?? [];
  const respostasDe = (id) => comentarios.filter((c) => c.resposta_a === id);

  const comentario = (c, resposta = false) => (
    <div key={c.id} className={`comentario ${resposta ? 'comentario-resposta' : ''}`}>
      <Avatar foto={c.foto_url} tamanho={resposta ? 26 : 30} />
      <div className="comentario-corpo">
        <p>
          <strong>{c.eu ? 'Você' : nomeCurto(c.nome)}</strong>
          {c.professor && <span className="chip-professor">Professor</span>}
          <span className="suave">{!c.professor && c.grupo ? ` · ${c.grupo}` : ''} · {quando(c.criado_em)}</span>
        </p>
        <p className="comentario-texto">{c.texto}</p>
        <p className="comentario-acoes">
          {denunciando === c.id ? (
            <>
              <span className="suave">Denunciar ao professor?</span>
              <button className="link link-perigo" onClick={denunciar}>Sim</button>
              <button className="link" onClick={() => setDenunciando(null)}>Não</button>
            </>
          ) : (
            <>
              <button className="link" onClick={() => responder(c)}>Responder</button>
              {(c.eu || moderar) && <button className="link link-perigo" onClick={() => apagar(c)}>Apagar</button>}
              {!c.eu && !moderar && !c.professor && (
                <button className="link link-discreto" onClick={() => setDenunciando(c.id)}>Denunciar</button>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <article className="cartao publicacao">
      <header className="publicacao-topo">
        <Avatar foto={p.foto_url} tamanho={40} />
        <div>
          <p className="publicacao-autor">
            <strong>{p.eu ? 'Você' : nomeCurto(p.nome)}</strong>
            {p.grupo && <span className="suave"> · {p.grupo}</span>}
          </p>
          <p className="suave publicacao-quando">{quando(p.criado_em)}</p>
        </div>
      </header>

      <p className="publicacao-operacao">
        <span className={`chip-lado lado-${p.lado}`}>{rotuloLado(p.lado)}</span>{' '}
        {p.eu ? 'Você ' : `${nomeCurto(p.nome).split(' ')[0]} `}
        {frase.antes}{' '}
        <button className="link-ativo" onClick={() => aoEscolher?.(p)} disabled={!aoEscolher}>{frase.ativo}</button>{' '}
        {frase.depois}
      </p>

      {desde != null && (
        <p className="publicacao-desde suave">
          Desde então: <strong className={`num ${tendencia(desde)}`}>{pct(desde)}</strong>{' '}
          {desde > 0 ? 'a favor' : desde < 0 ? 'contra' : ''}
        </p>
      )}

      <div className="publicacao-reacoes" role="group" aria-label="Reagir">
        {REACOES.map((r) => {
          const n = Number(p.reacoes?.[r.id] ?? 0);
          return (
            <button key={r.id} className="reacao" aria-pressed={p.minha_reacao === r.id}
                    onClick={() => reagir(r.id)} disabled={moderar} aria-label={`${r.rotulo}${n ? `, ${n}` : ''}`}>
              <span aria-hidden="true">{r.emoji}</span>{n > 0 && <span className="num">{n}</span>}
            </button>
          );
        })}
        <button className="reacao reacao-comentarios" aria-expanded={abertos} onClick={alternarComentarios}>
          <Icone nome="comentario" tamanho={18} />
          <span className="num">{p.comentarios || ''}</span>
          <span className="sr-only">comentários</span>
        </button>
      </div>
      {total === 0 && !p.comentarios && !moderar && <p className="nota publicacao-convite">Seja o primeiro a reagir ou comentar.</p>}

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}

      {abertos && (
        <div className="comentarios">
          {comentarios === null && <p className="suave" aria-busy="true">Carregando…</p>}
          {comentarios?.length === 0 && <p className="suave">Nenhum comentário ainda.</p>}
          {raizes.map((c) => (
            <div key={c.id} className="fio">
              {comentario(c)}
              {respostasDe(c.id).map((r) => comentario(r, true))}
            </div>
          ))}
          {respondendo && (
            <p className="respondendo">
              Respondendo a <strong>{respondendo.eu ? 'você' : nomeCurto(respondendo.nome)}</strong>
              <button className="botao-icone" onClick={() => setRespondendo(null)} aria-label="Cancelar resposta">
                <Icone nome="fechar" tamanho={16} />
              </button>
            </p>
          )}
          <form className="comentar" onSubmit={comentar}>
            <label className="sr-only" htmlFor={`comentar-${p.id}`}>{respondendo ? 'Escreva sua resposta' : 'Escreva um comentário'}</label>
            <textarea id={`comentar-${p.id}`} rows={1} maxLength={500}
                      placeholder={respondendo ? 'Escreva sua resposta' : 'Escreva um comentário'}
                      value={texto} onChange={(e) => setTexto(e.target.value)} />
            <button className="botao-icone" disabled={!texto.trim() || enviando} aria-label="Enviar">
              <Icone nome="enviar" />
            </button>
          </form>
        </div>
      )}

    </article>
  );
}

function rotuloLado(lado) {
  return { compra: 'Compra', venda: 'Venda', venda_descoberto: 'Venda a descoberto', recompra: 'Recompra' }[lado] ?? lado;
}
