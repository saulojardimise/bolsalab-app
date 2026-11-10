// Acesso ao Supabase. Todas as telas falam com o banco só por aqui.
// criarApi recebe o cliente pronto (assim os testes usam um cliente próprio).

const MENSAGENS_AUTH = [
  [/invalid login credentials/i, 'E-mail ou senha incorretos.'],
  [/email not confirmed/i, 'Confirme seu e-mail: abra o link que enviamos para a sua caixa de entrada.'],
  [/already registered|already been registered|user_already_exists/i, 'Este e-mail já tem conta. Use "Entrar" ou recupere a senha.'],
  // o Supabase esconde o motivo quando o banco recusa o cadastro
  [/database error saving new user/i, 'Não foi possível criar a conta. Se informou um token, confira o código e se o seu e-mail é aceito pelo grupo.'],
  [/password should be at least|weak_password|weak password/i, 'A senha precisa ter pelo menos 6 caracteres.'],
  [/rate limit|too many requests|over_email_send_rate_limit/i, 'Muitas tentativas seguidas. Espere alguns minutos e tente de novo.'],
  [/same as the old|same_password/i, 'A nova senha precisa ser diferente da anterior.'],
  [/failed to fetch|network/i, 'Sem conexão com o servidor. Verifique sua internet.'],
];

function traduzir(erro) {
  const msg = erro?.message ?? String(erro);
  for (const [padrao, texto] of MENSAGENS_AUTH) {
    if (padrao.test(msg) || padrao.test(erro?.code ?? '')) return new Error(texto);
  }
  return new Error(msg);
}

// Erros das funções do banco já vêm em português (raise exception).
function checar({ data, error }) {
  if (error) throw new Error(error.message || 'Erro ao falar com o servidor.');
  return data;
}

/** O e-mail é aceito pela turma? (dominio null = qualquer e-mail) */
export function emailAceito(email, dominio) {
  const e = email.trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) return false;
  return !dominio || e.split('@')[1] === dominio;
}

export function criarApi(supabase, { urlRetorno } = {}) {
  return {
    modoDemo: false,

    // ---------------- conta ----------------
    async sessao() {
      const { data } = await supabase.auth.getSession();
      return data.session ? { id: data.session.user.id, email: data.session.user.email } : null;
    },

    aoMudarSessao(cb) {
      const { data } = supabase.auth.onAuthStateChange((evento, s) => {
        cb(evento, s ? { id: s.user.id, email: s.user.email } : null);
      });
      return () => data.subscription.unsubscribe();
    },

    async entrar(email, senha) {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
      if (error) throw traduzir(error);
    },

    // Confere o token da turma antes do cadastro: { turma, dominio_email } ou null
    async verificarToken(token) {
      const linhas = checar(await supabase.rpc('verificar_token', { p_token: token }));
      return linhas[0] ?? null;
    },

    // token é opcional: sem ele a pessoa simula sem grupo e pode entrar num grupo depois
    async cadastrar({ email, senha, nome, token = '', escolaridade = '', situacao = '', curso = '', universidade = '', termosVersao = null }) {
      let turma = null;
      if (token.trim()) {
        turma = await this.verificarToken(token);
        if (!turma) throw new Error('Token inválido ou grupo fechado. Confira o código ou cadastre-se sem token.');
      }
      if (!emailAceito(email, turma?.dominio_email)) {
        throw new Error(turma?.dominio_email
          ? `O grupo ${turma.turma} só aceita e-mails @${turma.dominio_email}.`
          : 'Digite um e-mail válido.');
      }
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: senha,
        options: {
          data: {
            nome: nome.trim(), ...(turma ? { token: token.trim() } : {}),
            escolaridade, escolaridade_situacao: situacao, curso: curso.trim(), universidade: universidade.trim(), termos_versao: termosVersao,
          },
          emailRedirectTo: urlRetorno,
        },
      });
      if (error) throw traduzir(error);
      // Supabase devolve usuário sem identidades quando o e-mail já existe
      if (data.user && data.user.identities?.length === 0) {
        throw new Error('Este e-mail já tem conta. Use "Entrar" ou recupere a senha.');
      }
      return { precisaConfirmar: !data.session, turma: turma?.turma ?? null };
    },

    // Confere a senha atual (entrando de novo) antes de gravar a nova
    async trocarSenha(email, atual, nova) {
      const { error: e1 } = await supabase.auth.signInWithPassword({ email, password: atual });
      if (e1) throw new Error('A senha atual está incorreta.');
      const { error } = await supabase.auth.updateUser({ password: nova });
      if (error) throw traduzir(error);
    },

    async completarCadastro({ escolaridade, situacao, curso, universidade, termosVersao }) {
      return checar(await supabase.rpc('completar_cadastro', {
        p_escolaridade: escolaridade, p_situacao: situacao || null, p_curso: curso || null, p_universidade: universidade, p_termos_versao: termosVersao,
      }));
    },
    async cadastrosGestor(turmaId) {
      return checar(await supabase.rpc('gestor_cadastros', { p_turma_id: turmaId }));
    },
    async definirPerfilInvestidor(respostas) {
      return checar(await supabase.rpc('definir_perfil_investidor', { p_respostas: respostas }));
    },

    // local = só neste aparelho (serve também quando a conta já não existe no servidor)
    async sair(local = false) {
      const { error } = await supabase.auth.signOut(local ? { scope: 'local' } : undefined);
      if (error) await supabase.auth.signOut({ scope: 'local' });
    },

    async recuperarSenha(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: urlRetorno });
      if (error) throw traduzir(error);
    },

    async definirNovaSenha(senha) {
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw traduzir(error);
    },

    // ---------------- dados do aluno ----------------
    // Atenção: o gestor (admin) enxerga as linhas de todos;
    // por isso toda consulta da conta filtra pelo próprio user_id.

    // foto do professor para a página Sobre (aberta também a quem não entrou)
    async fotoProfessor() {
      const { data, error } = await supabase.rpc('foto_professor');
      return error ? null : data;
    },
    async perfil(uid) {
      const perfil = checar(await supabase.from('perfis').select('*').eq('user_id', uid).maybeSingle());
      if (!perfil) {
        // o login ainda está guardado no aparelho, mas a conta foi excluída
        const e = new Error('Esta conta não existe mais.');
        e.contaExcluida = true;
        throw e;
      }
      return perfil;
    },

    async config() {
      return checar(await supabase.from('config').select('*').single());
    },

    async mercado() {
      return checar(await supabase.from('mercado').select('*').order('ticker'));
    },

    async carteira(uid) {
      return checar(await supabase.from('minha_carteira').select('*').eq('user_id', uid).order('ticker'));
    },

    async vendidas(uid) {
      return checar(await supabase.from('minhas_vendidas').select('*').eq('user_id', uid).order('ticker'));
    },

    async ordens(uid, limite = 100) {
      return checar(await supabase.from('ordens').select('*').eq('user_id', uid)
        .order('criado_em', { ascending: false }).limit(limite));
    },

    async cobrancas(uid, limite = 100) {
      return checar(await supabase.from('cobrancas_aluguel').select('*').eq('user_id', uid)
        .order('criado_em', { ascending: false }).limit(limite));
    },

    // Ajustes por eventos das ações (desdobramento, troca de código...)
    async ajustes(uid, limite = 100) {
      return checar(await supabase.from('ajustes').select('*').eq('user_id', uid)
        .order('criado_em', { ascending: false }).limit(limite));
    },

    // Notícias dos últimos dias (a capa e os filtros são montados no app)
    async noticias(dias = 7) {
      const desde = new Date(Date.now() - dias * 86400e3).toISOString();
      return checar(await supabase.from('noticias').select('*').gte('publicada_em', desde)
        .order('publicada_em', { ascending: false }).limit(1000));
    },

    // Ibovespa e CDI para comparar com o patrimônio
    async indices(desde) {
      return checar(await supabase.from('indices').select('*').gte('data', desde)
        .order('data').limit(1000));
    },

    // grupos da pessoa: [{ id, nome, entrou_em, pessoas, principal }]
    async meusGrupos() {
      return checar(await supabase.rpc('meus_grupos'));
    },
    async entrarNoGrupo(token) {
      const r = checar(await supabase.rpc('entrar_no_grupo', { p_token: token }));
      return r[0];
    },
    async sairDoGrupo(id) {
      return checar(await supabase.rpc('sair_do_grupo', { p_turma_id: id }));
    },
    async ranking(turmaId = null) {
      return checar(await supabase.rpc('ranking', { p_turma_id: turmaId }));
    },

    async negociacaoLiberada() {
      return checar(await supabase.rpc('negociacao_liberada'));
    },

    async souAdmin() {
      return checar(await supabase.rpc('is_admin'));
    },

    // Histórico diário de uma ação (desde = 'AAAA-MM-DD' ou null para tudo)
    async historico(ticker, desde = null) {
      let q = supabase.from('cotacoes').select('data, preco, abertura, maxima, minima, volume')
        .eq('ticker', ticker).order('data');
      if (desde) q = q.gte('data', desde);
      return checar(await q);
    },

    // Minigráficos das listas: { PETR4: [31.2, 31.5, ...], ... } desde a data
    async linhasMercado(desde) {
      const linhas = checar(await supabase.rpc('linhas_mercado', { p_desde: desde }));
      return Object.fromEntries(linhas.map((l) => [l.ticker, l.precos.map(Number)]));
    },

    // Patrimônio do aluno dia a dia (gráfico da tela Início)
    async patrimonioDiario(uid) {
      return checar(await supabase.from('patrimonio_diario').select('data, patrimonio')
        .eq('user_id', uid).order('data'));
    },

    // Foto de perfil: vai para o Storage (avatares/<id>/foto.jpg) e o endereço fica no perfil
    async enviarFoto(uid, blob) {
      const caminho = `${uid}/foto.jpg`;
      const { error } = await supabase.storage.from('avatares')
        .upload(caminho, blob, { upsert: true, contentType: 'image/jpeg', cacheControl: '3600' });
      if (error) throw new Error('Não foi possível enviar a foto. Tente de novo.');
      const { data } = supabase.storage.from('avatares').getPublicUrl(caminho);
      const url = `${data.publicUrl}?v=${Date.now()}`;   // muda a cada envio, para não mostrar a antiga
      return checar(await supabase.rpc('definir_foto', { p_url: url }));
    },

    async removerFoto(uid) {
      await supabase.storage.from('avatares').remove([`${uid}/foto.jpg`]);
      checar(await supabase.rpc('definir_foto', { p_url: null }));
    },

    // ---------------- minicontratos (WIN e WDO) ----------------
    async futurosMercado() {
      return checar(await supabase.rpc('futuros_mercado'));
    },
    async futurosPosicoes(uid) {
      return checar(await supabase.from('futuros_posicoes').select('*').eq('user_id', uid).order('contrato'));
    },
    async futurosOrdens(uid, limite = 100) {
      return checar(await supabase.from('futuros_ordens').select('*').eq('user_id', uid)
        .order('criado_em', { ascending: false }).limit(limite));
    },
    async futurosAjustes(uid, limite = 100) {
      return checar(await supabase.from('futuros_ajustes').select('*').eq('user_id', uid)
        .order('criado_em', { ascending: false }).limit(limite));
    },
    async intradia() {
      return checar(await supabase.from('intradia').select('*'));
    },
    async marcarAvisoVisto(aviso) {
      return checar(await supabase.rpc('marcar_aviso_visto', { p_aviso: aviso }));
    },
    async executarFuturo(ativo, lado, quantidade) {
      return checar(await supabase.rpc('executar_ordem_futuro', { p_ativo: ativo, p_lado: lado, p_quantidade: quantidade }));
    },

    // ---------------- notificações ----------------
    async notificacoes(limite = 50) {
      return checar(await supabase.rpc('notificacoes', { p_limite: limite }));
    },
    async notificacoesNaoLidas() {
      return checar(await supabase.rpc('notificacoes_nao_lidas'));
    },
    async marcarNotificacoesLidas() {
      return checar(await supabase.rpc('marcar_notificacoes_lidas'));
    },

    // ---------------- discussões (tópicos) ----------------
    // filtros: { tipo: 'acoes'|'futuros'|'noticias'|'gerais', ativo, noticia, busca, limite, pular }
    async topicos({ tipo = null, ativo = null, noticia = null, busca = null, limite = 30, pular = 0 } = {}) {
      return checar(await supabase.rpc('topicos_lista', {
        p_tipo: tipo, p_ativo: ativo, p_noticia: noticia, p_busca: busca, p_limite: limite, p_pular: pular,
      }));
    },
    async topico(id) {
      const r = checar(await supabase.rpc('topico', { p_id: id }));
      return r[0] ?? null;
    },
    async criarTopico({ titulo, texto = '', ativo = null, noticia = null }) {
      return checar(await supabase.rpc('criar_topico', { p_titulo: titulo, p_texto: texto, p_ativo: ativo, p_noticia: noticia?.id ?? null }));
    },
    async responderTopico(topico, texto, respostaA = null) {
      return checar(await supabase.rpc('responder_topico', { p_topico: topico, p_texto: texto, p_resposta_a: respostaA }));
    },
    async apagarTopico(id) {
      return checar(await supabase.rpc('apagar_topico', { p_id: id }));
    },
    async apagarRespostaTopico(id) {
      return checar(await supabase.rpc('apagar_resposta_topico', { p_id: id }));
    },
    async fixarTopico(id, fixar = true) {
      return checar(await supabase.rpc('fixar_topico', { p_id: id, p_fixar: fixar }));
    },

    // ---------------- comunidade ----------------
    // filtros: { ativo, grupo, lado, autor } (todos opcionais)
    async comunidade(escopo = 'todos', antes = null, limite = 20, filtros = {}) {
      const args = { p_escopo: escopo, p_antes: antes, p_limite: limite };
      if (filtros.ativo) args.p_ativo = filtros.ativo;
      if (filtros.grupo) args.p_grupo = filtros.grupo;
      if (filtros.lado) args.p_lado = filtros.lado;
      if (filtros.autor) args.p_autor = filtros.autor;
      return checar(await supabase.rpc('comunidade_feed', args));
    },
    // opções dos filtros: { grupos: [{id, nome}], pessoas: [{id, nome, grupo}], ativos: [...] }
    async comunidadeFiltros() {
      return checar(await supabase.rpc('comunidade_filtros'));
    },
    // uma publicação só (aberta a partir de uma notificação)
    async publicacao(id) {
      const { data, error } = await supabase.rpc('comunidade_feed', { p_escopo: 'todos', p_limite: 1, p_id: id });
      if (!error) return data[0] ?? null;
      // banco sem o SQL 025: procura entre as mais recentes
      const lista = checar(await supabase.rpc('comunidade_feed', { p_escopo: 'todos', p_limite: 50 }));
      return lista.find((x) => x.id === id) ?? null;
    },
    async comentarios(publicacao) {
      return checar(await supabase.rpc('comunidade_comentarios', { p_publicacao: publicacao }));
    },
    // respostaA: id do comentário respondido (null = comentário novo)
    async comentar(publicacao, texto, respostaA = null) {
      const args = { p_publicacao: publicacao, p_texto: texto };
      if (respostaA) args.p_resposta_a = respostaA;   // sem resposta funciona também antes do SQL 024
      return checar(await supabase.rpc('comentar', args));
    },
    async apagarComentario(id) {
      return checar(await supabase.rpc('apagar_comentario', { p_id: id }));
    },
    // mesma reação de novo (ou null) tira a reação; devolve a reação que ficou
    async reagir(publicacao, tipo) {
      return checar(await supabase.rpc('reagir', { p_publicacao: publicacao, p_tipo: tipo }));
    },
    async denunciar(alvo, id, motivo = null) {
      return checar(await supabase.rpc('denunciar', { p_alvo: alvo, p_id: id, p_motivo: motivo }));
    },
    async descartarDenuncias(alvo, id) {
      return checar(await supabase.rpc('descartar_denuncias', { p_alvo: alvo, p_id: id }));
    },
    async denunciasAbertas() {
      return checar(await supabase.rpc('denuncias_abertas'));
    },

    async executarOrdem(ticker, tipo, quantidade) {
      return checar(await supabase.rpc('executar_ordem', {
        p_ticker: ticker, p_tipo: tipo, p_quantidade: quantidade,
      }));
    },

    // ---------------- área do gestor ----------------
    // avisos que aparecem no sino (grupo null = todo mundo)
    async avisosGestor() {
      return checar(await supabase.rpc('gestor_avisos'));
    },
    async criarAviso({ titulo, texto, grupo = null }) {
      return checar(await supabase.rpc('gestor_criar_aviso', { p_titulo: titulo, p_texto: texto, p_turma_id: grupo }));
    },
    async apagarAviso(id) {
      return checar(await supabase.rpc('gestor_apagar_aviso', { p_id: id }));
    },
    async turmas() {
      return checar(await supabase.rpc('turmas_painel'));
    },
    async criarTurma(nome, dominio) {
      return checar(await supabase.rpc('criar_turma', { p_nome: nome, p_dominio_email: dominio || null }));
    },
    async atualizarTurma(id, { nome, dominio, ativa }) {
      return checar(await supabase.rpc('atualizar_turma', {
        p_id: id, p_nome: nome, p_dominio_email: dominio || null, p_ativa: ativa,
      }));
    },
    async novoToken(id) {
      return checar(await supabase.rpc('novo_token_turma', { p_id: id }));
    },
    async semGrupo() {
      const r = checar(await supabase.rpc('resumo_sem_grupo'));
      return r[0] ?? null;
    },
    async buscarUsuarios(busca, foraDoGrupo = null) {
      return checar(await supabase.rpc('buscar_usuarios', { p_busca: busca, p_fora_do_grupo: foraDoGrupo }));
    },
    async adicionarAoGrupo(grupoId, userId) {
      return checar(await supabase.rpc('gestor_adicionar_ao_grupo', { p_turma_id: grupoId, p_user: userId }));
    },
    async removerDoGrupo(grupoId, userId) {
      return checar(await supabase.rpc('gestor_remover_do_grupo', { p_turma_id: grupoId, p_user: userId }));
    },
    // apaga a conta da pessoa do app (login, carteira, ordens, publicações)
    async perfilPublico(userId) {
      return checar(await supabase.rpc('perfil_publico', { p_user: userId }));
    },
    async corrigirEmail(userId, email) {
      return checar(await supabase.rpc('gestor_corrigir_email', { p_user: userId, p_email: email }));
    },
    async excluirUsuario(userId) {
      return checar(await supabase.rpc('gestor_excluir_usuario', { p_user: userId }));
    },
    async alunosTurma(id) {
      return checar(await supabase.rpc('alunos_turma', { p_turma_id: id }));
    },
    // apagarAlunos = true apaga também as contas dos alunos da turma
    async excluirTurma(id, apagarAlunos = false) {
      return checar(await supabase.rpc('excluir_turma', { p_id: id, p_apagar_alunos: apagarAlunos }));
    },
    async definirPausa(pausada) {
      return checar(await supabase.rpc('definir_pausa', { p_pausada: pausada }));
    },
    async coletas(limite = 10) {
      return checar(await supabase.from('coletas').select('*')
        .order('executada_em', { ascending: false }).limit(limite));
    },
    async alertas() {
      return checar(await supabase.rpc('alertas_abertos'));
    },
    async resolverAlerta(id) {
      return checar(await supabase.rpc('resolver_alerta', { p_id: id }));
    },
    async eventos(limite = 30) {
      return checar(await supabase.from('eventos_corporativos').select('*')
        .order('executado_em', { ascending: false }).limit(limite));
    },
    async impactoAcao(ticker) {
      const linhas = checar(await supabase.rpc('impacto_acao', { p_ticker: ticker }));
      return linhas[0];
    },
    async trocarCodigo(antigo, novo, nome) {
      return checar(await supabase.rpc('renomear_acao', { p_antigo: antigo, p_novo: novo, p_nome: nome || null }));
    },
    async desdobrar(ticker, de, para, dataEx) {
      return checar(await supabase.rpc('ajustar_desdobramento', {
        p_ticker: ticker, p_de: de, p_para: para, p_data_ex: dataEx || null,
      }));
    },
    async converter(antiga, nova, de, para, nomeNova) {
      return checar(await supabase.rpc('converter_acao', {
        p_antiga: antiga, p_nova: nova, p_de: de, p_para: para, p_nome_nova: nomeNova || null,
      }));
    },
    async encerrar(ticker, preco, motivo) {
      return checar(await supabase.rpc('encerrar_acao', { p_ticker: ticker, p_preco: preco, p_motivo: motivo || null }));
    },
    async suspender(ticker, suspensa) {
      return checar(await supabase.rpc('suspender_acao', { p_ticker: ticker, p_suspensa: suspensa }));
    },
  };
}
