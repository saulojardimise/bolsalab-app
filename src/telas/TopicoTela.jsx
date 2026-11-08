import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { quando } from '../lib/noticias.js';
import { nomeCurto } from '../lib/comunidade.js';
import Avatar from '../componentes/Avatar.jsx';
import ChipTopico from '../componentes/ChipTopico.jsx';
import Icone from '../componentes/Icone.jsx';

// Um tópico de discussão com as respostas (um nível de conversa).
// destaque = id de uma resposta para rolar até ela (vindo de uma notificação).
export default function TopicoTela({ id, destaque = null, aoVoltar, avisar, aoAbrirAtivo, moderar = false }) {
  const [t, setT] = useState(undefined);
  const [erro, setErro] = useState('');
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [respondendo, setRespondendo] = useState(null);
  const [confirmar, setConfirmar] = useState(null);   // { tipo: 'apagar'|'denunciar', alvo, id }

  const carregar = useCallback(async () => {
    try { setT(await api.topico(id)); } catch (e) { setErro(e.message); setT(null); }
  }, [id]);
  useEffect(() => { carregar(); }, [carregar]);

  useEffect(() => {
    if (!destaque || !t) return;
    document.getElementById(`resposta-${destaque}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [destaque, t]);

  async function responder(e) {
    e.preventDefault();
    if (!texto.trim() || enviando) return;
    setEnviando(true); setErro('');
    try {
      await api.responderTopico(id, texto, respondendo?.id ?? null);
      setTexto(''); setRespondendo(null);
      await carregar();
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  async function executar() {
    const c = confirmar;
    setConfirmar(null); setErro('');
    try {
      if (c.tipo === 'denunciar') {
        await api.denunciar(c.alvo, c.id);
        avisar?.('Denúncia enviada ao professor. Obrigado.');
      } else if (c.alvo === 'topico') {
        await api.apagarTopico(c.id);
        avisar?.('Tópico apagado.');
        aoVoltar();
      } else {
        await api.apagarRespostaTopico(c.id);
        await carregar();
      }
    } catch (err) { setErro(err.message); }
  }

  async function fixar() {
    try {
      await api.fixarTopico(id, !t.fixado);
      avisar?.(t.fixado ? 'Tópico desafixado.' : 'Tópico fixado no topo.');
      await carregar();
    } catch (err) { setErro(err.message); }
  }

  function abrirResposta(r) {
    setRespondendo(r);
    setTimeout(() => document.getElementById('responder-topico')?.focus(), 0);
  }

  const pedindo = (tipo, alvo, alvoId) => confirmar?.tipo === tipo && confirmar.alvo === alvo && confirmar.id === alvoId;
  const confirmacao = (alvo, alvoId) => (pedindo('apagar', alvo, alvoId) || pedindo('denunciar', alvo, alvoId)) && (
    <>
      <span className="suave">{confirmar.tipo === 'apagar' ? 'Apagar mesmo?' : 'Denunciar ao professor?'}</span>
      <button className="link link-perigo" onClick={executar}>Sim</button>
      <button className="link" onClick={() => setConfirmar(null)}>Não</button>
    </>
  );

  const respostas = t?.respostas ?? [];
  const raizes = respostas.filter((r) => !r.resposta_a);
  const filhas = (rid) => respostas.filter((r) => r.resposta_a === rid);

  const resposta = (r, filha = false) => (
    <div key={r.id} id={`resposta-${r.id}`}
         className={`comentario ${filha ? 'comentario-resposta' : ''} ${destaque === r.id ? 'comentario-destaque' : ''}`}>
      <Avatar foto={r.foto_url} tamanho={filha ? 26 : 32} />
      <div className="comentario-corpo">
        <p>
          <strong>{r.eu ? 'Você' : nomeCurto(r.nome)}</strong>
          {r.professor && <span className="chip-professor">Professor</span>}
          <span className="suave">{!r.professor && r.grupo ? ` · ${r.grupo}` : ''} · {quando(r.criado_em)}</span>
        </p>
        <p className="comentario-texto">{r.texto}</p>
        <p className="comentario-acoes">
          {confirmacao('topico_resposta', r.id) || (
            <>
              <button className="link" onClick={() => abrirResposta(r)}>Responder</button>
              {(r.eu || moderar) && (
                <button className="link link-perigo" onClick={() => setConfirmar({ tipo: 'apagar', alvo: 'topico_resposta', id: r.id })}>Apagar</button>
              )}
              {!r.eu && !moderar && !r.professor && (
                <button className="link link-discreto" onClick={() => setConfirmar({ tipo: 'denunciar', alvo: 'topico_resposta', id: r.id })}>Denunciar</button>
              )}
            </>
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="pilha topico-tela">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>Discussão</h1>
        <span style={{ width: 40 }} />
      </header>

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {t === undefined && <p className="carregando" aria-busy="true">Carregando…</p>}
      {t === null && !erro && <p className="cartao vazio">Esse tópico não existe mais.</p>}

      {t && (
        <>
          <article className="cartao topico-abertura">
            {t.fixado && <span className="chip-fixado"><Icone nome="alfinete" tamanho={12} />Fixado pelo professor</span>}
            <h2>{t.titulo}</h2>
            <ChipTopico t={t} grande aoAbrirAtivo={aoAbrirAtivo} />
            <p className="publicacao-autor">
              <Avatar foto={t.foto_url} tamanho={28} />
              <strong>{t.eu ? 'Você' : nomeCurto(t.nome)}</strong>
              {t.professor && <span className="chip-professor">Professor</span>}
              <span className="suave">{!t.professor && t.grupo ? ` · ${t.grupo}` : ''} · {quando(t.criado_em)}</span>
            </p>
            {t.texto && <p className="topico-texto">{t.texto}</p>}
            <p className="comentario-acoes">
              {confirmacao('topico', t.id) || (
                <>
                  {moderar && <button className="link" onClick={fixar}>{t.fixado ? 'Desafixar' : 'Fixar no topo'}</button>}
                  {(t.eu || moderar) && (
                    <button className="link link-perigo" onClick={() => setConfirmar({ tipo: 'apagar', alvo: 'topico', id: t.id })}>Apagar tópico</button>
                  )}
                  {!t.eu && !moderar && !t.professor && (
                    <button className="link link-discreto" onClick={() => setConfirmar({ tipo: 'denunciar', alvo: 'topico', id: t.id })}>Denunciar</button>
                  )}
                </>
              )}
            </p>
          </article>

          <section aria-labelledby="titulo-respostas">
            <h2 id="titulo-respostas" className="secao-titulo">
              {respostas.length} {respostas.length === 1 ? 'resposta' : 'respostas'}
            </h2>
            <div className="cartao comentarios topico-respostas">
              {respostas.length === 0 && <p className="suave">Ninguém respondeu ainda. Seja o primeiro!</p>}
              {raizes.map((r) => (
                <div key={r.id} className="fio">
                  {resposta(r)}
                  {filhas(r.id).map((f) => resposta(f, true))}
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
              <form className="comentar" onSubmit={responder}>
                <label className="sr-only" htmlFor="responder-topico">Sua resposta</label>
                <textarea id="responder-topico" rows={2} maxLength={2000} placeholder="Escreva sua resposta"
                          value={texto} onChange={(e) => setTexto(e.target.value)} />
                <button className="botao-icone" disabled={!texto.trim() || enviando} aria-label="Enviar">
                  <Icone nome="enviar" />
                </button>
              </form>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
