import { useState } from 'react';
import { api } from '../api/index.js';
import { quando } from '../lib/noticias.js';
import { pct, tendencia } from '../lib/formato.js';
import { REACOES, desdeOperacao, nomeCurto, partesOperacao, resumoReacoes } from '../lib/comunidade.js';
import Avatar from './Avatar.jsx';
import Icone from './Icone.jsx';

// Uma operação no mural: quem fez, o que fez, como está desde então,
// reações e comentários. moderar = visão do gestor (ocultar/mostrar).
export default function Publicacao({ p, aoEscolher, aoMudar, moderar = false, avisar }) {
  const [abertos, setAbertos] = useState(false);
  const [comentarios, setComentarios] = useState(null);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');
  const [denunciando, setDenunciando] = useState(null);   // { alvo, id }

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
      await api.comentar(p.id, texto);
      setTexto('');
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
      setComentarios((l) => l.filter((x) => x.id !== c.id));
      aoMudar({ ...p, comentarios: Math.max(0, p.comentarios - 1) });
    } catch (err) { setErro(err.message); }
  }

  async function denunciar() {
    try {
      await api.denunciar(denunciando.alvo, denunciando.id);
      setDenunciando(null);
      avisar?.('Denúncia enviada ao professor. Obrigado.');
    } catch (err) { setErro(err.message); }
  }

  async function ocultar(alvo, id, ocultar) {
    try {
      await api.ocultarNaComunidade(alvo, id, ocultar);
      if (alvo === 'publicacao') aoMudar({ ...p, oculta: ocultar });
      else setComentarios((l) => l.map((c) => (c.id === id ? { ...c, oculto: ocultar } : c)));
      avisar?.(ocultar ? 'Ocultado para os alunos.' : 'Visível de novo.');
    } catch (err) { setErro(err.message); }
  }

  const confirmaDenuncia = (alvo, id) => denunciando?.alvo === alvo && denunciando?.id === id;

  return (
    <article className={`cartao publicacao ${p.oculta ? 'publicacao-oculta' : ''}`}>
      <header className="publicacao-topo">
        <Avatar foto={p.foto_url} tamanho={40} />
        <div>
          <p className="publicacao-autor">
            <strong>{p.eu ? 'Você' : nomeCurto(p.nome)}</strong>
            {p.grupo && <span className="suave"> · {p.grupo}</span>}
          </p>
          <p className="suave publicacao-quando">{quando(p.criado_em)}{p.oculta && ' · oculta para os alunos'}</p>
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
          {comentarios?.map((c) => (
            <div key={c.id} className={`comentario ${c.oculto ? 'comentario-oculto' : ''}`}>
              <Avatar foto={c.foto_url} tamanho={30} />
              <div className="comentario-corpo">
                <p>
                  <strong>{c.eu ? 'Você' : nomeCurto(c.nome)}</strong>
                  <span className="suave"> · {c.grupo} · {quando(c.criado_em)}{c.oculto && ' · oculto'}</span>
                </p>
                <p className="comentario-texto">{c.texto}</p>
                <p className="comentario-acoes">
                  {moderar ? (
                    <>
                      <button className="link" onClick={() => ocultar('comentario', c.id, !c.oculto)}>{c.oculto ? 'Mostrar' : 'Ocultar'}</button>
                      <button className="link link-perigo" onClick={() => apagar(c)}>Apagar</button>
                    </>
                  ) : c.eu ? (
                    <button className="link" onClick={() => apagar(c)}>Apagar</button>
                  ) : confirmaDenuncia('comentario', c.id) ? (
                    <>
                      <span className="suave">Denunciar ao professor?</span>
                      <button className="link link-perigo" onClick={denunciar}>Sim</button>
                      <button className="link" onClick={() => setDenunciando(null)}>Não</button>
                    </>
                  ) : (
                    <button className="link link-discreto" onClick={() => setDenunciando({ alvo: 'comentario', id: c.id })}>Denunciar</button>
                  )}
                </p>
              </div>
            </div>
          ))}
          {!moderar && (
            <form className="comentar" onSubmit={comentar}>
              <label className="sr-only" htmlFor={`comentar-${p.id}`}>Escreva um comentário</label>
              <textarea id={`comentar-${p.id}`} rows={1} maxLength={500} placeholder="Escreva um comentário"
                        value={texto} onChange={(e) => setTexto(e.target.value)} />
              <button className="botao-icone" disabled={!texto.trim() || enviando} aria-label="Enviar comentário">
                <Icone nome="enviar" />
              </button>
            </form>
          )}
        </div>
      )}

      <footer className="publicacao-rodape">
        {moderar ? (
          <button className="link" onClick={() => ocultar('publicacao', p.id, !p.oculta)}>
            {p.oculta ? 'Mostrar publicação' : 'Ocultar publicação'}
          </button>
        ) : !p.eu && (confirmaDenuncia('publicacao', p.id) ? (
          <>
            <span className="suave">Denunciar ao professor?</span>
            <button className="link link-perigo" onClick={denunciar}>Sim</button>
            <button className="link" onClick={() => setDenunciando(null)}>Não</button>
          </>
        ) : (
          <button className="link link-discreto" onClick={() => setDenunciando({ alvo: 'publicacao', id: p.id })}>Denunciar</button>
        ))}
      </footer>
    </article>
  );
}

function rotuloLado(lado) {
  return { compra: 'Compra', venda: 'Venda', venda_descoberto: 'Venda a descoberto', recompra: 'Recompra' }[lado] ?? lado;
}
