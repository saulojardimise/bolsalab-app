import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/index.js';
import ListaTopicos from '../componentes/ListaTopicos.jsx';
import Icone from '../componentes/Icone.jsx';

const FILTROS = [
  ['', 'Todos'],
  ['acoes', 'Ações'],
  ['futuros', 'Minicontratos'],
  ['noticias', 'Notícias'],
  ['gerais', 'Gerais'],
];
const LIMITE = 30;

// Discussões: todos os tópicos, com filtros e busca. Cada tópico pode estar
// ligado a uma ação, a um minicontrato ou a uma notícia.
export default function Discussoes({ buscaInicial = '', versao, aoAbrirTopico, aoNovoTopico, moderar = false }) {
  const [tipo, setTipo] = useState('');
  const [busca, setBusca] = useState(buscaInicial);
  const [lista, setLista] = useState(null);
  const [temMais, setTemMais] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (pular = 0) => {
    setErro('');
    try {
      const novos = await api.topicos({ tipo: tipo || null, busca: busca.trim() || null, limite: LIMITE, pular });
      setLista((l) => (pular ? [...(l ?? []), ...novos] : novos));
      setTemMais(novos.length === LIMITE);
    } catch (e) { setErro(e.message); setLista((l) => l ?? []); }
  }, [tipo, busca]);

  useEffect(() => {
    const t = setTimeout(() => carregar(), busca ? 300 : 0);
    return () => clearTimeout(t);
  }, [carregar, versao, busca]);

  return (
    <div className="pilha discussoes">
      {!moderar && (
        <div className="secao-topo">
          <div>
            <h1>Discussões</h1>
            <p className="suave">Tópicos sobre ações, minicontratos e notícias. Pergunte, opine e aprenda com os colegas.</p>
          </div>
        </div>
      )}
      <button className="botao botao-principal" onClick={() => aoNovoTopico({})}>
        <Icone nome="mais" tamanho={18} />Novo tópico
      </button>

      <div className="chips" role="group" aria-label="Mostrar">
        {FILTROS.map(([id, rotulo]) => (
          <button key={id} aria-pressed={tipo === id} onClick={() => setTipo(id)}>{rotulo}</button>
        ))}
      </div>
      <label className="busca">
        <Icone nome="busca" tamanho={20} />
        <input type="search" placeholder="Buscar por assunto ou código (ex.: WEGE3)" aria-label="Buscar tópico"
               value={busca} onChange={(e) => setBusca(e.target.value)} />
      </label>

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {lista === null && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length === 0 && !erro && (
        <p className="cartao vazio">
          {busca || tipo ? 'Nenhum tópico com esses filtros.' : 'Nenhum tópico ainda. Que tal abrir o primeiro?'}
        </p>
      )}
      {lista?.length > 0 && <ListaTopicos topicos={lista} aoAbrir={aoAbrirTopico} />}
      {temMais && <button className="botao" onClick={() => carregar(lista.length)}>Carregar mais</button>}
    </div>
  );
}
