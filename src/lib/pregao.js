import { agoraEmSaoPaulo } from './formato.js';

const FUSO = 'America/Sao_Paulo';
const DIAS = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
const iso = (d) => d.toISOString().slice(0, 10);

// Texto da faixa de status: se o aluno pode negociar agora e até quando.
// Quem decide de verdade é o banco (negociacao_liberada); aqui só explicamos.
// feriados: datas ('2026-11-20') sem pregão na B3; horas: quando a negociação abre e fecha nos dias úteis.
export function textoStatus({ liberada, pausada, demo = false, agora = new Date(), feriados = [], abre = 19, fecha = 9 }) {
  if (pausada) return { aberto: false, titulo: 'Negociação pausada', detalhe: 'O professor pausou as ordens por enquanto.' };
  if (demo && liberada) return { aberto: true, titulo: 'Negociação aberta', detalhe: 'Na demonstração, as ordens funcionam a qualquer hora.' };

  const { diaSemana, hora } = agoraEmSaoPaulo(agora);

  if (liberada) {
    // a negociação fecha às {fecha}h do próximo dia útil
    const semPregao = new Set(feriados);
    const hoje = new Date(`${agora.toLocaleDateString('en-CA', { timeZone: FUSO })}T12:00:00Z`);
    const util = (d) => d.getUTCDay() !== 0 && d.getUTCDay() !== 6 && !semPregao.has(iso(d));
    const feriadoHoje = diaSemana <= 5 && semPregao.has(iso(hoje));
    let dias = util(hoje) && hora < fecha ? 0 : 1;
    const d = new Date(hoje); d.setUTCDate(d.getUTCDate() + dias);
    while (!util(d) && dias < 15) { d.setUTCDate(d.getUTCDate() + 1); dias += 1; }

    let quando;
    if (dias === 0) quando = `as ${fecha}h`;
    else if (dias === 1) quando = `amanhã, às ${fecha}h`;
    else if (dias <= 6) quando = `${DIAS[(d.getUTCDay() + 6) % 7]}, às ${fecha}h`;
    else quando = `${String(d.getUTCDate()).padStart(2, '0')}/${String(d.getUTCMonth() + 1).padStart(2, '0')}, às ${fecha}h`;
    // dia útil, no horário do pregão e mesmo assim aberta: o banco sabe de um feriado que a lista não tem
    const foraDoHorario = diaSemana >= 6 || hora >= abre || hora < fecha;
    const detalhe = feriadoHoje || !foraDoHorario
      ? `Hoje é feriado na B3. Aberta até ${quando}.`
      : `Aberta até ${quando}.`;
    return { aberto: true, titulo: 'Negociação aberta', detalhe };
  }
  return {
    aberto: false,
    titulo: 'Negociação fechada',
    detalhe: `A bolsa está funcionando. Abre às ${abre}h, com os preços de fechamento de hoje.`,
  };
}

/** Milissegundos até a próxima virada de horário (abre ou fecha), para atualizar a faixa na hora certa. */
export function ateProximaVirada({ agora = new Date(), abre = 19, fecha = 9 } = {}) {
  const p = new Intl.DateTimeFormat('en-US', { timeZone: FUSO, hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
    .formatToParts(agora).reduce((o, x) => ({ ...o, [x.type]: Number(x.value) }), {});
  const seg = p.hour * 3600 + p.minute * 60 + p.second;
  const alvos = [abre * 3600, fecha * 3600, abre * 3600 + 86400, fecha * 3600 + 86400];
  return (Math.min(...alvos.filter((a) => a > seg)) - seg) * 1000;
}
