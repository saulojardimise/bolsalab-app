import { useEffect, useRef } from 'react';

// Boas-vindas ao Desafio de Natal: aparece uma vez para quem tem a conquista "natal"
// (o gestor marca), até 31/12/2026. Pisca-pisca no topo e o Papai Noel num touro bravo.
export const AVISO_NATAL = 'desafio-natal-2026';
const ATE = '2026-12-31';
const hojeBR = () => new Date().toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
const chaveLocal = (uid) => `bolsalab:aviso:${AVISO_NATAL}:${uid}`;

export function deveMostrarAvisoNatal(perfil, conquistas) {
  if (!perfil || hojeBR() > ATE || !conquistas?.includes('natal')) return false;
  if (perfil.avisos_vistos?.includes(AVISO_NATAL)) return false;
  try { if (localStorage.getItem(chaveLocal(perfil.user_id))) return false; } catch { /* sem armazenamento */ }
  return true;
}
export function lembrarAvisoNatalLocal(uid) {
  try { localStorage.setItem(chaveLocal(uid), '1'); } catch { /* sem armazenamento */ }
}

const LAMPADAS = ['#FF4D4D', '#FFD166', '#3DDCAA', '#4D9DFF', '#FF8AD8'];

function PiscaPisca() {
  const n = 15;
  return (
    <svg className="pisca-pisca" viewBox="0 0 300 34" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0,6 Q10,20 20,8 T40,8 T60,8 T80,8 T100,8 T120,8 T140,8 T160,8 T180,8 T200,8 T220,8 T240,8 T260,8 T280,8 T300,6"
            fill="none" stroke="#1E3A2B" strokeWidth="1.6" />
      {Array.from({ length: n }, (_, i) => {
        const x = 10 + i * 20;
        const cor = LAMPADAS[i % LAMPADAS.length];
        return (
          <g key={i} transform={`translate(${x},14)`}>
            <rect x="-2.5" y="-3" width="5" height="4" rx="1" fill="#2B4A39" />
            <ellipse className="lampada" cy="7" rx="4.2" ry="6.5" fill={cor} style={{ color: cor, animationDelay: `${(i % 3) * 0.45}s` }} />
          </g>
        );
      })}
    </svg>
  );
}

function NoelNoTouro() {
  return (
    <svg className="noel-touro" viewBox="0 0 320 205" role="img" aria-label="Papai Noel montado num touro bravo da bolsa, pulando">
      <ellipse className="sombra" cx="160" cy="194" rx="90" ry="7" fill="#0B2D5B" opacity=".14" />
      <g className="poeira" fill="#C9B79C">
        <circle cx="92" cy="188" r="6" /><circle cx="80" cy="184" r="4" /><circle cx="232" cy="188" r="6" /><circle cx="246" cy="184" r="4" />
      </g>
      <g className="rodeio">
        {/* rabo */}
        <path d="M84,112 Q58,104 62,80" fill="none" stroke="#4A2E20" strokeWidth="5" strokeLinecap="round" />
        <ellipse cx="62" cy="76" rx="6" ry="8" fill="#2E1C13" />
        {/* pernas */}
        <g fill="#4A2E20">
          <rect className="perna-tras" x="98" y="138" width="16" height="42" rx="6" />
          <rect className="perna-tras" x="124" y="142" width="16" height="38" rx="6" />
          <rect className="perna-frente" x="180" y="142" width="16" height="38" rx="6" />
          <rect className="perna-frente" x="204" y="138" width="16" height="42" rx="6" />
        </g>
        <g fill="#1B1B1B">
          <rect x="97" y="176" width="18" height="8" rx="3" /><rect x="123" y="176" width="18" height="8" rx="3" />
          <rect x="179" y="176" width="18" height="8" rx="3" /><rect x="203" y="176" width="18" height="8" rx="3" />
        </g>
        {/* corpo */}
        <ellipse cx="156" cy="124" rx="74" ry="38" fill="#5B3A29" />
        <path d="M110,108 Q156,96 200,108" fill="none" stroke="#6E4A36" strokeWidth="6" strokeLinecap="round" />
        {/* cabeça */}
        <path d="M214,96 Q206,70 196,60" fill="none" stroke="#F1E3C8" strokeWidth="7" strokeLinecap="round" />
        <path d="M250,96 Q264,74 262,58" fill="none" stroke="#F1E3C8" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="208" cy="102" rx="9" ry="6" fill="#4A2E20" transform="rotate(-25 208 102)" />
        <ellipse cx="234" cy="112" rx="28" ry="26" fill="#5B3A29" />
        <ellipse cx="248" cy="128" rx="18" ry="13" fill="#C98B6B" />
        <circle cx="242" cy="128" r="2.6" fill="#3A2117" /><circle cx="254" cy="128" r="2.6" fill="#3A2117" />
        <circle cx="236" cy="106" r="6" fill="#fff" /><circle cx="238" cy="107" r="3" fill="#C62828" />
        <path d="M226,96 L246,102" stroke="#1B1B1B" strokeWidth="4" strokeLinecap="round" />
        <circle cx="248" cy="122" r="3.5" fill="none" stroke="#D9B44A" strokeWidth="2.2" />
        {/* bufada */}
        <g className="bufada" fill="#fff">
          <circle cx="274" cy="132" r="5" /><circle cx="284" cy="126" r="4" /><circle cx="292" cy="134" r="3" />
        </g>
        {/* rédea */}
        <path d="M150,82 Q190,74 226,94" fill="none" stroke="#8B5A2B" strokeWidth="2.5" />
        {/* Papai Noel */}
        <g className="noel">
          <rect x="140" y="92" width="12" height="20" rx="5" fill="#D63C3C" />
          <ellipse cx="146" cy="116" rx="9" ry="6" fill="#1B1B1B" />
          <ellipse cx="142" cy="74" rx="21" ry="24" fill="#D63C3C" />
          <rect x="121" y="78" width="42" height="7" fill="#1B1B1B" />
          <rect x="137" y="77" width="10" height="9" rx="1.5" fill="none" stroke="#FFD166" strokeWidth="2.2" />
          <path d="M142,52 L142,96" stroke="#fff" strokeWidth="5" opacity=".9" />
          {/* braço na rédea */}
          <path d="M130,68 Q138,82 150,82" fill="none" stroke="#D63C3C" strokeWidth="8" strokeLinecap="round" />
          <circle cx="151" cy="82" r="5" fill="#fff" />
          {/* braço para cima */}
          <g className="braco">
            <path d="M156,64 Q168,52 172,36" fill="none" stroke="#D63C3C" strokeWidth="8" strokeLinecap="round" />
            <circle cx="172" cy="33" r="5.5" fill="#fff" />
          </g>
          {/* cabeça */}
          <circle cx="142" cy="44" r="13" fill="#F6D2B5" />
          <path d="M127,44 Q127,68 142,70 Q157,68 157,44 Q150,52 142,52 Q134,52 127,44Z" fill="#fff" />
          <path d="M134,52 Q138,48 142,51 Q146,48 150,52 Q146,55 142,53 Q138,55 134,52Z" fill="#fff" />
          <circle cx="142" cy="47" r="2.4" fill="#E88C7A" />
          <circle cx="137" cy="41" r="1.6" fill="#3A2A20" /><circle cx="147" cy="41" r="1.6" fill="#3A2A20" />
          <path d="M129,34 L156,34 L150,16 Q140,6 124,14 Z" fill="#D63C3C" />
          <rect x="126" y="31" width="32" height="7" rx="3.5" fill="#fff" />
          <circle cx="123" cy="15" r="5" fill="#fff" />
        </g>
      </g>
    </svg>
  );
}

export default function AvisoNatal({ nome, aoFechar }) {
  const dialogo = useRef(null);
  const titulo = useRef(null);
  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    titulo.current?.focus({ preventScroll: true });
    d.scrollTop = 0;
    return () => d.close();
  }, []);
  const primeiro = (nome || '').trim().split(/\s+/)[0];

  return (
    <dialog ref={dialogo} className="folha aviso-novidade aviso-natal" aria-labelledby="natal-titulo"
            onCancel={(e) => { e.preventDefault(); aoFechar(); }}>
      <PiscaPisca />
      <div className="aviso-conteudo">
        <NoelNoTouro />
        <p className="aviso-chapeu"><span className="chip-natal">Desafio de Natal</span> no BolsaLab</p>
        <h2 id="natal-titulo" ref={titulo} tabIndex={-1}>
          {primeiro ? `${primeiro}, boas-vindas ao Desafio de Natal!` : 'Boas-vindas ao Desafio de Natal!'}
        </h2>
        <p>
          Você está no Desafio de Natal do BolsaLab. Para todo mundo largar do mesmo ponto,
          <strong> sua carteira foi zerada</strong>: você recomeça com <strong className="num">R$ 10.000,00</strong> virtuais.
        </p>
        <p className="natal-data"><span>O desafio vai até</span><strong>31/12/2026</strong></p>
        <p>Monte sua estratégia, acompanhe o ranking e segure firme no touro. A medalha do Desafio de Natal já aparece no seu perfil.</p>
        <p className="nota">Nada aqui é recomendação de investimento.</p>
        <div className="aviso-botoes">
          <button className="botao botao-principal" onClick={aoFechar}>Bora investir!</button>
        </div>
      </div>
    </dialog>
  );
}
