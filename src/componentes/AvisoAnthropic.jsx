import { useEffect, useRef } from 'react';
import { reais } from '../lib/formato.js';
import Logo from './Logo.jsx';
import Confete from './Confete.jsx';

// Novidade: BDR da Anthropic (ANTH34). Só para quem já usava o app antes desta atualização;
// quem cria a conta depois não vê (o guia de regras já mostra os BDRs). Aparece uma vez, até 05/12/2026.
export const AVISO_ANTH = 'bdr-anth34-2026-11';
const ANTES_DE = '2026-11-21T01:00:00-03:00';
const ATE = '2026-12-05';
const hojeBR = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const chaveLocal = (uid) => `bolsalab:aviso:${AVISO_ANTH}:${uid}`;

export function deveMostrarAvisoAnth(perfil, mercado) {
  if (!perfil || hojeBR() > ATE) return false;
  if (!mercado?.some((e) => e.ticker === 'ANTH34')) return false;          // só depois do SQL 050
  if (!(perfil.criado_em && new Date(perfil.criado_em) < new Date(ANTES_DE))) return false;
  if (perfil.avisos_vistos?.includes(AVISO_ANTH)) return false;
  try { if (localStorage.getItem(chaveLocal(perfil.user_id))) return false; } catch { /* sem armazenamento */ }
  return true;
}
export function lembrarAvisoAnthLocal(uid) {
  try { localStorage.setItem(chaveLocal(uid), '1'); } catch { /* sem armazenamento */ }
}

export default function AvisoAnthropic({ ativo, aoVer, aoFechar }) {
  const dialogo = useRef(null);
  const titulo = useRef(null);
  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    titulo.current?.focus({ preventScroll: true });
    d.scrollTop = 0;
    return () => d.close();
  }, []);
  const preco = ativo?.preco != null ? Number(ativo.preco) : null;

  return (
    <dialog ref={dialogo} className="folha aviso-novidade" aria-labelledby="aviso-titulo"
            onCancel={(e) => { e.preventDefault(); aoFechar(); }}>
      <Confete />
      <div className="aviso-conteudo">
        <p className="aviso-chapeu"><span className="chip-novo">Novidade</span> no BolsaLab</p>
        <h2 id="aviso-titulo" ref={titulo} tabIndex={-1}>BDR da Anthropic disponível no simulador</h2>
        <div className="aviso-ativos">
          <div>
            <Logo ticker="ANTH34" url={ativo?.logo_url} tamanho={44} />
            <p><strong>ANTH34 · Anthropic</strong><br />empresa de inteligência artificial criadora do Claude.
              {preco != null && <> Último preço: <strong className="num">{reais(preco)}</strong>.</>}</p>
          </div>
        </div>
        <p>
          A Anthropic abriu capital na Nasdaq em 19/11/2026 e, no mesmo dia, o BDR estreou na B3. Cada 8 BDRs
          equivalem a 1 ação lá fora. No BolsaLab, ele funciona como os outros BDRs: mesma corretagem, mesmo
          horário e preço de fechamento.
        </p>
        <p className="aviso-alerta">
          Papel recém-listado: tem poucos dias de histórico e costuma oscilar muito. Nada aqui é recomendação de investimento.
        </p>
        <div className="aviso-botoes">
          <button className="botao botao-principal" onClick={aoVer}>Ver ANTH34</button>
          <button className="botao" onClick={aoFechar}>Fechar</button>
        </div>
      </div>
    </dialog>
  );
}
