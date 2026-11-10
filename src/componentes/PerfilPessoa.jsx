import { useEffect, useRef, useState } from 'react';
import { api } from '../api/index.js';
import { pct, tendencia } from '../lib/formato.js';
import { tempoNoApp } from '../lib/pessoa.js';
import { cursoEUniversidade } from '../lib/termos.js';
import Avatar from './Avatar.jsx';
import Icone from './Icone.jsx';
import Logo from './Logo.jsx';

const NOMES_FUTURO = { WIN: 'Mini Ibovespa', WDO: 'Mini dólar' };

// Cartão com o perfil de outra pessoa: foto, nome, tempo no app, desempenho,
// posição no ranking geral, ativo favorito e grupos.
export default function PerfilPessoa({ id, aoFechar, aoAbrirAtivo }) {
  const dialogo = useRef(null);
  const [p, setP] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    return () => d.close();
  }, []);
  useEffect(() => {
    let vivo = true;
    setP(null); setErro('');
    api.perfilPublico(id).then((x) => vivo && setP(x)).catch((e) => vivo && setErro(e.message));
    return () => { vivo = false; };
  }, [id]);

  const desde = p?.criado_em ? new Date(p.criado_em).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }) : '';
  const fav = p?.favorito;

  return (
    <dialog ref={dialogo} className="folha perfil-pessoa" aria-labelledby="titulo-pessoa"
            onCancel={(e) => { e.preventDefault(); aoFechar(); }}
            onClick={(e) => { if (e.target === dialogo.current) aoFechar(); }}>
      <div className="perfil-pessoa-conteudo">
        <button className="botao-icone perfil-pessoa-fechar" onClick={aoFechar} aria-label="Fechar"><Icone nome="fechar" /></button>
        {!p && !erro && <p className="carregando" aria-busy="true">Carregando…</p>}
        {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
        {p && (
          <>
            <header className="perfil-pessoa-topo">
              <Avatar foto={p.foto_url} tamanho={88} />
              <h2 id="titulo-pessoa">{p.nome || 'Sem nome'}{p.eu && <small className="suave"> (você)</small>}</h2>
              {p.professor && <span className="chip-professor">Professor</span>}
              {cursoEUniversidade(p) && (
                <p className="perfil-pessoa-curso"><Icone nome="capelo" tamanho={16} />{cursoEUniversidade(p)}</p>
              )}
              <p className="suave">{tempoNoApp(p.criado_em)}{desde && ` · desde ${desde}`}</p>
            </header>

            {!p.professor && (
              <dl className="perfil-pessoa-numeros">
                <div>
                  <dt>Desde o início</dt>
                  <dd className={`num ${tendencia(p.rentabilidade_pct)}`}>{p.rentabilidade_pct == null ? '—' : pct(p.rentabilidade_pct)}</dd>
                </div>
                <div>
                  <dt>Ranking geral</dt>
                  <dd className="num">{p.posicao ? `${p.posicao}º` : '—'}<small className="suave">{p.participantes ? ` de ${p.participantes}` : ''}</small></dd>
                </div>
                <div>
                  <dt>Operações</dt>
                  <dd className="num">{p.operacoes}</dd>
                </div>
              </dl>
            )}

            {!p.professor && (
              <section className="perfil-pessoa-bloco">
                <h3>Ativo favorito</h3>
                {fav ? (
                  <button className="perfil-pessoa-fav" onClick={() => { aoFechar(); aoAbrirAtivo?.(fav.ativo); }} disabled={!aoAbrirAtivo}>
                    <Logo ticker={fav.ativo} tamanho={36} />
                    <span><strong>{fav.ativo}</strong><small className="suave">{fav.nome || NOMES_FUTURO[fav.ativo] || ''}</small></span>
                    <small className="suave">{fav.ordens} {fav.ordens === 1 ? 'operação' : 'operações'}</small>
                  </button>
                ) : <p className="suave">Ainda não fez nenhuma operação.</p>}
              </section>
            )}

            <section className="perfil-pessoa-bloco">
              <h3>{p.grupos?.length === 1 ? 'Grupo' : 'Grupos'}</h3>
              {p.grupos?.length
                ? <p className="perfil-pessoa-grupos">{p.grupos.map((g) => <span key={g} className="chip-grupo">{g}</span>)}</p>
                : <p className="suave">{p.professor ? 'Professor do BolsaLab' : 'Não faz parte de nenhum grupo.'}</p>}
            </section>
          </>
        )}
      </div>
    </dialog>
  );
}
