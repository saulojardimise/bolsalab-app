// Comunidade no modo demonstração: colegas fictícios + as ordens de quem está usando a demo.
// Mesma interface da api do Supabase (comunidade, comentarios, reagir...).

const horasAtras = (h) => new Date(Date.now() - h * 3600e3).toISOString();

// [id, nome, grupo, horas, origem, ativo (WIN/WDO para futuro), lado, qtd, preço (null = do mercado), tese, reações]
const COLEGAS = [
  [1, 'Bruno Lima', 'ADM 3º período', 30, 'acao', 'VALE3', 'compra', 200, 55.4, null, { curtir: 3, palmas: 2 }],
  [2, 'Diego Rocha', 'ADM 5º período', 26, 'futuro', 'WIN', 'compra', 2, -0.006, null, { surpresa: 2, curtir: 1 }],
  [3, 'Gabriela Tavares', 'ADM 3º período', 20, 'acao', 'MGLU3', 'venda_descoberto', 300, 9.8, null, { risada: 2, duvida: 1 }],
  [4, 'Helena Castro', 'Finanças UFF', 12, 'acao', 'ITUB4', 'compra', 100, 37.9, null, { curtir: 1 }],
  [5, 'Carla Menezes', 'ADM 3º período', 8, 'acao', 'WEGE3', 'venda', 50, 44.8, null, { palmas: 4 }],
  [6, 'Felipe Arruda', 'ADM 5º período', 5, 'futuro', 'WDO', 'compra', 1, -0.004, null, {}],
];

export function criarComunidadeDemo({ ordens, futurosOrdens, perfil, contratos, precoDe, ehGestor, meusGrupos = () => [perfil().turma] }) {
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
  let vistas = null;   // última vez que abriu as notificações

  // notificações de exemplo sobre as ordens iniciais da Ana
  const opDe = (ticker, tipo) => {
    const o = ordens().find((x) => x.ticker === ticker && x.tipo === tipo);
    return o && { id: 1000 + o.id, operacao: { origem: 'acao', ativo: o.ticker, lado: o.tipo, quantidade: o.quantidade, preco: o.preco } };
  };
  function exemplos() {
    const itub = opDe('ITUB4', 'compra'); const petr = opDe('PETR4', 'venda'); const mglu = opDe('MGLU3', 'venda_descoberto');
    return [
      itub && { id: 'r1', tipo: 'reacao', criado_em: horasAtras(3), autor: 'Bruno Lima', reacao: 'palmas', publicacao_id: itub.id, operacao: itub.operacao },
      petr && { id: 'c1', tipo: 'comentario', criado_em: horasAtras(6), autor: 'Carla Menezes', texto: 'Boa hora para realizar o lucro!', publicacao_id: petr.id, operacao: petr.operacao },
      { id: 'a1', tipo: 'automatica', criado_em: horasAtras(15), titulo: 'Minicontrato zerado: WINZ26',
        texto: 'Exemplo: seu saldo ficou negativo (chamada de margem) e 1 contrato foi zerado a 131.005 pontos. Efeito no saldo: −R$ 120,00.' },
      mglu && { id: 'r2', tipo: 'reacao', criado_em: horasAtras(30), autor: 'Diego Rocha', reacao: 'surpresa', publicacao_id: mglu.id, operacao: mglu.operacao },
    ].filter(Boolean).map((n) => ({ foto_url: null, texto: null, titulo: null, reacao: null, ...n }));
  }
  let semeado = false;
  function semear() {
    if (semeado) return; semeado = true;
    for (const n of exemplos()) {
      if (n.tipo === 'reacao') reacoes[n.publicacao_id] = { contagem: { [n.reacao]: 1 }, minha: null };
      if (n.tipo === 'comentario') comentarios.push({ id: proxComentario++, pub: n.publicacao_id, nome: n.autor, grupo: 'ADM 3º período', texto: n.texto, criado_em: n.criado_em, oculto: false });
    }
  }
  for (const c of COLEGAS) reacoes[c[0]] = { contagem: { ...c[10] }, minha: null };

  async function todas() {
    semear();
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
    const eu = { nome: p.nome, foto_url: p.foto_url ?? null, grupo: meusGrupos().join(', '), eu: true };
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

  const notificacoes = () => { semear(); return exemplos().map((n) => ({ ...n, lida: vistas != null && n.criado_em <= vistas })); };

  return {
    async notificacoes() { return notificacoes(); },
    async notificacoesNaoLidas() { return notificacoes().filter((n) => !n.lida).length; },
    async marcarNotificacoesLidas() { vistas = new Date().toISOString(); },
    async comunidade(escopo = 'todos', antes = null, limite = 20) {
      let lista = await todas();
      if (escopo === 'grupo') lista = lista.filter((x) => x.eu || meusGrupos().some((g) => x.grupo.split(', ').includes(g)));
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
