import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/index.js';
import { noPeriodo } from '../lib/periodos.js';
import { diaMes, pct, reais, reaisComSinal, tendencia } from '../lib/formato.js';
import { centesimosPorValor, indexador, precoTitulo, textoTaxa, titulos } from '../lib/tesouro.js';
import Grafico from '../componentes/Grafico.jsx';
import Periodos from '../componentes/Periodos.jsx';
import Icone from '../componentes/Icone.jsx';
import Logo from '../componentes/Logo.jsx';
import Termo from '../componentes/Termo.jsx';
import DiscussoesDoAtivo from '../componentes/DiscussoesDoAtivo.jsx';

const dataBR = (iso) => (iso ? new Date(`${iso}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '');

// Página de um título do Tesouro Direto: taxa, preço de compra e de venda, gráfico e boleta por valor.
export default function Tesouro({ ticker, operacaoInicial, dados, aoVoltar, aoExecutar, discussoes = {} }) {
  const t = dados.mercado.find((e) => e.ticker === ticker);
  const posicao = dados.carteira.find((p) => p.ticker === ticker);
  const [historico, setHistorico] = useState(null);
  const [periodo, setPeriodo] = useState('3M');
  const [erro, setErro] = useState('');

  useEffect(() => {
    let vivo = true;
    api.historico(ticker).then((h) => vivo && setHistorico(h)).catch((e) => vivo && setErro(e.message));
    return () => { vivo = false; };
  }, [ticker, dados.mercado]);

  const pontos = useMemo(() => historico &&
    noPeriodo(historico.map((h) => ({ data: h.data, valor: precoTitulo(h.preco) })), periodo), [historico, periodo]);

  if (!t) return null;
  const info = indexador(t.indexador);
  const puVenda = Number(t.pu_venda ?? precoTitulo(t.preco));
  const puCompra = Number(t.pu_compra ?? puVenda);

  return (
    <div className="pilha pilha-dupla">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>{t.nome}</h1>
        <span style={{ width: 40 }} />
      </header>

      <div className="coluna coluna-a">
        <section className="cartao">
          <div className="acao-cabeca">
            <Logo ticker={ticker} tamanho={56} />
            <div>
              <h2 className="acao-ticker">{textoTaxa(t.indexador, t.taxa_compra)}</h2>
              <p className="suave">Vence em {dataBR(t.vencimento)} · preços de {diaMes(t.data)}</p>
            </div>
          </div>

          <div className="descricao-etf">
            <p className="descricao-etf-titulo"><Termo id="tesouro_direto">Tesouro Direto</Termo> · {info?.titulo}</p>
            <p>{info?.texto}</p>
            {info?.risco && <p className="risco-etf risco-baixo"><strong>Risco:</strong> {info.risco}</p>}
          </div>

          <dl className="tesouro-taxas">
            <div>
              <dt><Termo id="taxa_tesouro">Rentabilidade na compra</Termo></dt>
              <dd className="num">{textoTaxa(t.indexador, t.taxa_compra)}</dd>
            </div>
            <div>
              <dt>Preço de compra</dt>
              <dd className="num">{reais(puCompra)} <small className="suave">por título</small></dd>
            </div>
            <div>
              <dt>Preço de venda <Termo id="spread_tesouro" /></dt>
              <dd className="num">{reais(puVenda)} <small className="suave">por título</small></dd>
            </div>
            <div>
              <dt>Investimento mínimo</dt>
              <dd className="num">{reais(Math.round(puCompra) / 100)} <small className="suave">(0,01 título)</small></dd>
            </div>
          </dl>
          {t.variacao_pct != null && (
            <p className={`variacao-periodo ${tendencia(t.variacao_pct)}`}>
              <strong className="num">{pct(t.variacao_pct)}</strong>
              <span className="suave">no preço desde o dia anterior</span>
              <Termo id="marcacao_mercado" />
            </p>
          )}

          {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
          {!pontos ? <div className="grafico" style={{ height: 200 }} aria-busy="true" />
            : <Grafico pontos={pontos} altura={200} rotulo={`Preço do ${t.nome}`} />}
          <Periodos valor={periodo} aoTrocar={setPeriodo} />
        </section>
        <div className="ordem-fim">
          <DiscussoesDoAtivo ativo={ticker} {...discussoes} />
        </div>
      </div>

      <div className="coluna coluna-b">
        {posicao && (
          <section className="cartao posicao-resumo" aria-label="Sua posição">
            <p>
              Você tem <strong>{titulos(posicao.quantidade)}</strong>, que valem {reais(posicao.valor_atual)} pelo preço de venda.{' '}
              <span className={tendencia(posicao.resultado)}>{reaisComSinal(posicao.resultado)} ({pct(posicao.resultado_pct)})</span>
            </p>
            <p className="nota">Preço médio de compra: {reais(precoTitulo(posicao.preco_medio))} por título.</p>
          </section>
        )}
        <BoletaTesouro t={t} posicao={posicao} dados={dados} aoExecutar={aoExecutar}
                       inicial={operacaoInicial === 'venda' && posicao ? 'venda' : 'compra'} />
      </div>
    </div>
  );
}

// Boleta por valor: o aluno diz quanto quer investir (ou resgatar) e o app calcula a fração do título
function BoletaTesouro({ t, posicao, dados, aoExecutar, inicial }) {
  const [tipo, setTipo] = useState(inicial);
  const [valor, setValor] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erroServidor, setErroServidor] = useState('');

  const saldo = Number(dados.perfil.saldo);
  const tenho = Number(posicao?.quantidade ?? 0);
  // o banco usa o preço do centésimo, com 2 casas
  const precoCompra = Math.round(Number(t.pu_compra ?? precoTitulo(t.preco)) ) / 100;
  const precoVenda = Number(t.preco);
  const preco = tipo === 'compra' ? precoCompra : precoVenda;
  const v = Number(String(valor).replace(/\./g, '').replace(',', '.')) || 0;
  let q = centesimosPorValor(v, preco);
  if (tipo === 'venda') q = Math.min(q, tenho);
  const total = Math.round(q * preco * 100) / 100;
  const maximo = tipo === 'compra' ? Math.floor(saldo / precoCompra) : tenho;

  let erro = '';
  if (v > 0 && q === 0) erro = `O mínimo é 0,01 título: ${reais(preco)}.`;
  else if (tipo === 'compra' && total > saldo) erro = 'Saldo insuficiente para este valor.';
  else if (tipo === 'compra' && t.a_venda === false) erro = 'Este título não está mais à venda no Tesouro Direto. Quem tem pode vender.';

  const fechada = !dados.liberada || dados.config.negociacao_pausada;
  const podeEnviar = !fechada && q > 0 && !erro && !enviando;

  function trocar(novo) { setTipo(novo); setValor(''); setErroServidor(''); }
  const tudo = () => setValor(String(Math.round(maximo * preco * 100) / 100).replace('.', ','));

  async function confirmar(e) {
    e.preventDefault();
    if (!podeEnviar) return;
    setEnviando(true); setErroServidor('');
    try {
      await api.executarOrdem(t.ticker, tipo, q);
      setValor('');
      await aoExecutar(`${tipo === 'compra' ? 'Compra' : 'Venda'} de ${titulos(q)} do ${t.nome} executada.`);
    } catch (err) {
      setErroServidor(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form className="cartao boleta" onSubmit={confirmar} aria-labelledby="boleta-titulo">
      <h2 id="boleta-titulo" className="sr-only">Ordem de {t.nome}</h2>
      <div className="abas-boleta" role="tablist" aria-label="Operação">
        <button type="button" role="tab" aria-selected={tipo === 'compra'} onClick={() => trocar('compra')}>Investir</button>
        <button type="button" role="tab" aria-selected={tipo === 'venda'} onClick={() => trocar('venda')} disabled={!tenho}>Resgatar</button>
      </div>

      <div className="campo-quantidade campo-valor">
        <label htmlFor="boleta-valor">{tipo === 'compra' ? 'Quanto quer investir (R$)' : 'Quanto quer resgatar (R$)'}</label>
        <button type="button" className="link" onClick={tudo} disabled={!maximo}>
          {tipo === 'compra' ? `Máximo: ${reais(Math.floor(maximo) * precoCompra)}` : `Tudo: ${reais(tenho * precoVenda)}`}
        </button>
        <input id="boleta-valor" inputMode="decimal" autoComplete="off" placeholder="0,00"
               value={valor} onChange={(e) => setValor(e.target.value.replace(/[^\d,.]/g, ''))} />
      </div>

      <div className="boleta-totais">
        <div>
          <span className="suave">{tipo === 'compra' ? 'Você compra' : 'Você vende'}</span>
          <strong className="num">{titulos(q)}</strong>
        </div>
        <div className="boleta-total">
          <span className="suave">{tipo === 'compra' ? 'Sai do seu saldo' : 'Entra no seu saldo'}</span>
          <strong className="num">{reais(total)}</strong>
        </div>
      </div>
      <dl className="boleta-detalhes">
        <div><dt>Preço {tipo === 'compra' ? 'de compra' : 'de venda'} de 0,01 título</dt><dd className="num">{reais(preco)}</dd></div>
        <div><dt>{tipo === 'compra' ? 'Taxa contratada' : 'Taxa de venda'}</dt>
          <dd className="num">{textoTaxa(t.indexador, tipo === 'compra' ? t.taxa_compra : t.taxa_venda)}</dd></div>
        <div><dt><Termo id="corretagem">Corretagem</Termo></dt><dd className="num">{reais(0)}</dd></div>
      </dl>

      {(erro || erroServidor) && v > 0 && <p className="aviso aviso-erro" role="alert">{erroServidor || erro}</p>}
      {fechada && (
        <p className="aviso" role="status">
          {dados.config.negociacao_pausada
            ? 'O professor pausou as ordens por enquanto.'
            : `Negociação fechada agora. Você pode simular e enviar a ordem a partir das ${dados.config.hora_abre ?? 19}h.`}
        </p>
      )}

      <button className={`botao botao-principal ${tipo === 'venda' ? 'botao-venda' : ''}`} disabled={!podeEnviar}>
        {enviando ? 'Enviando…' : tipo === 'compra' ? `Investir ${q > 0 ? reais(total) : ''}` : `Resgatar ${q > 0 ? reais(total) : ''}`}
      </button>

      <p className="aviso-virtual">
        <Icone nome="info" tamanho={16} />
        <span>
          <strong>Operação com dinheiro virtual.</strong> Preços do Tesouro Direto de {diaMes(t.data)}, sem corretagem.
          A compra é pelo preço de compra e a venda, pelo de venda.
        </span>
      </p>
    </form>
  );
}
