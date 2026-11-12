import { useMemo, useState } from 'react';
import { diaMes, pct, reais, tendencia } from '../lib/formato.js';
import { lado, pontos } from '../lib/futuros.js';
import { futuroAgora, horaBR, horarioDoDia, mercadoAgora } from '../lib/intradia.js';
import Icone from '../componentes/Icone.jsx';
import ListaAtivos, { detalheQuantidade } from '../componentes/ListaAtivos.jsx';
import Termo from '../componentes/Termo.jsx';
import Logo from '../componentes/Logo.jsx';
import { INDEXADORES, mesAno, textoTaxa, titulos } from '../lib/tesouro.js';

const SECOES = [
  ['acoes', 'Ações'],
  ['futuros', 'Futuros'],
  ['etfs', 'ETFs'],
  ['bdrs', 'BDRs'],
  ['tesouro', 'Tesouro'],
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
  const temTesouro = mercado.some((e) => e.tipo === 'tesouro' && e.preco != null);
  const temBdrs = mercado.some((e) => e.tipo === 'bdr' && e.preco != null);

  return (
    <div className="pilha pilha-larga">
      <div className="secao-topo">
        <h1>Mercado</h1>
        {horaHoje
          ? <p className="suave"><span className="ponto-vivo" aria-hidden="true" /> Cotação das {horaBR(horaHoje)} <Termo id="cotacao_do_dia" /></p>
          : dataRef && <p className="suave"><Termo id="fechamento">Fechamento</Termo> de {diaMes(dataRef)}</p>}
      </div>

      <div className="abas-mercado" role="tablist" aria-label="O que você quer ver">
        {SECOES.filter(([id]) => id !== 'futuros' || temFuturos).filter(([id]) => id !== 'etfs' || temEtfs).filter(([id]) => id !== 'tesouro' || temTesouro).filter(([id]) => id !== 'bdrs' || temBdrs).map(([id, rotulo]) => (
          <button key={id} role="tab" aria-selected={secao === id} onClick={() => setSecao(id)}>{rotulo}</button>
        ))}
      </div>

      {horaHoje && secao !== 'tesouro' && (
        <p className="nota nota-hoje">Preços do pregão de hoje, com cerca de 30 min de atraso, só para acompanhar. As ordens usam o fechamento de {diaMes(dataRef)}.</p>
      )}

      {secao === 'tesouro' && temTesouro
        ? <ListaTesouro dados={dados} aoEscolher={aoEscolher} />
        : secao === 'futuros' && temFuturos
        ? <Futuros dados={dados} aoAbrirFuturo={aoAbrirFuturo} />
        : secao === 'bdrs' && temBdrs
          ? <ListaComFiltros key="bdrs" dados={dados} linhas={linhas} aoEscolher={aoEscolher} tipo="bdr" />
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
      const tem = detalheQuantidade(qtd, etf, e.ticker);
      return { ...e, detalhe: qtd ? `Você tem ${tem} · ${base}` : base };
    });

  return (
    <section aria-labelledby={`titulo-${tipo}`} className={`secao-mercado ${etf ? 'secao-etf' : ''}`}>
      <h2 id={`titulo-${tipo}`} className="secao-titulo">
        {etf ? <Termo id="etf">ETFs</Termo> : tipo === 'bdr' ? <Termo id="bdr">BDRs</Termo> : 'Ações do Ibovespa'}
      </h2>
      {etf && (
        <p className="suave intro-etf">
          Fundos negociados como ações: com uma cota você leva um índice inteiro, o ouro, o dólar ou títulos do Tesouro.
          Mesmas regras das ações: corretagem de {reais(dados.config.corretagem)} e lote de 1 cota.
        </p>
      )}
      {tipo === 'bdr' && (
        <p className="suave intro-etf">
          Recibos de ações de empresas listadas fora do Brasil, negociados na B3 em reais. O preço acompanha a ação lá fora
          e também o dólar. Mesmas regras das ações: corretagem de {reais(dados.config.corretagem)} e lote de 1 BDR.
        </p>
      )}
      <div className="filtros">
        <label className="busca">
          <Icone nome="busca" tamanho={20} />
          <input type="search" placeholder={etf ? 'Buscar ETF, código ou assunto' : tipo === 'bdr' ? 'Buscar empresa, código ou assunto' : 'Buscar empresa ou código'}
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

// Tesouro Direto: os títulos por tipo, com a taxa de hoje, o preço do título e o investimento mínimo
function ListaTesouro({ dados, aoEscolher }) {
  const titulosTesouro = dados.mercado.filter((e) => e.tipo === 'tesouro' && e.preco != null);
  const tenho = Object.fromEntries(dados.carteira.map((p) => [p.ticker, p.quantidade]));
  const dataBase = titulosTesouro.map((e) => e.data).sort().at(-1);
  return (
    <section aria-labelledby="titulo-tesouro" className="secao-mercado">
      <h2 id="titulo-tesouro" className="secao-titulo"><Termo id="tesouro_direto">Tesouro Direto</Termo></h2>
      <p className="suave intro-etf">
        Títulos públicos: você empresta dinheiro ao governo e recebe juros. Sem corretagem, a partir de 0,01 título.
        Preços e taxas do Tesouro de {diaMes(dataBase)}.
      </p>
      {INDEXADORES.map((ix) => {
        const lista = titulosTesouro.filter((e) => e.indexador === ix.id).sort((a, b) => (a.vencimento < b.vencimento ? -1 : 1));
        if (!lista.length) return null;
        return (
          <div key={ix.id} className="grupo-tesouro">
            <h3 className="grupo-tesouro-titulo"><Termo id={ix.termo}>{ix.titulo}</Termo></h3>
            <p className="suave grupo-tesouro-texto">{ix.curto}</p>
            <div className="cartao cartao-lista"><ul className="ativos">
              {lista.map((e) => (
                <li key={e.ticker}>
                  <button className="ativo" onClick={() => aoEscolher(e.ticker)}>
                    <Logo ticker={e.ticker} />
                    <span className="ativo-id">
                      <strong>{e.nome}</strong>
                      <span>{tenho[e.ticker] ? `Você tem ${titulos(tenho[e.ticker])} · ` : ''}vence {mesAno(e.vencimento)}{e.a_venda === false ? ' · fora de oferta' : ''}</span>
                    </span>
                    <span className="ativo-preco">
                      <strong className="num">{textoTaxa(e.indexador, e.taxa_compra)}</strong>
                      <span className="suave num">mín. {reais(Math.round(Number(e.pu_compra)) / 100)}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul></div>
          </div>
        );
      })}
      <p className="nota">
        A compra é pelo preço de compra e a venda, pelo de venda. Antes do vencimento, o preço do Prefixado e do IPCA+ sobe e
        desce com os juros: é a <Termo id="marcacao_mercado">marcação a mercado</Termo>.
      </p>
    </section>
  );
}
