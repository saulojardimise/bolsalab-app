import { useEffect, useState } from 'react';
import Icone from '../componentes/Icone.jsx';

// Mais > Desafio 2027: informações do Desafio Carteira Recomendada.
// Por enquanto (antes das inscrições) é só informativa e leva ao site do desafio.
// Quando houver inscrição, quem estiver numa equipe verá aqui a situação dela.
export const SITE_DESAFIO = 'https://desafio.bolsalab.app';
const ABRE = Date.parse('2027-02-01T00:00:00-03:00');
const FECHA = Date.parse('2027-03-19T23:59:00-03:00');

const DATAS = [
  ['Inscrições das equipes', '01/02/2027 a 19/03/2027'],
  ['Envio da carteira inicial', '22/03/2027 a 25/03/2027'],
  ['Desafio, com rebalanceamento mensal', '29/03/2027 a 31/08/2027'],
  ['Final com as 8 melhores equipes', '17/09/2027'],
];

function falta(agora) {
  const alvo = agora < ABRE ? ABRE : FECHA;
  const ms = Math.max(0, alvo - agora);
  const d = Math.floor(ms / 864e5), h = Math.floor((ms % 864e5) / 36e5);
  if (agora >= FECHA) return 'Inscrições encerradas';
  const quando = agora < ABRE ? 'Inscrições abrem em' : 'Inscrições terminam em';
  return `${quando} ${d} ${d === 1 ? 'dia' : 'dias'} e ${h} h`;
}

export default function Desafio({ aoVoltar }) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setAgora(Date.now()), 60000);
    return () => clearInterval(t);
  }, []);
  const abertas = agora >= ABRE && agora < FECHA;

  return (
    <div className="pilha desafio">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>Desafio 2027</h1>
        <span style={{ width: 40 }} />
      </header>

      <section className="cartao desafio-capa" aria-labelledby="titulo-desafio">
        <span className="desafio-selo">CAMPOS DOS GOYTACAZES · 2027</span>
        <h2 id="titulo-desafio">Desafio Carteira <em>Recomendada</em> 2027</h2>
        <p>
          Equipes de 3 a 5 universitários de Campos dos Goytacazes montam uma carteira recomendada,
          defendem cada escolha por escrito e disputam com os preços reais da B3.
        </p>
        <p className="desafio-contagem" role="status">{falta(agora)}</p>
      </section>

      <section className="cartao desafio-pronto">
        <Icone nome="confere" tamanho={26} />
        <div>
          <strong>Você já cumpriu o primeiro passo</strong>
          <p>Só quem tem conta no BolsaLab pode se inscrever, e a sua já está criada. Chame os colegas da equipe para criarem a deles também.</p>
        </div>
      </section>

      <section aria-labelledby="titulo-datas">
        <h2 id="titulo-datas" className="secao-titulo">Calendário</h2>
        <ul className="cartao cartao-lista desafio-datas">
          {DATAS.map(([o_que, quando]) => (
            <li key={o_que}><span>{o_que}</span><strong>{quando}</strong></li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-como-funciona">
        <h2 id="titulo-como-funciona" className="secao-titulo">Como funciona</h2>
        <div className="cartao">
          <ul className="sobre-lista">
            <li>Equipes de <strong>3 a 5 alunos da mesma instituição</strong>, com um líder. Cada integrante envia o comprovante de matrícula.</li>
            <li>A carteira tem de <strong>3 a 7 ativos</strong>, em percentuais: ações, ETFs, BDRs, Tesouro, minicontratos e venda a descoberto.</li>
            <li>Cada ativo vem com uma tese, e a equipe escreve sobre o cenário econômico e como ele afeta a carteira.</li>
            <li>Todo mês há uma janela para rebalancear.</li>
            <li>As <strong>8 equipes com maior rentabilidade</strong> vão para a final e apresentam a carteira a uma banca de 3 avaliadores.</li>
          </ul>
        </div>
      </section>

      <a className="botao botao-principal" href={SITE_DESAFIO} target="_blank" rel="noopener">
        {abertas ? 'Inscrever minha equipe' : 'Ver o site do desafio'}
        <Icone nome="externo" tamanho={18} />
      </a>
      <p className="nota">Regulamento, prêmios e novos desafios em breve. Nada aqui é recomendação de investimento.</p>
    </div>
  );
}
