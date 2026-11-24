import { useEffect, useMemo, useState } from 'react';
import { api } from '../../api/index.js';
import { pct, reais, tendencia } from '../../lib/formato.js';
import Avatar from '../../componentes/Avatar.jsx';
import BotaoPessoa from '../../componentes/BotaoPessoa.jsx';
import Icone from '../../componentes/Icone.jsx';

// Relatório de desempenho: escolhe o grupo e o período; vem do mais rentável para o menos rentável,
// com foto, nome, desde quando usa o app, operações e rentabilidade no período.
// Baixa em planilha (CSV) ou imprime/salva em PDF.

const hojeISO = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const dataBR = (iso) => (iso ? new Date(`${String(iso).slice(0, 10)}T12:00:00`).toLocaleDateString('pt-BR') : '–');

// atalhos de período -> [de, até] (de = null: desde o início da conta)
function periodo(atalho, de, ate) {
  const hoje = hojeISO(), [a, m] = hoje.split('-').map(Number);
  const iso = (ano, mes, dia) => `${ano}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
  if (atalho === 'inicio') return [null, hoje];
  if (atalho === 'mes') return [iso(a, m, 1), hoje];
  if (atalho === 'mes-passado') {
    const ano = m === 1 ? a - 1 : a, mes = m === 1 ? 12 : m - 1;
    return [iso(ano, mes, 1), iso(ano, mes, new Date(ano, mes, 0).getDate())];
  }
  if (atalho === '30') { const d = new Date(`${hoje}T12:00:00`); d.setDate(d.getDate() - 29); return [d.toLocaleDateString('en-CA'), hoje]; }
  return [de || null, ate || hoje];
}

const ATALHOS = [['inicio', 'Desde o início'], ['mes', 'Este mês'], ['mes-passado', 'Mês passado'], ['30', 'Últimos 30 dias'], ['datas', 'Escolher datas']];

export default function Relatorio() {
  const [grupos, setGrupos] = useState([]);
  const [grupo, setGrupo] = useState('');          // '' = todos, '0' = sem grupo
  const [atalho, setAtalho] = useState('inicio');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState(hojeISO());
  const [linhas, setLinhas] = useState(null);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { api.turmas().then((t) => setGrupos(t ?? [])).catch(() => setGrupos([])); }, []);

  const [pDe, pAte] = periodo(atalho, de, ate);
  useEffect(() => {
    if (atalho === 'datas' && pDe && pAte && pDe > pAte) { setErro('A data inicial é depois da final.'); return; }
    let vivo = true;
    setCarregando(true); setErro('');
    api.relatorioGrupo(grupo === '' ? null : Number(grupo), pDe, pAte)
      .then((l) => { if (vivo) setLinhas(l); })
      .catch((e) => { if (vivo) { setErro(e.message); setLinhas(null); } })
      .finally(() => vivo && setCarregando(false));
    return () => { vivo = false; };
  }, [grupo, pDe, pAte, atalho]);

  const nomeGrupo = grupo === '' ? 'Todos os alunos' : grupo === '0' ? 'Sem grupo' : (grupos.find((g) => String(g.id) === grupo)?.nome ?? 'Grupo');
  const textoPeriodo = pDe ? `${dataBR(pDe)} a ${dataBR(pAte)}` : `desde o início até ${dataBR(pAte)}`;
  const resumo = useMemo(() => {
    if (!linhas?.length) return null;
    const r = linhas.map((l) => Number(l.rentabilidade_pct)).filter(Number.isFinite);
    return {
      media: r.reduce((s, v) => s + v, 0) / r.length,
      ops: linhas.reduce((s, l) => s + Number(l.operacoes), 0),
      semOps: linhas.filter((l) => Number(l.operacoes) === 0).length,
    };
  }, [linhas]);

  function baixar() {
    const cab = ['Posição', 'Nome', 'E-mail', 'No app desde', 'Primeira operação', 'Operações no período', 'Patrimônio inicial', 'Patrimônio final', 'Rentabilidade (%)'];
    const num = (v) => String(v ?? '').replace('.', ',');
    const cel = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const corpo = linhas.map((l) => [l.posicao, l.nome, l.email, dataBR(l.criado_em), l.primeira_operacao ? dataBR(l.primeira_operacao) : '',
      l.operacoes, num(l.patrimonio_inicio), num(l.patrimonio_fim), num(l.rentabilidade_pct)].map(cel).join(';'));
    const titulo = [cel(`BolsaLab · ${nomeGrupo} · ${textoPeriodo}`)];
    const csv = '﻿' + [titulo, '', cab.map(cel).join(';'), ...corpo].join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${nomeGrupo.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-')}-${(pDe ?? 'inicio')}-a-${pAte}.csv`;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="pilha relatorio">
      <h1>Relatório de desempenho</h1>

      <section className="cartao relatorio-filtros no-print" aria-label="Filtros">
        <label className="campo">
          <span>Grupo</span>
          <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
            <option value="">Todos os alunos</option>
            {grupos.map((g) => <option key={g.id} value={String(g.id)}>{g.nome}</option>)}
            <option value="0">Sem grupo</option>
          </select>
        </label>
        <div>
          <span className="rotulo-periodo">Período</span>
          <div className="chips chips-quebram" role="group" aria-label="Período">
            {ATALHOS.map(([id, nome]) => <button key={id} aria-pressed={atalho === id} onClick={() => { if (id === 'datas' && !de) setDe(`${hojeISO().slice(0, 8)}01`); setAtalho(id); }}>{nome}</button>)}
          </div>
        </div>
        {atalho === 'datas' && (
          <div className="relatorio-datas">
            <label className="campo"><span>De</span><input type="date" value={de} max={ate || hojeISO()} onChange={(e) => setDe(e.target.value)} /></label>
            <label className="campo"><span>Até</span><input type="date" value={ate} max={hojeISO()} onChange={(e) => setAte(e.target.value)} /></label>
          </div>
        )}
        <p className="suave relatorio-nota">
          Rentabilidade no período: do patrimônio no fechamento do dia anterior ao início até o fechamento do último dia
          (quem começou dentro do período parte de R$ 10.000). Operações: ordens feitas pela pessoa, sem as automáticas.
        </p>
      </section>

      {erro && <p className="erro" role="alert">{erro}</p>}

      {linhas && (
        <section aria-labelledby="titulo-relatorio">
          <div className="relatorio-cabeca">
            <div>
              <h2 id="titulo-relatorio" className="secao-titulo">{nomeGrupo}</h2>
              <p className="suave">{textoPeriodo} · {linhas.length} {linhas.length === 1 ? 'pessoa' : 'pessoas'}
                {resumo && <> · média <span className={`num ${tendencia(resumo.media)}`}>{pct(Math.round(resumo.media * 100) / 100)}</span>
                  {' · '}{resumo.ops} operações{resumo.semOps ? ` · ${resumo.semOps} sem operar` : ''}</>}</p>
            </div>
            {linhas.length > 0 && (
              <div className="relatorio-acoes no-print">
                <button className="botao botao-compacto" onClick={baixar}><Icone nome="baixar" tamanho={18} /> Planilha</button>
                <button className="botao botao-compacto" onClick={() => window.print()}><Icone nome="extrato" tamanho={18} /> Imprimir / PDF</button>
              </div>
            )}
          </div>

          {linhas.length === 0 ? <p className="cartao vazio">Ninguém neste grupo no período.</p> : (
            <ol className={`cartao cartao-lista ranking ranking-gestor relatorio-lista ${carregando ? 'carregando-leve' : ''}`}>
              {linhas.map((l) => (
                <li key={l.user_id}>
                  <span className="ranking-pos num">{l.posicao}º</span>
                  <Avatar foto={l.foto_url} tamanho={40} />
                  <span className="ranking-nome">
                    <span className="aluno-topo">
                      <BotaoPessoa id={l.user_id}><strong>{l.nome || 'Sem nome'}</strong></BotaoPessoa>
                      <strong className={`num ${tendencia(l.rentabilidade_pct)}`}>{pct(l.rentabilidade_pct)}</strong>
                    </span>
                    <small>
                      No app desde {dataBR(l.criado_em)}
                      {l.primeira_operacao ? ` · 1ª operação em ${dataBR(l.primeira_operacao)}` : ' · nunca operou'}
                    </small>
                    <small>
                      <span className="num">{l.operacoes}</span> {Number(l.operacoes) === 1 ? 'operação' : 'operações'} no período
                      {' · '}<span className="num">{reais(l.patrimonio_inicio)}</span> → <span className="num">{reais(l.patrimonio_fim)}</span>
                    </small>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}
      {!linhas && !erro && <p className="cartao vazio">Carregando…</p>}
    </div>
  );
}
