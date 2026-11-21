import { useEffect, useRef } from 'react';

// Explosão de confete por cima de tudo (duas rajadas, dos cantos de baixo e do centro).
// Fica dentro do <dialog> para aparecer acima do fundo escurecido; não captura toques.
// Quem pediu menos movimento no sistema não vê a animação.
const CORES = ['#12B886', '#3DDCAA', '#0B2D5B', '#3B82F6', '#FFD166', '#FF7A59'];

export default function Confete({ duracao = 3200 }) {
  const tela = useRef(null);
  useEffect(() => {
    try { if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined; } catch { /* segue */ }
    const c = tela.current; const ctx = c?.getContext?.('2d');
    if (!ctx) return undefined;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ajustar = () => { c.width = innerWidth * dpr; c.height = innerHeight * dpr; };
    ajustar();
    const W = () => c.width / dpr; const H = () => c.height / dpr;
    const pecas = [];
    const rajada = (x, y, n, angulo, abertura, forca, atraso) => {
      for (let i = 0; i < n; i++) {
        const a = angulo + (Math.random() - 0.5) * abertura; const v = forca * (0.55 + Math.random() * 0.6);
        pecas.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, atraso,
          w: 6 + Math.random() * 7, h: 4 + Math.random() * 5, cor: CORES[i % CORES.length],
          giro: Math.random() * 6, vg: (Math.random() - 0.5) * 12, fase: Math.random() * 6, redondo: Math.random() < 0.25 });
      }
    };
    const w = W(), h = H(), f = Math.max(w, h) * 1.25;
    rajada(0, h * 0.85, 70, -Math.PI / 3.2, 0.9, f, 0);
    rajada(w, h * 0.85, 70, -Math.PI + Math.PI / 3.2, 0.9, f, 0);
    rajada(w / 2, h * 0.42, 60, -Math.PI / 2, Math.PI * 1.6, f * 0.6, 0.35);
    let inicio = null; let quadro;
    const passo = (agora) => {
      if (inicio == null) inicio = agora;
      const t = (agora - inicio) / 1000;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W(), H());
      for (const p of pecas) {
        const u = t - p.atraso; if (u < 0) continue;
        const freio = (1 - Math.exp(-1.8 * u)) / 1.8;              // resistência do ar
        const x = p.x + p.vx * freio + Math.sin(u * 3 + p.fase) * 14;
        const y = p.y + p.vy * freio + 520 * u * u * 0.5 + 60 * u;  // gravidade
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, (duracao / 1000 - t) / 0.8));
        ctx.translate(x, y); ctx.rotate(p.giro + p.vg * u); ctx.scale(1, Math.cos(u * 8 + p.fase));
        ctx.fillStyle = p.cor;
        if (p.redondo) { ctx.beginPath(); ctx.arc(0, 0, p.h / 1.6, 0, Math.PI * 2); ctx.fill(); }
        else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      }
      if (t * 1000 < duracao) quadro = requestAnimationFrame(passo);
      else ctx.clearRect(0, 0, W(), H());
    };
    quadro = requestAnimationFrame(passo);
    addEventListener('resize', ajustar);
    return () => { cancelAnimationFrame(quadro); removeEventListener('resize', ajustar); };
  }, [duracao]);
  return <canvas ref={tela} className="confete" aria-hidden="true" />;
}
