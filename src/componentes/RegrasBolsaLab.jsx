import { useEffect, useRef } from 'react';
import { reais } from '../lib/formato.js';
import Icone from './Icone.jsx';

// Guia "Como funciona o BolsaLab": aparece uma vez para cada pessoa e fica
// sempre à mão em Mais > Regras do BolsaLab.
export const AVISO_REGRAS = 'regras-2026-11';
const chaveLocal = (uid) => `bolsalab:aviso:${AVISO_REGRAS}:${uid}`;

export function deveMostrarRegras(perfil) {
  if (!perfil || perfil.avisos_vistos?.includes(AVISO_REGRAS)) return false;
  try { if (localStorage.getItem(chaveLocal(perfil.user_id))) return false; } catch { /* sem armazenamento */ }
  return true;
}
export function lembrarRegrasLocal(uid) {
  try { localStorage.setItem(chaveLocal(uid), '1'); } catch { /* sem armazenamento */ }
}

const pct = (v, padrao) => `${Math.round(Number(v ?? padrao) * 100)}%`;
const hora = (h) => `${Number(h)}h`;

export default function RegrasBolsaLab({ config = {}, mercado = [], aoFechar }) {
  const dialogo = useRef(null);
  const titulo = useRef(null);
  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    // o navegador põe o foco no botão lá embaixo e rola até ele: volta ao topo
    titulo.current?.focus({ preventScroll: true });
    d.scrollTop = 0;
    return () => d.close();
  }, []);

  const c = {
    saldo: config.saldo_inicial ?? 10000,
    corretagem: config.corretagem ?? 7.9,
    corretagemFut: config.corretagem_futuros ?? 10,
    abre: config.hora_abre ?? 19,
    fecha: config.hora_fecha ?? 9,
    margemWin: config.margem_win ?? 900,
    margemWdo: config.margem_wdo ?? 1500,
  };
  const nEtfs = mercado.filter((e) => e.tipo === 'etf').length;
  const nAcoes = mercado.length - nEtfs;

  return (
    <dialog ref={dialogo} className="folha aviso-novidade regras" aria-labelledby="aviso-titulo"
            onCancel={(e) => { e.preventDefault(); aoFechar(); }}>
      <div className="aviso-conteudo">
        <p className="aviso-chapeu"><span className="chip-novo">Guia</span> antes de investir</p>
        <h2 id="aviso-titulo" ref={titulo} tabIndex={-1}>Como funciona o BolsaLab</h2>
        <p>
          Um simulador da bolsa com <strong>dinheiro virtual</strong> e <strong>preços reais da B3</strong>.
          Estas são as regras do jogo.
        </p>

        <div className="regras-resumo">
          <div>
            <Icone nome="saldo" tamanho={20} />
            <span>Dinheiro inicial</span>
            <strong>{reais(c.saldo)}</strong>
          </div>
          <div>
            <Icone nome="extrato" tamanho={20} />
            <span>Corretagem por ordem</span>
            <strong>{reais(c.corretagem)}</strong>
            <small>minicontratos: {reais(c.corretagemFut)}</small>
          </div>
          <div className="regras-resumo-largo">
            <Icone nome="eventos" tamanho={20} />
            <span>Horário para negociar</span>
            <strong>Dias úteis, das {hora(c.abre)} às {hora(c.fecha)}</strong>
            <small>fins de semana e feriados da B3: o dia todo</small>
          </div>
        </div>

        <h3>Quando e a que preço</h3>
        <ul className="aviso-passos">
          <li>As ordens são executadas pelo <strong>preço de fechamento</strong> do último pregão da B3.</li>
          <li>
            Por isso a negociação abre depois que o pregão termina: nos dias úteis, das {hora(c.abre)} às {hora(c.fecha)} do
            dia seguinte. Durante o pregão ela fica fechada, esperando o preço novo.
          </li>
          <li>A corretagem é cobrada em cada ordem, de compra ou de venda. Ela pesa mais em ordens pequenas.</li>
          <li>O professor pode pausar a negociação, por exemplo durante uma atividade.</li>
        </ul>

        <h3>O que dá para negociar</h3>
        <div className="regras-ativo">
          <p className="regras-ativo-topo"><strong>Ações</strong>{nAcoes > 0 && <span>{nAcoes} empresas do Ibovespa</span>}</p>
          <p>
            Uma ação é um pedaço de uma empresa: quem compra vira sócio. Você ganha se o preço subir e perde se cair.
            Exemplos: PETR4 (Petrobras), ITUB4 (Itaú), VALE3 (Vale). Dá para comprar a partir de 1 ação.
          </p>
        </div>
        <div className="regras-ativo">
          <p className="regras-ativo-topo"><strong>ETFs</strong>{nEtfs > 0 && <span>{nEtfs} fundos</span>}</p>
          <p>
            Um ETF é um fundo negociado na bolsa que copia um índice. Cada <strong>cota</strong> é uma cesta de ativos
            de uma vez só: BOVA11 segue o Ibovespa, IVVB11 as 500 maiores empresas dos EUA, GOLD11 o ouro.
            É um jeito simples de diversificar.
          </p>
        </div>
        <div className="regras-ativo">
          <p className="regras-ativo-topo"><strong>Minicontratos futuros</strong><span>WIN e WDO</span></p>
          <p>
            Um contrato futuro é um acordo de comprar ou vender algo numa data futura por um preço combinado hoje.
            O <strong>mini índice (WIN)</strong> acompanha o Ibovespa (R$ 0,20 por ponto) e o <strong>mini dólar (WDO)</strong>,
            o dólar (R$ 10 por ponto). Você não paga o contrato inteiro: deixa uma <strong>margem de garantia</strong> de
            {' '}{reais(c.margemWin)} (WIN) ou {reais(c.margemWdo)} (WDO). Por isso ele é <strong>alavancado</strong>:
            ganhos e perdas são grandes perto do dinheiro usado.
          </p>
        </div>

        <h3>Regras dos minicontratos</h3>
        <ul className="aviso-passos">
          <li><strong>Comprar</strong> ganha se o preço subir; <strong>vender</strong> ganha se cair. Não precisa ter o contrato para vender.</li>
          <li><strong>Ajuste diário:</strong> a cada novo preço, o ganho ou a perda do dia entra ou sai do seu saldo.</li>
          <li><strong>Vencimento:</strong> está no código: a letra é o mês e o número, o ano (WINZ26 = dezembro de 2026). Na data, a posição é encerrada sozinha.</li>
          <li><strong>Chamada de margem:</strong> se o saldo ficar negativo, seus minicontratos são zerados automaticamente.</li>
        </ul>

        <h3>Venda a descoberto</h3>
        <ul className="aviso-passos">
          <li>Você pode vender ações ou cotas que não tem, apostando na queda, e <strong>recomprar</strong> depois.</li>
          <li>O valor da venda fica bloqueado como <strong>garantia</strong> até a recompra.</li>
          <li>Você paga <strong>aluguel</strong> de {pct(config.aluguel_anual, 0.05)} ao ano pelos papéis emprestados, cobrado por dia útil.</li>
          <li>O total vendido a descoberto pode chegar a {pct(config.limite_descoberto, 0.4)} do seu saldo.</li>
          <li>Se o prejuízo chegar a {pct(config.stop_prejuizo, 0.8)} do saldo, a recompra é <strong>automática</strong>.</li>
        </ul>

        <h3>Outras regras</h3>
        <ul className="aviso-passos">
          <li>O <strong>ranking</strong> ordena pelo patrimônio: saldo mais o valor dos seus ativos. Como todos começam com {reais(c.saldo)}, é o mesmo que comparar a rentabilidade.</li>
          <li>Não há dividendos nem impostos. Os custos são a corretagem e o aluguel.</li>
          <li>Eventos das empresas, como troca de código e desdobramento, são registrados pelo professor e ajustam sua carteira.</li>
          <li>Suas operações aparecem na comunidade (ativo, tipo, quantidade e preço). Valores em reais ficam só para você e o professor.</li>
          <li>Uma conta por pessoa. Nada aqui é recomendação de investimento.</li>
        </ul>

        <div className="aviso-botoes">
          <button className="botao botao-principal" onClick={aoFechar}>Fechar</button>
        </div>
        <p className="nota">Para rever este guia, abra <strong>Mais › Regras do BolsaLab</strong>. Toque no "?" ao lado dos termos para ver as explicações.</p>
      </div>
    </dialog>
  );
}
