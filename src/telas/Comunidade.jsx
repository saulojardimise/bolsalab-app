import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/index.js';
import Publicacao from '../componentes/Publicacao.jsx';
import Icone from '../componentes/Icone.jsx';

const LADOS = [
  ['compra', 'Compra'],
  ['venda', 'Venda'],
  ['venda_descoberto', 'Venda a descoberto'],
  ['recompra', 'Recompra'],
];
const SEM_FILTRO = { grupo: '', lado: '', ativo: '', autor: '' };
const NOMES_FUTURO = { WIN: 'Mini Ibovespa (WIN)', WDO: 'Mini dólar (WDO)' };
const LIMITE = 20;

// Comunidade: mural com as operações dos alunos de todos os grupos,
// reações e comentários.
export default function Comunidade({ dados, versao, aoEscolher, aoAbrirFuturo, avisar, aoVerDiscussoes, moderar = false }) {
  // os filtros sempre começam em "tudo"
  const [filtros, setFiltros] = useState(SEM_FILTRO);
  const [opcoes, setOpcoes] = useState(null);
  const [lista, setLista] = useState(null);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (antes = null) => {
    setCarregando(true); setErro('');
    try {
      // grupo 'meus' = só quem divide grupo comigo; um id = aquele grupo
      const escopo = filtros.grupo === 'meus' ? 'grupo' : 'todos';
      const novos = await api.comunidade(escopo, antes, LIMITE, {
        grupo: filtros.grupo && filtros.grupo !== 'meus' ? filtros.grupo : null,
        lado: filtros.lado || null, ativo: filtros.ativo || null, autor: filtros.autor || null,
      });
      setLista((l) => (antes ? [...(l ?? []), ...novos] : novos));
      setTemMais(novos.length === LIMITE);
    } catch (e) {
      setErro(e.message);
      setLista((l) => l ?? []);
    } finally {
      setCarregando(false);
    }
  }, [filtros]);

  useEffect(() => { setLista(null); carregar(); }, [carregar, versao]);

  useEffect(() => {
    let vivo = true;
    api.comunidadeFiltros?.().then((o) => vivo && setOpcoes(o)).catch(() => vivo && setOpcoes(null));
    return () => { vivo = false; };
  }, [versao]);

  const filtrar = (campo, valor) => setFiltros((f) => ({ ...f, [campo]: valor }));
  const filtrando = Object.values(filtros).some(Boolean);
  const mudar = (p) => setLista((l) => l.map((x) => (x.id === p.id ? p : x)));
  const escolher = (p) => (p.origem === 'futuro' ? aoAbrirFuturo?.(p.base) : aoEscolher?.(p.ativo));

  return (
    <div className="pilha comunidade">
      {!moderar && (
        <>
          <div className="secao-topo">
            <h1>Comunidade</h1>
          </div>
          <p className="suave">
            As operações de todos que simulam no BolsaLab. Reaja e comente.
          </p>
          {aoVerDiscussoes && (
            <button className="cartao atalho-discussoes" onClick={aoVerDiscussoes}>
              <Icone nome="discussoes" />
              <span><strong>Discussões</strong><small>Tópicos sobre ações, minicontratos e notícias</small></span>
              <Icone nome="seta" tamanho={18} />
            </button>
          )}
        </>
      )}

      <div className="filtros-comunidade" role="group" aria-label="Filtrar operações">
        <label className="seletor">
          <span className="sr-only">Grupo</span>
          <select value={filtros.grupo} onChange={(e) => filtrar('grupo', e.target.value)}>
            <option value="">Grupos: todos</option>
            {!moderar && dados?.grupos?.length > 0 && <option value="meus">Meus grupos</option>}
            {opcoes?.grupos?.map((g) => <option key={g.id} value={g.id}>{g.nome}</option>)}
          </select>
        </label>
        <label className="seletor">
          <span className="sr-only">Operação</span>
          <select value={filtros.lado} onChange={(e) => filtrar('lado', e.target.value)}>
            <option value="">Operações: todas</option>
            {LADOS.map(([id, rotulo]) => <option key={id} value={id}>{rotulo}</option>)}
          </select>
        </label>
        <label className="seletor">
          <span className="sr-only">Ativo</span>
          <select value={filtros.ativo} onChange={(e) => filtrar('ativo', e.target.value)}>
            <option value="">Ativos: todos</option>
            {opcoes?.ativos?.map((a) => <option key={a} value={a}>{NOMES_FUTURO[a] ?? a}</option>)}
          </select>
        </label>
        <label className="seletor">
          <span className="sr-only">Pessoa</span>
          <select value={filtros.autor} onChange={(e) => filtrar('autor', e.target.value)}>
            <option value="">Pessoas: todas</option>
            {opcoes?.pessoas?.map((p) => (
              <option key={p.id} value={p.id}>{p.nome || 'Sem nome'}{p.grupo ? ` · ${p.grupo}` : ''}</option>
            ))}
          </select>
        </label>
        {filtrando && (
          <button className="link limpar-filtros" onClick={() => setFiltros(SEM_FILTRO)}>Limpar filtros</button>
        )}
      </div>

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {lista === null && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length === 0 && !erro && (
        <p className="cartao vazio">
          {filtrando
            ? 'Nenhuma operação com esses filtros.'
            : 'Nenhuma operação ainda. As ordens dos alunos aparecem aqui assim que são feitas.'}
        </p>
      )}

      <div className="mural">
        {lista?.map((p) => (
          <Publicacao key={p.id} p={p} aoMudar={mudar} aoEscolher={moderar ? null : escolher}
                      moderar={moderar} avisar={avisar} />
        ))}
      </div>

      {temMais && (
        <button className="botao" onClick={() => carregar(lista.at(-1).id)} disabled={carregando}>
          {carregando ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}

      {!moderar && lista?.length > 0 && (
        <p className="nota">
          Seja respeitoso: o professor acompanha a comunidade e pode ocultar publicações e comentários.
          Viu algo ofensivo? Toque em Denunciar.
        </p>
      )}
    </div>
  );
}
