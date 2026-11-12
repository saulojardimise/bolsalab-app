import { diaMes, pct, reais, tendencia } from '../lib/formato.js';
import Grafico from '../componentes/Grafico.jsx';
import Termo from '../componentes/Termo.jsx';
import Icone from '../componentes/Icone.jsx';

const dec = (v, casas = 2) => (v == null ? '–' : Number(v).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas }));
const taxa = (v, casas = 2) => (v == null ? '–' : `${dec(v, casas)}%`);
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const mesAno = (iso) => (iso ? `${MESES[Number(iso.slice(5, 7)) - 1]}/${iso.slice(0, 4)}` : '');
const trimestre = (iso) => (iso ? `${Math.floor((Number(iso.slice(5, 7)) - 1) / 3) + 1}º tri/${iso.slice(0, 4)}` : '');
const dataBR = (iso) => (iso ? iso.split('-').reverse().join('/') : '');

/** Faixa compacta do Início: Selic, IPCA 12m, dólar e Focus. Toque abre a página Economia. */
export function FaixaEconomia({ macro, aoAbrir }) {
  if (!macro?.selic && !macro?.ipca) return null;
  const focusSelic = macro.focus?.itens?.find((i) => i.indicador === 'SELIC' && i.ano === new Date().getFullYear() + 1);
  return (
    <button className="faixa-economia" onClick={aoAbrir} aria-label="Abrir o painel Economia">
      <span className="faixa-economia-titulo">Economia hoje <Icone nome="seta" tamanho={16} /></span>
      {macro.selic && <span><small>Selic</small><strong className="num">{taxa(macro.selic.valor)}</strong></span>}
      {macro.ipca && <span><small>IPCA 12m</small><strong className="num">{taxa(macro.ipca.acumulado_12m)}</strong></span>}
      {macro.dolar && <span><small>Dólar</small><strong className="num">{reais(macro.dolar.valor)}</strong></span>}
      {focusSelic && <span><small>Selic fim {focusSelic.ano}</small><strong className="num">{taxa(focusSelic.mediana)}</strong></span>}
    </button>
  );
}

const NOMES_FOCUS = { SELIC: ['Selic', 'selic'], IPCA: ['IPCA', 'ipca'], PIB: ['PIB', 'pib'], CAMBIO: ['Dólar', 'cambio'] };

// Página Economia: o cenário que mexe com os investimentos, com dados do Banco Central
export default function Economia({ macro, erro }) {
  if (erro) return <div className="pilha"><h1>Economia</h1><p className="aviso aviso-erro" role="alert">{erro}</p></div>;
  if (!macro) return <div className="pilha"><h1>Economia</h1><p className="carregando" aria-busy="true">Carregando…</p></div>;
  const { selic, ipca, dolar, pib, focus, cdi } = macro;
  const meta = macro.meta_inflacao ?? { centro: 3, tolerancia: 1.5 };
  const vazio = !selic && !ipca && !dolar && !pib && !focus;
  const ultimaDecisao = selic?.decisoes?.[0];
  const anoFocus = focus ? Number(focus.data.slice(0, 4)) : null;

  return (
    <div className="pilha pilha-larga economia">
      <div className="secao-topo">
        <h1>Economia</h1>
        <p className="suave">Dados do Banco Central</p>
      </div>
      <p className="suave">
        Juros, inflação, câmbio e crescimento mexem com todos os investimentos. Antes de comprar, vale olhar o cenário.
      </p>
      {vazio && <p className="cartao vazio">Os dados de economia ainda não foram coletados. Volte mais tarde.</p>}

      <div className="economia-grade">
        {selic && (
          <section className="cartao economia-cartao" aria-labelledby="eco-selic">
            <h2 id="eco-selic"><Termo id="selic">Selic</Termo></h2>
            <p className="valor-grande num">{taxa(selic.valor)} <small className="suave">ao ano</small></p>
            <p className="suave">
              {ultimaDecisao
                ? <>Desde {dataBR(selic.desde)}: o <Termo id="copom">Copom</Termo> {Number(ultimaDecisao.para) < Number(ultimaDecisao.de) ? 'cortou' : 'subiu'} de {taxa(ultimaDecisao.de)} para {taxa(ultimaDecisao.para)}.</>
                : <>Taxa básica de juros da economia.</>}
            </p>
            {selic.historico?.length > 2 && (
              <Grafico pontos={selic.historico.map((h) => ({ data: h.data, valor: Number(h.valor) }))} altura={130}
                       rotulo="Selic nos últimos anos" formatar={(v) => taxa(v)} formatarData={mesAno} />
            )}
            <dl className="economia-linhas">
              {cdi && <div><dt><Termo id="cdi">CDI</Termo></dt><dd className="num">{taxa(cdi.ao_ano)} ao ano</dd></div>}
              {macro.juro_real != null && <div><dt><Termo id="juro_real">Juro real</Termo></dt><dd className="num">{taxa(macro.juro_real)} ao ano</dd></div>}
            </dl>
            <p className="nota">Selic alta: a renda fixa rende mais e as ações costumam sofrer, porque o crédito fica caro e a bolsa perde atratividade.</p>
          </section>
        )}

        {ipca && (
          <section className="cartao economia-cartao" aria-labelledby="eco-ipca">
            <h2 id="eco-ipca"><Termo id="ipca">Inflação (IPCA)</Termo></h2>
            <p className="valor-grande num">{taxa(ipca.acumulado_12m)} <small className="suave">em 12 meses</small></p>
            <p className="suave">
              Em {mesAno(ipca.mes)}: <span className={`num ${tendencia(-Number(ipca.valor_mes))}`}>{taxa(ipca.valor_mes)}</span>.{' '}
              <Termo id="meta_inflacao">Meta</Termo>: {taxa(meta.centro, 1)}, podendo ir de {taxa(meta.centro - meta.tolerancia, 1)} a {taxa(meta.centro + meta.tolerancia, 1)}.
              {Number(ipca.acumulado_12m) > meta.centro + meta.tolerancia ? ' Está acima do teto.' : Number(ipca.acumulado_12m) < meta.centro - meta.tolerancia ? ' Está abaixo do piso.' : ' Está dentro do intervalo.'}
            </p>
            {ipca.historico_12m?.length > 2 && (
              <Grafico pontos={ipca.historico_12m.map((h) => ({ data: h.data, valor: Number(h.valor) }))} altura={130}
                       rotulo="IPCA acumulado em 12 meses, com o teto da meta" formatar={(v) => taxa(v)} formatarData={mesAno}
                       extras={[{ id: 'teto', classe: 'serie-cdi', valores: ipca.historico_12m.map(() => meta.centro + meta.tolerancia) }]} />
            )}
            <p className="nota">A linha tracejada é o teto da meta. Inflação alta corrói o dinheiro parado. Títulos como o Tesouro IPCA+ protegem o poder de compra.</p>
          </section>
        )}

        {dolar && (
          <section className="cartao economia-cartao" aria-labelledby="eco-dolar">
            <h2 id="eco-dolar"><Termo id="ptax">Dólar</Termo></h2>
            <p className="valor-grande num">{reais(dolar.valor)}</p>
            <p className="suave">
              PTAX de {diaMes(dolar.data)}.
              {dolar.variacao_30d != null && <> Em 30 dias: <span className={`num ${tendencia(dolar.variacao_30d)}`}>{pct(dolar.variacao_30d)}</span>.</>}
            </p>
            {dolar.historico?.length > 2 && (
              <Grafico pontos={dolar.historico.map((h) => ({ data: h.data, valor: Number(h.valor) }))} altura={130}
                       rotulo="Dólar no último ano" casasEixo={2} />
            )}
            <p className="nota">Dólar em alta encarece importados e ajuda exportadoras, como Vale, Suzano e frigoríficos.</p>
          </section>
        )}

        {pib && (
          <section className="cartao economia-cartao" aria-labelledby="eco-pib">
            <h2 id="eco-pib"><Termo id="pib">PIB</Termo></h2>
            <p className="valor-grande num">{pib.variacao_trimestre != null ? pct(pib.variacao_trimestre) : '–'} <small className="suave">no trimestre</small></p>
            <p className="suave">
              {trimestre(pib.trimestre)}, comparado ao trimestre anterior.
              {pib.variacao_ano != null && <> Contra o mesmo trimestre do ano passado: <span className="num">{pct(pib.variacao_ano)}</span>.</>}
            </p>
            {pib.historico?.length > 2 && (
              <Grafico pontos={pib.historico.map((h) => ({ data: h.data, valor: Number(h.valor) }))} altura={130}
                       rotulo="PIB contra o mesmo trimestre do ano anterior" formatar={(v) => taxa(v)} formatarData={trimestre} />
            )}
            <p className="nota">Economia crescendo: as empresas vendem mais e os lucros tendem a subir.</p>
          </section>
        )}
      </div>

      {focus && (
        <section className="cartao" aria-labelledby="eco-focus">
          <h2 id="eco-focus"><Termo id="focus">O que o mercado espera (Focus)</Termo></h2>
          <p className="suave">Mediana das projeções de bancos e consultorias, pesquisa de {dataBR(focus.data)}.</p>
          <table className="tabela-focus">
            <thead>
              <tr><th scope="col">Indicador</th><th scope="col">Fim de {anoFocus}</th><th scope="col">Fim de {anoFocus + 1}</th></tr>
            </thead>
            <tbody>
              {['SELIC', 'IPCA', 'PIB', 'CAMBIO'].map((ind) => {
                const este = focus.itens.find((i) => i.indicador === ind && i.ano === anoFocus);
                const prox = focus.itens.find((i) => i.indicador === ind && i.ano === anoFocus + 1);
                if (!este && !prox) return null;
                const fmt = (i) => (!i ? '–' : ind === 'CAMBIO' ? reais(i.mediana) : taxa(i.mediana));
                const seta = (i) => (!i || i.anterior == null || Number(i.anterior) === Number(i.mediana) ? ''
                  : Number(i.mediana) > Number(i.anterior) ? ' ↑' : ' ↓');
                return (
                  <tr key={ind}>
                    <th scope="row">{NOMES_FOCUS[ind][0]}</th>
                    <td className="num">{fmt(este)}<span className="suave">{seta(este)}</span></td>
                    <td className="num">{fmt(prox)}<span className="suave">{seta(prox)}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {focus.data_anterior && <p className="nota">As setas mostram se a projeção subiu ou caiu desde {dataBR(focus.data_anterior)}.</p>}
        </section>
      )}
    </div>
  );
}
