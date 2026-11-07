import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import { pct, reais, tendencia } from '../lib/formato.js';
import Avatar from '../componentes/Avatar.jsx';

// Grupos: ranking de cada grupo da pessoa e o ranking geral (todo mundo que simula),
// entrar num grupo com o token e sair de um grupo.
export default function Turma({ grupos, versao, aoMudarGrupos, avisar }) {
  const [selecionado, setSelecionado] = useState(() => grupos[0]?.id ?? null);   // null = geral
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [saindo, setSaindo] = useState(false);

  // se a pessoa sair do grupo que estava aberto, volta para o primeiro (ou geral)
  useEffect(() => {
    if (selecionado != null && !grupos.some((g) => g.id === selecionado)) setSelecionado(grupos[0]?.id ?? null);
  }, [grupos, selecionado]);

  useEffect(() => {
    let vivo = true;
    setLista(null); setErro('');
    api.ranking(selecionado)
      .then((r) => vivo && setLista(r))
      .catch((e) => vivo && setErro(e.message));
    return () => { vivo = false; };
  }, [selecionado, versao]);

  const grupo = grupos.find((g) => g.id === selecionado);
  const eu = lista?.find((r) => r.eu);

  async function sair() {
    try {
      await api.sairDoGrupo(grupo.id);
      setSaindo(false);
      avisar?.(`Você saiu do grupo ${grupo.nome}.`);
      await aoMudarGrupos?.();
    } catch (e) { setErro(e.message); }
  }

  return (
    <div className="pilha">
      <div className="secao-topo">
        <div>
          <h1>Grupos</h1>
          <p className="suave">
            {grupos.length === 0 ? 'Você ainda não está em nenhum grupo.'
              : grupos.length === 1 ? `Você está no grupo ${grupos[0].nome}.`
              : `Você está em ${grupos.length} grupos.`}
          </p>
        </div>
      </div>

      <div className="chips" role="group" aria-label="Ranking">
        {grupos.map((g) => (
          <button key={g.id} aria-pressed={selecionado === g.id} onClick={() => setSelecionado(g.id)}>{g.nome}</button>
        ))}
        <button aria-pressed={selecionado == null} onClick={() => setSelecionado(null)}>Geral</button>
      </div>

      {eu && lista.length > 1 && (
        <p className="cartao destaque-posicao">
          Você está em <strong>{eu.posicao}º lugar</strong> entre {lista.length}{' '}
          {grupo ? `pessoas do grupo ${grupo.nome}` : 'pessoas que simulam no BolsaLab'},
          com <strong className={tendencia(eu.rentabilidade_pct)}>{pct(eu.rentabilidade_pct)}</strong>.
        </p>
      )}

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {!lista && !erro && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length === 0 && <p className="cartao vazio">Ninguém no ranking ainda.</p>}

      {lista?.length > 0 && (
        <ol className="cartao cartao-lista ranking">
          {lista.map((r, i) => (
            <li key={i} className={r.eu ? 'eu' : undefined}>
              <span className="ranking-pos num">{r.posicao}º</span>
              <Avatar foto={r.foto_url} tamanho={40} />
              <span className="ranking-nome">
                <strong>{r.nome || 'Sem nome'}</strong>
                {!grupo && r.turma && <small>{r.turma}</small>}
              </span>
              <span className="ranking-valor">
                <strong className={`num ${tendencia(r.rentabilidade_pct)}`}>{pct(r.rentabilidade_pct)}</strong>
                <small className="num">{reais(r.patrimonio)}</small>
              </span>
            </li>
          ))}
        </ol>
      )}

      {grupo && !saindo && (
        <button className="link link-discreto sair-grupo" onClick={() => setSaindo(true)}>Sair do grupo {grupo.nome}</button>
      )}
      {grupo && saindo && (
        <div className="confirmacao" role="alert">
          <p>Sair do grupo <strong>{grupo.nome}</strong>? Sua carteira continua igual. Para voltar, você vai precisar do token de novo.</p>
          <div className="botoes-linha">
            <button className="botao" onClick={() => setSaindo(false)}>Cancelar</button>
            <button className="botao botao-perigo" onClick={sair}>Sair do grupo</button>
          </div>
        </div>
      )}

      <EntrarNoGrupo aoEntrar={async (g) => { avisar?.(`Você entrou no grupo ${g.nome}.`); await aoMudarGrupos?.(); setSelecionado(g.id); }} />
    </div>
  );
}

function EntrarNoGrupo({ aoEntrar }) {
  const [token, setToken] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    if (!token.trim()) { setErro('Digite o token do grupo.'); return; }
    setEnviando(true); setErro('');
    try {
      const g = await api.entrarNoGrupo(token.trim());
      setToken('');
      await aoEntrar(g);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="cartao entrar-grupo" onSubmit={entrar} aria-labelledby="titulo-entrar-grupo">
      <h2 id="titulo-entrar-grupo">Entrar em um grupo</h2>
      <p className="suave">Recebeu um token de um professor? Digite aqui. Você pode participar de vários grupos ao mesmo tempo, com a mesma carteira.</p>
      <label className="campo">
        <span className="sr-only">Token do grupo</span>
        <input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Ex.: K7QM-P2XA"
               autoCapitalize="characters" autoComplete="off" spellCheck="false" />
      </label>
      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      <button className="botao botao-principal" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar no grupo'}</button>
    </form>
  );
}
