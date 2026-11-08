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
    { id: 4, pub: 3, nome: 'Gabriela Tavares', grupo: 'ADM 3º período', texto: 'Pesa um pouco, mas acho que cai mais.', criado_em: horasAtras(17), oculto: false, resposta_a: 3 },
    { id: 5, pub: 1, nome: 'Saulo Jardim', grupo: '', texto: 'Boa análise! Olhem também o preço do minério de ferro.', criado_em: horasAtras(24), oculto: false, professor: true },
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
      petr && { id: 'comentario-90', tipo: 'comentario', criado_em: horasAtras(6), autor: 'Carla Menezes', texto: 'Boa hora para realizar o lucro!', publicacao_id: petr.id, operacao: petr.operacao },
      { id: 'aviso-1', tipo: 'sistema', criado_em: horasAtras(1), titulo: 'Aluguel da venda a descoberto mudou',
        texto: 'Agora o aluguel é de 5% ao ano, para ações e ETFs, e é cobrado só em dias úteis, como na B3 (taxa anual com base em 252 dias úteis). Antes era 3% ao mês, cobrado todo dia. Vale a partir de hoje; o que já foi cobrado não muda.' },
      { id: 'a1', tipo: 'automatica', criado_em: horasAtras(15), titulo: 'Minicontrato zerado: WINZ26',
        texto: 'Exemplo: seu saldo ficou negativo (chamada de margem) e 1 contrato foi zerado a 131.005 pontos. Efeito no saldo: −R$ 120,00.' },
      mglu && { id: 'r2', tipo: 'reacao', criado_em: horasAtras(30), autor: 'Diego Rocha', reacao: 'surpresa', publicacao_id: mglu.id, operacao: mglu.operacao },
    ].filter(Boolean).map((n) => ({ foto_url: null, texto: null, titulo: null, reacao: null, ...n }))
      .sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  }
  let semeado = false;
  function semear() {
    if (semeado) return; semeado = true;
    for (const n of exemplos()) {
      if (n.tipo === 'reacao') reacoes[n.publicacao_id] = { contagem: { [n.reacao]: 1 }, minha: null };
      if (n.tipo === 'comentario') comentarios.push({ id: Number(n.id.slice(11)), pub: n.publicacao_id, nome: n.autor, grupo: 'ADM 3º período', texto: n.texto, criado_em: n.criado_em, oculto: false });
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
        lista_comentarios: comentarios.filter((c) => c.pub === x.id && (ehGestor() || !c.oculto))
          .map(({ pub: _, ...c }) => ({ resposta_a: null, professor: false, ...c, foto_url: null, eu: c.nome === p.nome })),
        ...x, tese: teses[x.id] ?? x.tese, reacoes: contagem, minha_reacao: r.minha, oculta: ocultas.has(x.id),
        comentarios: comentarios.filter((c) => c.pub === x.id && (ehGestor() || !c.oculto)).length,
      };
    }).filter((x) => ehGestor() || !x.oculta).sort((a, b) => b.criado_em.localeCompare(a.criado_em));
  }

  // ---------------- discussões ----------------
  const PROF = 'Saulo Jardim';
  const topicos = [
    { id: 1, titulo: 'WEGE3 está cara?', nome: 'Carla Menezes', grupo: 'ADM 3º período', ativo: 'WEGE3', h: 20,
      texto: 'Subiu muito no ano e o P/L passou de 30. Ainda vale entrar ou é melhor esperar uma correção?' },
    { id: 2, titulo: 'Mini dólar com R$ 10 mil: arriscado?', nome: 'Diego Rocha', grupo: 'ADM 5º período', ativo: 'WDO', h: 9,
      texto: 'Pensando em comprar 2 contratos de WDO. Alguém já testou?' },
    { id: 3, titulo: 'Como vocês escolhem em qual setor investir?', nome: PROF, grupo: '', fixado: true, h: 48,
      texto: 'Contem aqui o critério de vocês: dividendos, crescimento, notícias, intuição… Vamos discutir em aula.' },
    { id: 4, titulo: 'Petrobras vai investir mais: bom para o acionista?', nome: 'Felipe Arruda', grupo: 'ADM 5º período', h: 3,
      noticia_id: 2, noticia_titulo: 'Petrobras anuncia novo plano de investimentos para os próximos cinco anos', noticia_link: 'https://example.com/',
      texto: 'Mais investimento pode significar menos dividendo no curto prazo. O que acham?' },
  ].map((t) => ({ texto: '', ativo: null, noticia_id: null, noticia_titulo: null, noticia_link: null, fixado: false, ...t,
                  criado_em: horasAtras(t.h), atividade_em: horasAtras(t.h) }));
  let proxTopico = 10;
  let proxResposta = 10;
  const respostas = [
    { id: 1, topico: 1, nome: 'Bruno Lima', grupo: 'ADM 3º período', texto: 'Cara está, mas a empresa cresce todo ano.', h: 18 },
    { id: 2, topico: 1, nome: 'Gabriela Tavares', grupo: 'ADM 3º período', texto: 'Eu prefiro esperar o próximo balanço.', h: 17, resposta_a: 1 },
    { id: 3, topico: 2, nome: PROF, grupo: '', texto: 'Com R$ 1.500 de margem por contrato, 50 pontos de variação já mexem R$ 500 no saldo. Comecem com 1 contrato.', h: 8 },
    { id: 4, topico: 3, nome: 'Helena Castro', grupo: 'Finanças UFF', texto: 'Eu olho primeiro os dividendos dos últimos 5 anos.', h: 40 },
  ].map((r) => ({ resposta_a: null, ...r, criado_em: horasAtras(r.h) }));
  for (const t of topicos) {
    const ult = respostas.filter((r) => r.topico === t.id).map((r) => r.criado_em).sort().at(-1);
    if (ult) t.atividade_em = ult;
  }
  const quemSou = () => (ehGestor() ? PROF : perfil().nome);
  const formatarTopico = (t) => ({
    ...t, eu: t.nome === quemSou(), professor: t.nome === PROF, foto_url: null,
    respostas: respostas.filter((r) => r.topico === t.id).length,
  });
  const formatarResposta = (r) => ({ ...r, eu: r.nome === quemSou(), professor: r.nome === PROF, foto_url: null });

  const notificacoes = () => { semear(); return exemplos().map((n) => ({ ...n, lida: vistas != null && n.criado_em <= vistas })); };

  return {
    async topicos({ tipo = null, ativo = null, noticia = null, busca = null, limite = 30, pular = 0 } = {}) {
      const b = busca?.trim().toLowerCase();
      return topicos.filter((t) => (!ativo || t.ativo === ativo.toUpperCase())
        && (!noticia || t.noticia_id === noticia)
        && (!tipo || (tipo === 'acoes' && t.ativo && !['WIN', 'WDO'].includes(t.ativo))
            || (tipo === 'futuros' && ['WIN', 'WDO'].includes(t.ativo))
            || (tipo === 'noticias' && t.noticia_titulo) || (tipo === 'gerais' && !t.ativo && !t.noticia_titulo))
        && (!b || t.titulo.toLowerCase().includes(b) || t.texto.toLowerCase().includes(b) || (t.ativo ?? '').toLowerCase() === b))
        .sort((a, c) => (c.fixado - a.fixado) || c.atividade_em.localeCompare(a.atividade_em))
        .slice(pular, pular + limite).map(formatarTopico);
    },
    async topico(id) {
      const t = topicos.find((x) => x.id === id);
      if (!t) return null;
      return { ...formatarTopico(t), respostas: respostas.filter((r) => r.topico === id).map(formatarResposta) };
    },
    async criarTopico({ titulo, texto = '', ativo = null, noticia = null }) {
      if (titulo.trim().length < 5) throw new Error('Escreva um título com pelo menos 5 letras.');
      const id = proxTopico++;
      const agora = new Date().toISOString();
      topicos.push({ id, titulo: titulo.trim(), texto: texto.trim(), nome: quemSou(), grupo: ehGestor() ? '' : perfil().turma,
                     ativo: ativo || null, noticia_id: noticia?.id ?? null, noticia_titulo: noticia?.titulo ?? null,
                     noticia_link: noticia?.link ?? null, fixado: false, criado_em: agora, atividade_em: agora });
      return id;
    },
    async responderTopico(topico, texto, respostaA = null) {
      if (!texto.trim()) throw new Error('Escreva a resposta.');
      const pai = respostaA && respostas.find((r) => r.id === respostaA);
      const id = proxResposta++;
      const agora = new Date().toISOString();
      respostas.push({ id, topico, nome: quemSou(), grupo: ehGestor() ? '' : perfil().turma, texto: texto.trim(),
                       resposta_a: pai ? (pai.resposta_a ?? pai.id) : null, criado_em: agora });
      topicos.find((t) => t.id === topico).atividade_em = agora;
      return id;
    },
    async apagarTopico(id) {
      const i = topicos.findIndex((t) => t.id === id);
      if (i >= 0) topicos.splice(i, 1);
    },
    async apagarRespostaTopico(id) {
      for (let k = respostas.length - 1; k >= 0; k--) if (respostas[k].id === id || respostas[k].resposta_a === id) respostas.splice(k, 1);
    },
    async fixarTopico(id, fixar = true) { topicos.find((t) => t.id === id).fixado = fixar; },
    async notificacoes() { return notificacoes(); },
    async notificacoesNaoLidas() { return notificacoes().filter((n) => !n.lida).length; },
    async marcarNotificacoesLidas() { vistas = new Date().toISOString(); },
    async comunidadeFiltros() {
      const lista = await todas();
      const nomesGrupos = [...new Set(lista.flatMap((x) => x.grupo.split(', ')).filter(Boolean))].sort();
      return {
        grupos: nomesGrupos.map((nome) => ({ id: nome, nome })),
        pessoas: [...new Map(lista.map((x) => [x.nome, { id: x.nome, nome: x.nome, grupo: x.grupo }])).values()]
          .sort((a, b) => a.nome.localeCompare(b.nome)),
        ativos: [...new Set(lista.map((x) => x.base ?? x.ativo))].sort(),
      };
    },
    async comunidade(escopo = 'todos', antes = null, limite = 20, filtros = {}) {
      let lista = await todas();
      if (filtros.ativo) lista = lista.filter((x) => (x.base ?? x.ativo) === filtros.ativo);
      if (filtros.grupo) lista = lista.filter((x) => x.grupo.split(', ').includes(filtros.grupo));
      if (filtros.lado) lista = lista.filter((x) => x.lado === filtros.lado);
      if (filtros.autor) lista = lista.filter((x) => x.nome === filtros.autor);
      if (escopo === 'grupo') lista = lista.filter((x) => x.eu || meusGrupos().some((g) => x.grupo.split(', ').includes(g)));
      if (antes != null) {
        const i = lista.findIndex((x) => x.id === antes);
        lista = i >= 0 ? lista.slice(i + 1) : [];
      }
      return lista.slice(0, limite);
    },
    async publicacao(id) {
      return (await todas()).find((x) => x.id === id) ?? null;
    },
    async comentarios(pub) {
      return comentarios.filter((c) => c.pub === pub && (ehGestor() || !c.oculto))
        .map(({ pub: _, ...c }) => ({ resposta_a: null, professor: false, ...c, foto_url: null, eu: c.nome === perfil().nome }));
    },
    async comentar(pub, texto, respostaA = null) {
      const t = texto.trim();
      let raiz = null;
      if (respostaA) {
        const r = comentarios.find((c) => c.id === respostaA);
        if (!r) throw new Error('O comentário que você quer responder não existe mais.');
        raiz = r.resposta_a ?? r.id;
      }
      if (!t) throw new Error('Escreva o comentário.');
      if (t.length > 500) throw new Error('O comentário pode ter até 500 caracteres.');
      const id = proxComentario++;
      comentarios.push({ id, pub, nome: perfil().nome, grupo: ehGestor() ? '' : perfil().turma, texto: t, criado_em: new Date().toISOString(),
                         oculto: false, resposta_a: raiz, professor: ehGestor() });
      return id;
    },
    async apagarComentario(id) {
      const i = comentarios.findIndex((c) => c.id === id && (ehGestor() || c.nome === perfil().nome));
      if (i < 0) throw new Error('Comentário não encontrado.');
      for (let k = comentarios.length - 1; k >= 0; k--) if (comentarios[k].id === id || comentarios[k].resposta_a === id) comentarios.splice(k, 1);
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
