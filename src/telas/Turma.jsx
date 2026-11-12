import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/index.js';
import { pct, reais, tendencia } from '../lib/formato.js';
import Avatar from '../componentes/Avatar.jsx';
import BotaoPessoa from '../componentes/BotaoPessoa.jsx';
import Icone from '../componentes/Icone.jsx';

// busca sem diferenciar maiúsculas nem acentos
const simples = (t) => (t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
const gruposDe = (r) => (r.turma ? r.turma.split(', ').filter(Boolean) : []);
const SEM_GRUPO = '__sem__';

// Grupos: ranking de cada grupo da pessoa e o ranking geral (todo mundo que simula),
// entrar num grupo com o token e sair de um grupo.
export default function Turma({ grupos, versao, aoMudarGrupos, avisar }) {
  const [selecionado, setSelecionado] = useState(() => grupos[0]?.id ?? null);   // null = geral
  const [lista, setLista] = useState(null);
  const [erro, setErro] = useState('');
  const [saindo, setSaindo] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroGrupo, setFiltroGrupo] = useState('');   // só no ranking geral

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

  // grupos que aparecem no ranking geral, para o filtro
  const gruposNoRanking = useMemo(() => {
    const n = new Map();
    (lista ?? []).forEach((r) => gruposDe(r).forEach((g) => n.set(g, (n.get(g) ?? 0) + 1)));
    return [...n.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [lista]);
  const semGrupo = (lista ?? []).filter((r) => !r.turma).length;
  useEffect(() => { setFiltroGrupo(''); }, [selecionado]);

  const termo = simples(busca);
  const filtrada = (lista ?? []).filter((r) => {
    if (!grupo && filtroGrupo === SEM_GRUPO && r.turma) return false;
    if (!grupo && filtroGrupo && filtroGrupo !== SEM_GRUPO && !gruposDe(r).includes(filtroGrupo)) return false;
    return !termo || simples(r.nome).includes(termo);
  });
  const filtrando = Boolean(termo || (!grupo && filtroGrupo));

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

      <div className="chips chips-quebram" role="group" aria-label="Ranking">
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

      {lista?.length > 1 && (
        <div className="ranking-filtros">
          <label className="busca">
            <Icone nome="busca" tamanho={20} />
            <input type="search" placeholder="Buscar pelo nome" aria-label="Buscar pessoa pelo nome"
                   value={busca} onChange={(e) => setBusca(e.target.value)} />
          </label>
          {!grupo && (gruposNoRanking.length > 0) && (
            <label className="campo ranking-filtro-grupo">
              <span className="sr-only">Filtrar por grupo</span>
              <select value={filtroGrupo} onChange={(e) => setFiltroGrupo(e.target.value)}>
                <option value="">Todos os grupos ({lista.length})</option>
                {gruposNoRanking.map(([g, n]) => <option key={g} value={g}>{g} ({n})</option>)}
                {semGrupo > 0 && <option value={SEM_GRUPO}>Sem grupo ({semGrupo})</option>}
              </select>
            </label>
          )}
          {filtrando && (
            <p className="suave ranking-contagem" aria-live="polite">
              {filtrada.length === 0 ? 'Ninguém encontrado.' : `${filtrada.length} ${filtrada.length === 1 ? 'pessoa' : 'pessoas'}`}
              {!grupo && filtroGrupo ? '. A posição é a do ranking geral.' : ''}
            </p>
          )}
        </div>
      )}

      {filtrada.length > 0 && (
        <ol className="cartao cartao-lista ranking">
          {filtrada.map((r, i) => (
            <li key={i} className={r.eu ? 'eu' : undefined}>
              <span className="ranking-pos num">{r.posicao}º</span>
              <BotaoPessoa id={r.user_id} nome={r.nome} className="ranking-pessoa">
                <Avatar foto={r.foto_url} tamanho={40} />
                <span className="ranking-nome">
                  <strong>{r.nome || 'Sem nome'}</strong>
                  {!grupo && r.turma && <small>{r.turma}</small>}
                </span>
              </BotaoPessoa>
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
