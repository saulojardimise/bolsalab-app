import { useMemo, useState } from 'react';
import { diaMes, numero, pct, tendencia } from '../lib/formato.js';
import { lado, pontos } from '../lib/futuros.js';
import { futuroAgora, horaBR, horarioDoDia, mercadoAgora } from '../lib/intradia.js';
import Icone from '../componentes/Icone.jsx';
import ListaAtivos, { detalheQuantidade } from '../componentes/ListaAtivos.jsx';
import Termo from '../componentes/Termo.jsx';

const SECOES = [
  ['acoes', 'Ações'],
  ['futuros', 'Futuros'],
  ['etfs', 'ETFs'],
];

const lerSecao = () => {
  try { return sessionStorage.getItem('bolsalab:mercado') || 'acoes'; } catch { return 'acoes'; }
};

// Mercado: o aluno escolhe entre ações do Ibovespa, minicontratos futuros e ETFs
export default function Mercado({ dados, linhas, aoEscolher, aoAbrirFuturo }) {
  const [secao, setSecaoEstado] = useState(lerSecao);
  const setSecao = (s) => {
    setSecaoEstado(s);
    try { sessionStorage.setItem('bolsalab:mercado', s); } catch { /* sem armazenamento */ }
  };

  const { mercado } = dados;
  const horaHoje = horarioDoDia(mercado, dados.intradia);
  const dataRef = mercado.map((e) => e.data).filter(Boolean).sort().at(-1);
  const temFuturos = dados.futurosMercado?.some((f) => f.preco != null);
  const temEtfs = mercado.some((e) => e.tipo === 'etf');

  return (
    <div className="pilha pilha-larga">
      <div className="secao-topo">
        <h1>Mercado</h1>
        {horaHoje
          ? <p className="suave"><span className="ponto-vivo" aria-hidden="true" /> Cotação das {horaBR(horaHoje)} <Termo id="cotacao_do_dia" /></p>
          : dataRef && <p className="suave"><Termo id="fechamento">Fechamento</Termo> de {diaMes(dataRef)}</p>}
      </div>

      <div className="abas-mercado" role="tablist" aria-label="O que você quer ver">
        {SECOES.filter(([id]) => id !== 'futuros' || temFuturos).filter(([id]) => id !== 'etfs' || temEtfs).map(([id, rotulo]) => (
          <button key={id} role="tab" aria-selected={secao === id} onClick={() => setSecao(id)}>{rotulo}</button>
        ))}
      </div>

      {horaHoje && (
        <p className="nota nota-hoje">Preços do pregão de hoje, com cerca de 30 min de atraso, só para acompanhar. As ordens usam o fechamento de {diaMes(dataRef)}.</p>
      )}

      {secao === 'futuros' && temFuturos
        ? <Futuros dados={dados} aoAbrirFuturo={aoAbrirFuturo} />
        : secao === 'etfs' && temEtfs
          ? <ListaComFiltros key="etfs" dados={dados} linhas={linhas} aoEscolher={aoEscolher} tipo="etf" />
          : <ListaComFiltros key="acoes" dados={dados} linhas={linhas} aoEscolher={aoEscolher} tipo="acao" />}
    </div>
  );
}

// Ações ou ETFs, com busca e filtro por setor (ações) ou categoria (ETFs)
function ListaComFiltros({ dados, linhas, aoEscolher, tipo }) {
  const [busca, setBusca] = useState('');
  const [setor, setSetor] = useState('');
  const etf = tipo === 'etf';

  const daqui = useMemo(() => dados.mercado.filter((e) => (e.tipo ?? 'acao') === tipo), [dados.mercado, tipo]);
  const setores = useMemo(() => [...new Set(daqui.map((e) => e.setor))].sort(), [daqui]);
  const tenho = Object.fromEntries(dados.carteira.map((p) => [p.ticker, p.quantidade]));

  const termo = busca.trim().toLowerCase();
  const lista = mercadoAgora(daqui, dados.intradia)
    .filter((e) => (!setor || e.setor === setor) &&
      (!termo || e.ticker.toLowerCase().includes(termo) || e.nome.toLowerCase().includes(termo)
        || (e.descricao ?? '').toLowerCase().includes(termo)))
    .map((e) => {
      // ETF: uma linha didática do que ele acompanha (o nome do fundo fica na página dele)
      const base = etf ? (e.resumo || e.nome) : e.nome;
      const qtd = tenho[e.ticker];
      const tem = etf ? `${numero(qtd)} ${qtd === 1 ? 'cota' : 'cotas'}` : detalheQuantidade(qtd);
      return { ...e, detalhe: qtd ? `Você tem ${tem} · ${base}` : base };
    });

  return (
    <section aria-labelledby={`titulo-${tipo}`} className={`secao-mercado ${etf ? 'secao-etf' : ''}`}>
      <h2 id={`titulo-${tipo}`} className="secao-titulo">
        {etf ? <Termo id="etf">ETFs</Termo> : 'Ações do Ibovespa'}
      </h2>
      {etf && (
        <p className="suave intro-etf">
          Fundos negociados como ações: com uma cota você leva um índice inteiro, o ouro, o dólar ou títulos do Tesouro.
          Mesmas regras das ações: corretagem de R$ 15 e lote de 1 cota.
        </p>
      )}
      <div className="filtros">
        <label className="busca">
          <Icone nome="busca" tamanho={20} />
          <input type="search" placeholder={etf ? 'Buscar ETF, código ou assunto' : 'Buscar empresa ou código'}
                 aria-label={etf ? 'Buscar ETF' : 'Buscar empresa ou código'}
                 value={busca} onChange={(e) => setBusca(e.target.value)} />
        </label>
        <div className="chips" role="group" aria-label={etf ? 'Filtrar por categoria' : 'Filtrar por setor'}>
          <button aria-pressed={!setor} onClick={() => setSetor('')}>Todos</button>
          {setores.map((s) => (
            <button key={s} aria-pressed={setor === s} onClick={() => setSetor(setor === s ? '' : s)}>{s}</button>
          ))}
        </div>
      </div>

      {lista.length === 0
        ? <p className="vazio">Nada encontrado para “{busca}”.</p>
        : <div className="cartao cartao-lista"><ListaAtivos itens={lista} linhas={linhas} aoEscolher={aoEscolher} /></div>}
    </section>
  );
}

function Futuros({ dados, aoAbrirFuturo }) {
  return (
    <section aria-labelledby="titulo-mini" className="secao-mercado">
      <h2 id="titulo-mini" className="secao-titulo"><Termo id="minicontrato">Minicontratos</Termo></h2>
      <p className="suave intro-etf">
        Contratos de mini Ibovespa e mini dólar, com margem de garantia e ajuste diário. Corretagem de R$ 10 por ordem.
      </p>
      <div className="cartao cartao-lista"><ul className="ativos">
        {dados.futurosMercado.filter((f) => f.preco != null).map((f0) => {
          const ag = futuroAgora(dados.intradia, f0);
          const f = ag ? { ...f0, preco: ag.preco, variacao_pct: ag.variacao_pct } : f0;
          const pos = dados.futuros?.find((x) => x.ativo === f.ativo);
          return (
            <li key={f.ativo}>
              <button className="ativo" onClick={() => aoAbrirFuturo(f.ativo)}>
                <span className={`selo-futuro selo-${f.ativo.toLowerCase()}`} aria-hidden="true">{f.ativo}</span>
                <span className="ativo-id ativo-id-futuro">
                  <strong>{f.contrato}</strong>
                  <span>{f.nome}</span>
                  <span>{pos ? lado(pos.quantidade).texto : `vence ${diaMes(f.vencimento)}`}</span>
                </span>
                <span className="ativo-preco">
                  <strong className="num">{pontos(f.preco, f.ativo)} pt</strong>
                  {f.variacao_pct != null && <span className={`num ${tendencia(f.variacao_pct)}`}>{pct(f.variacao_pct)}</span>}
                </span>
              </button>
            </li>
          );
        })}
      </ul></div>
    </section>
  );
}
