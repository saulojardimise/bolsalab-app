// Comunidade no modo demonstração: colegas fictícios + as ordens de quem está usando a demo.
// Mesma interface da api do Supabase (comunidade, comentarios, reagir...).

const horasAtras = (h) => new Date(Date.now() - h * 3600e3).toISOString();

// [id, nome, grupo, horas, origem, ativo (WIN/WDO para futuro), lado, qtd, preço (null = do mercado), tese, reações]
const COLEGAS = [
  [1, 'Bruno Lima', 'ADM 3º período', 30, 'acao', 'VALE3', 'compra', 200, 55.4,
    'O minério subiu na China e a Vale paga bons dividendos. Pretendo ficar alguns meses.', { curtir: 3, palmas: 2 }],
  [2, 'Diego Rocha', 'ADM 5º período', 26, 'futuro', 'WIN', 'compra', 2, -0.006,
    'Ibovespa caiu demais depois da eleição. Aposta curta em recuperação.', { surpresa: 2, curtir: 1 }],
  [3, 'Gabriela Tavares', 'ADM 3º período', 20, 'acao', 'MGLU3', 'venda_descoberto', 300, 9.8,
    'Varejo sofrendo com juros altos. Se passar de R$ 10,50 eu recompro.', { risada: 2, duvida: 1 }],
  [4, 'Helena Castro', 'Finanças UFF', 12, 'acao', 'ITUB4', 'compra', 100, 37.9, null, { curtir: 1 }],
  [5, 'Carla Menezes', 'ADM 3º período', 8, 'acao', 'WEGE3', 'venda', 50, 44.8,
    'Realizei o lucro: subiu 6% em duas semanas.', { palmas: 4 }],
  [6, 'Felipe Arruda', 'ADM 5º período', 5, 'futuro', 'WDO', 'compra', 1, -0.004,
    'Dólar deve subir com a incerteza fiscal.', {}],
];

export function criarComunidadeDemo({ ordens, futurosOrdens, perfil, contratos, precoDe, ehGestor }) {
  const teses = {};        // id da publicação -> tese
  const reacoes = {};      // id -> { contagem, minha }
  const ocultas = new Set();
  let proxComentario = 10;
  const comentarios = [
    { id: 1, pub: 1, nome: 'Carla Menezes', grupo: 'ADM 3º período', texto: 'Também gosto, mas cuidado: o minério oscila muito.', criado_em: horasAtras(28), oculto: false },
    { id: 2, pub: 1, nome: 'Diego Rocha', grupo: 'ADM 5º período', texto: 'Qual seu preço para sair se der errado?', criado_em: horasAtras(25), oculto: false },
    { id: 3, pub: 3, nome: 'Bruno Lima', grupo: 'ADM 3º período', texto: 'Corajosa! O aluguel não pesa?', criado_em: horasAtras(18), oculto: false },
  ];
  const denuncias = [];
  for (const c of COLEGAS) reacoes[c[0]] = { contagem: { ...c[10] }, minha: null };

  async function todas() {
    const fut = await contratos();
    const colegas = COLEGAS.map(([id, nome, grupo, h, origem, ativo, lado, quantidade, preco, tese]) => {
      const c = origem === 'futuro' ? fut.find((f) => f.ativo === ativo) : null;
      const precoOp = c ? (ativo === 'WIN' ? Math.round(c.preco * (1 + preco) / 5) * 5 : Math.round(c.preco * (1 + preco) * 2) / 2) : preco;
      return {
        id, criado_em: horasAtras(h), nome, foto_url: null, grupo, eu: false, origem,
        ativo: c ? c.contrato : ativo, base: c ? ativo : null, lado, quantidade, preco: precoOp,
        preco_atual: c ? c.preco : precoDe(ativo), tese,
      };
    });
    const p = perfil();
    const eu = { nome: p.nome, foto_url: p.foto_url ?? null, grupo: p.turma, eu: true };
    const minhas = [
      ...ordens().filter((o) => !o.automatica).map((o) => ({
        id: 1000 + o.id, criado_em: o.criado_em, ...eu, origem: 'acao', ativo: o.ticker, base: null,
        lado: o.tipo, quantidade: o.quantidade, preco: o.preco, preco_atual: precoDe(o.ticker), tese: null,
      })),
      ...futurosOrdens().map((o) => ({
        id: 5000 + o.id, criado_em: o.criado_em, ...eu, origem: 'futuro', ativo: o.contrato, base: o.ativo,
        lado: o.lado, quantidade: o.quantidade, preco: o.preco,
        preco_atual: fut.find((f) => f.contrato === o.contrato)?.preco ?? null, tese: null,
      })),
    ];
    return [...colegas, ...minhas].map((x) => {
      const r = reacoes[x.id] ?? (reacoes[x.id] = { contagem: {}, minha: null });
      const contagem = Object.fromEntries(Object.entries(r.contagem).filter(([, n]) => n > 0));
      return {
        ...x, tese: teses[x.id] ?? x.tese, reacoes: contagem, minha_reacao: r.minha, oculta: ocultas.has(x.id),
        comentarios: comentarios.filter((c) => c.pub === x.id && (ehGestor() || !c.oculto)).length,
      };
    }).filter((x) => ehGestor() || !x.oculta).sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  }

  return {
    async comunidade(escopo = 'todos', antes = null, limite = 20) {
      let lista = await todas();
      if (escopo === 'grupo') lista = lista.filter((x) => x.grupo === perfil().turma);
      if (antes != null) {
        const i = lista.findIndex((x) => x.id === antes);
        lista = i >= 0 ? lista.slice(i + 1) : [];
      }
      return lista.slice(0, limite);
    },
    async comentarios(pub) {
      return comentarios.filter((c) => c.pub === pub && (ehGestor() || !c.oculto))
        .map(({ pub: _, ...c }) => ({ ...c, foto_url: null, eu: c.nome === perfil().nome }));
    },
    async comentar(pub, texto) {
      const t = texto.trim();
      if (!t) throw new Error('Escreva o comentário.');
      if (t.length > 500) throw new Error('O comentário pode ter até 500 caracteres.');
      const id = proxComentario++;
      comentarios.push({ id, pub, nome: perfil().nome, grupo: perfil().turma, texto: t, criado_em: new Date().toISOString(), oculto: false });
      return id;
    },
    async apagarComentario(id) {
      const i = comentarios.findIndex((c) => c.id === id && (ehGestor() || c.nome === perfil().nome));
      if (i < 0) throw new Error('Comentário não encontrado.');
      comentarios.splice(i, 1);
    },
    async reagir(pub, tipo) {
      const r = reacoes[pub] ?? (reacoes[pub] = { contagem: {}, minha: null });
      if (r.minha) r.contagem[r.minha] -= 1;
      r.minha = !tipo || tipo === r.minha ? null : tipo;
      if (r.minha) r.contagem[r.minha] = (r.contagem[r.minha] ?? 0) + 1;
      return r.minha;
    },
    async definirTese(origem, ordemId, tese) {
      teses[(origem === 'futuro' ? 5000 : 1000) + ordemId] = tese?.trim() || null;
    },
    async mostrarOperacoes(mostrar) { perfil().mostrar_operacoes = mostrar; return mostrar; },
    async denunciar(alvo, id, motivo = null) { denuncias.push({ alvo, id, motivo }); },
    async ocultarNaComunidade(alvo, id, ocultar = true) {
      if (alvo === 'publicacao') { if (ocultar) ocultas.add(id); else ocultas.delete(id); }
      else { const c = comentarios.find((x) => x.id === id); if (c) c.oculto = ocultar; }
      for (let i = denuncias.length - 1; i >= 0; i--) if (denuncias[i].alvo === alvo && denuncias[i].id === id) denuncias.splice(i, 1);
    },
    async descartarDenuncias(alvo, id) {
      for (let i = denuncias.length - 1; i >= 0; i--) if (denuncias[i].alvo === alvo && denuncias[i].id === id) denuncias.splice(i, 1);
    },
    async denunciasAbertas() {
      const lista = denuncias.length ? denuncias : [{ alvo: 'comentario', id: 3, motivo: 'Exemplo de denúncia' }];
      const c = comentarios.find((x) => x.id === 3);
      return lista.slice(0, 1).map((d) => ({
        alvo: d.alvo, alvo_id: d.id, publicacao_id: 3, autor: c?.nome ?? '—', grupo: c?.grupo ?? '',
        conteudo: c?.texto ?? '', denuncias: 1, motivos: [d.motivo].filter(Boolean), ultima: horasAtras(1),
      })).filter(() => c && !c.oculto);
    },
  };
}
