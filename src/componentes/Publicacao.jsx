import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { quando } from '../lib/noticias.js';
import { pct, tendencia } from '../lib/formato.js';
import { REACOES, desdeOperacao, nomeCurto, partesOperacao, resumoReacoes } from '../lib/comunidade.js';
import Avatar from './Avatar.jsx';
import Icone from './Icone.jsx';

// Uma operação no mural: quem fez, o que fez, como está desde então,
// reações e comentários (com respostas). moderar = visão do gestor (apaga comentários).
// Mostra sempre os 2 comentários mais recentes (com as respostas); "Mostrar mais" abre o resto.
// destaque = id de um comentário para rolar até ele (vindo de uma notificação).
const VISIVEIS = 2;

export default function Publicacao({ p, aoEscolher, aoMudar, moderar = false, avisar, destaque = null }) {
  const [comentarios, setComentarios] = useState(p.lista_comentarios ?? null);
  const [todos, setTodos] = useState(Boolean(destaque));
  const [escrevendo, setEscrevendo] = useState(false);
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

  // o mural recarregou: usa a lista nova
  useEffect(() => { if (p.lista_comentarios) setComentarios(p.lista_comentarios); }, [p.lista_comentarios]);
  // sem a lista no mural (banco antigo): busca os comentários se houver algum
  useEffect(() => {
    if (!p.lista_comentarios && p.comentarios > 0) carregarComentarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // veio de uma notificação: rola até o comentário
  useEffect(() => {
    if (!destaque || !comentarios) return;
    const el = document.getElementById(`comentario-${destaque}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [destaque, comentarios]);

  function abrirCaixa() {
    setEscrevendo(true);
    setTimeout(() => document.getElementById(`comentar-${p.id}`)?.focus(), 0);
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
    abrirCaixa();
  }

  const todasRaizes = comentarios?.filter((c) => !c.resposta_a) ?? [];
  const respostasDe = (id) => comentarios.filter((c) => c.resposta_a === id);
  const raizes = todos ? todasRaizes : todasRaizes.slice(-VISIVEIS);
  const escondidos = (comentarios?.length ?? 0) - raizes.reduce((n, c) => n + 1 + respostasDe(c.id).length, 0);

  const comentario = (c, resposta = false) => (
    <div key={c.id} id={`comentario-${c.id}`}
         className={`comentario ${resposta ? 'comentario-resposta' : ''} ${destaque === c.id ? 'comentario-destaque' : ''}`}>
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
        <button className="reacao reacao-comentarios" onClick={abrirCaixa} aria-label={`Comentar${p.comentarios ? `, ${p.comentarios} comentários` : ''}`}>
          <Icone nome="comentario" tamanho={18} />
          <span className="num">{p.comentarios || ''}</span>
        </button>
      </div>
      {total === 0 && !p.comentarios && !moderar && <p className="nota publicacao-convite">Seja o primeiro a reagir ou comentar.</p>}

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}

      {(comentarios?.length > 0 || escrevendo) && (
        <div className="comentarios">
          {escondidos > 0 && (
            <button className="link mostrar-mais" onClick={() => setTodos(true)}>
              Mostrar mais {escondidos} {escondidos === 1 ? 'comentário' : 'comentários'}
            </button>
          )}
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
          {!escrevendo && (
            <button className="link comentar-abrir" onClick={abrirCaixa}>Escrever um comentário</button>
          )}
          {escrevendo && (
          <form className="comentar" onSubmit={comentar}>
            <label className="sr-only" htmlFor={`comentar-${p.id}`}>{respondendo ? 'Escreva sua resposta' : 'Escreva um comentário'}</label>
            <textarea id={`comentar-${p.id}`} rows={1} maxLength={500}
                      placeholder={respondendo ? 'Escreva sua resposta' : 'Escreva um comentário'}
                      value={texto} onChange={(e) => setTexto(e.target.value)} />
            <button className="botao-icone" disabled={!texto.trim() || enviando} aria-label="Enviar">
              <Icone nome="enviar" />
            </button>
          </form>
          )}
        </div>
      )}

    </article>
  );
}

function rotuloLado(lado) {
  return { compra: 'Compra', venda: 'Venda', venda_descoberto: 'Venda a descoberto', recompra: 'Recompra' }[lado] ?? lado;
}
