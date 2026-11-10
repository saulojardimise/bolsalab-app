import { horaBR } from '../lib/intradia.js';
import { pct, reais, reaisComSinal, tendencia } from '../lib/formato.js';
import Termo from './Termo.jsx';

// "Hoje, até 13h30: +R$ 120,35 (+1,21%)" — oscilação da carteira com a cotação do dia
export function LinhaHoje({ oscilacao, patrimonio }) {
  if (!oscilacao) return null;
  const p = patrimonio > 0 ? (oscilacao.valor / (patrimonio - oscilacao.valor)) * 100 : null;
  return (
    <p className="linha-hoje">
      <span className="ponto-vivo" aria-hidden="true" />
      <span className="suave">Hoje, até {horaBR(oscilacao.horario)} <Termo id="cotacao_do_dia" />:</span>{' '}
      <strong className={`num ${tendencia(oscilacao.valor)}`}>
        {reaisComSinal(oscilacao.valor)}{p != null && ` (${pct(p)})`}
      </strong>
    </p>
  );
}

// "Agora: R$ 38,76 (+2,00%) · cotação das 13h30" — preço do dia de uma ação ou minicontrato
export function PrecoAgora({ agora, formatar = reais }) {
  if (!agora) return null;
  return (
    <p className="linha-hoje">
      <span className="ponto-vivo" aria-hidden="true" />
      <span className="suave">Agora</span>{' '}
      <strong className="num">{formatar(agora.preco)}</strong>{' '}
      <strong className={`num ${tendencia(agora.variacao_pct)}`}>({pct(agora.variacao_pct)})</strong>{' '}
      <span className="suave">· cotação das {horaBR(agora.horario)} <Termo id="cotacao_do_dia" /></span>
    </p>
  );
}

// "Valor estimado com a cotação das 14h00. Ordens e ranking usam o fechamento: R$ 10.512,16."
export function NotaEstimado({ resumo }) {
  if (!resumo?.estimadoAs) return null;
  return (
    <p className="nota-estimado">
      Valor estimado com a cotação das {horaBR(resumo.estimadoAs)}. Ordens e ranking usam o fechamento: <span className="num">{reais(resumo.noFechamento)}</span>.
    </p>
  );
}
