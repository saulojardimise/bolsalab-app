import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/index.js';
import { resumoCarteira } from '../lib/regras.js';
import { diasAtras } from '../lib/formato.js';
import Topo from '../componentes/Topo.jsx';
import Navegacao from '../componentes/Navegacao.jsx';
import Comunidade from './Comunidade.jsx';
import Notificacoes from './Notificacoes.jsx';
import PublicacaoTela from './PublicacaoTela.jsx';
import Discussoes from './Discussoes.jsx';
import TopicoTela from './TopicoTela.jsx';
import NovoTopico from './NovoTopico.jsx';
import MenuPerfil from '../componentes/MenuPerfil.jsx';
import Inicio from './Inicio.jsx';
import Mercado from './Mercado.jsx';
import Acao from './Acao.jsx';
import Tesouro from './Tesouro.jsx';
import { ehTesouro } from '../lib/tesouro.js';
import Carteira from './Carteira.jsx';
import Turma from './Turma.jsx';
import Extrato from './Extrato.jsx';
import Sobre from './Sobre.jsx';
import PerfilPessoa from '../componentes/PerfilPessoa.jsx';
import { AbrirPerfilContexto } from '../lib/pessoa.js';
import SemConexao, { AvisoOffline } from '../componentes/SemConexao.jsx';
import Questionario from './Questionario.jsx';
import CompletarCadastro from './CompletarCadastro.jsx';
import { precisaCompletarCadastro } from '../lib/termos.js';
import { ateProximaVirada } from '../lib/pregao.js';
import { tickersEtf } from '../lib/etf.js';
import { carteiraAgora } from '../lib/intradia.js';
import Noticias from './Noticias.jsx';
import Futuro from './Futuro.jsx';
import InstalarApp from '../componentes/InstalarApp.jsx';
import { deveSugerirInstalar, ouvirInstalacao } from '../lib/instalar.js';
import RegrasBolsaLab, { AVISO_REGRAS, deveMostrarRegras, lembrarRegrasLocal } from '../componentes/RegrasBolsaLab.jsx';
import CompletarFoto, { fotoAdiada } from './CompletarFoto.jsx';

// Área logada: carrega os dados da conta e controla a navegação.
// Abrir uma ação ou a área do professor empilha no histórico do navegador,
// então o botão "voltar" do celular volta para a lista.
export default function Painel({ uid }) {
  // a aba fica guardada na sessão: se o app recarregar sozinho (versão nova
  // publicada), o aluno continua onde estava em vez de voltar ao início
  const [aba, setAbaEstado] = useState(() => {
    try { return sessionStorage.getItem('bolsalab:aba') || 'inicio'; } catch { return 'inicio'; }
  });
  const setAba = (id) => {
    setAbaEstado(id);
    try { sessionStorage.setItem('bolsalab:aba', id); } catch { /* sem armazenamento */ }
  };
  const [discussoesBusca, setDiscussoesBusca] = useState('');   // filtro ao abrir "Ver todas"
  const [regrasAbertas, setRegrasAbertas] = useState(false);
  const [sobreposta, setSobreposta] = useState(null);   // { tipo: 'acao', ticker, operacao }
  // tela atual, para o registro de erros (ProtecaoErro)
  useEffect(() => {
    try { document.body.dataset.tela = sobreposta ? `${sobreposta.tipo}${sobreposta.ticker ? ` ${sobreposta.ticker}` : ''}` : aba; } catch { /* nada */ }
  }, [aba, sobreposta]);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [dados, setDados] = useState(null);
  const feriadosRef = useRef([]);
  const [linhas, setLinhas] = useState({});              // ticker -> fechamentos do último mês
  const [erro, setErro] = useState('');
  const [semConexao, setSemConexao] = useState(false);
  const [recado, setRecado] = useState('');
  const [versao, setVersao] = useState(0);
  const [fotoVista, setFotoVista] = useState(false);
  const [avisoFechado, setAvisoFechado] = useState(false);
  const [pessoaAberta, setPessoaAberta] = useState(null);       // perfil de outra pessoa
  const [instalarAberto, setInstalarAberto] = useState(false);   // aberto pelo menu
  const [instalarVisto, setInstalarVisto] = useState(false);     // já apareceu sozinho nesta visita
  const [, setTiqueInstalar] = useState(0);
  useEffect(() => ouvirInstalacao(() => setTiqueInstalar((n) => n + 1)), []);   // já mostrou o convite da foto nesta visita

  const carregar = useCallback(async () => {
    try {
      const [perfil, config, mercado, carteira, vendidas, liberada, futurosMercado, futuros, intradia, naoLidas, gruposBanco] = await Promise.all([
        api.perfil(uid), api.config(), api.mercado(), api.carteira(uid), api.vendidas(uid),
        api.negociacaoLiberada(),
        // minicontratos: se o banco ainda não tiver o SQL 014, o app segue sem eles
        api.futurosMercado().catch(() => []), api.futurosPosicoes(uid).catch(() => []),
        api.intradia().catch(() => []),
        // notificações: sem o SQL 020, fica em zero
        api.notificacoesNaoLidas().catch(() => 0),
        // grupos: sem o SQL 021, vale o grupo único do perfil
        api.meusGrupos().catch(() => null),
      ]);
      const grupos = gruposBanco ?? (perfil.turma_id ? [{ id: perfil.turma_id, nome: perfil.turma }] : []);
      setDados((antes) => ({ perfil, config, mercado, carteira, vendidas, liberada, futurosMercado, futuros, intradia, naoLidas, grupos, feriados: antes?.feriados ?? feriadosRef.current }));
      setErro(''); setSemConexao(false);
      return mercado;
    } catch (e) {
      if (e.contaExcluida) {
        try { sessionStorage.setItem('bolsalab:aviso-entrada', 'Esta conta foi excluída do BolsaLab. Entre com outra conta ou crie uma nova.'); } catch { /* sem armazenamento */ }
        await api.sair(true).catch(() => {});
        return;
      }
      setErro(e.message); setSemConexao(Boolean(e.semConexao));
      return null;
    }
  }, [uid]);

  // minigráficos: um mês de fechamentos de todas as ações, numa consulta só (função linhas_mercado)
  const carregarLinhas = useCallback(async () => {
    try {
      setLinhas(await api.linhasMercado(diasAtras(31)));
    } catch { /* minigráfico é opcional */ }
  }, []);

  useEffect(() => {
    carregar().then((m) => m && carregarLinhas());
    const aoVoltar = () => document.visibilityState === 'visible' && carregar();
    document.addEventListener('visibilitychange', aoVoltar);
    const relogio = setInterval(carregar, 5 * 60 * 1000);
    // feriados da B3: para dizer até quando a negociação fica aberta
    api.feriados?.().then((f) => { feriadosRef.current = f; setDados((d) => (d ? { ...d, feriados: f } : d)); }).catch(() => {});
    // na virada do horário (19h e 9h) a faixa "aberta/fechada" muda na hora, sem esperar os 5 minutos
    let virada;
    const agendar = () => { virada = setTimeout(() => { carregar(); agendar(); }, ateProximaVirada() + 3000); };
    agendar();
    return () => { document.removeEventListener('visibilitychange', aoVoltar); clearInterval(relogio); clearTimeout(virada); };
  }, [carregar, carregarLinhas]);

  // botão voltar do aparelho
  useEffect(() => {
    // o app recarregou com uma tela aberta: começa na aba e esquece a tela antiga do histórico
    if (window.history.state?.sobreposta) window.history.replaceState(null, '');
    const aoVoltarHistorico = (e) => setSobreposta(e.state?.sobreposta ?? null);
    window.addEventListener('popstate', aoVoltarHistorico);
    return () => window.removeEventListener('popstate', aoVoltarHistorico);
  }, []);

  useEffect(() => {
    if (!recado) return;
    const t = setTimeout(() => setRecado(''), 4500);
    return () => clearTimeout(t);
  }, [recado]);

  const resumo = useMemo(() => dados && resumoCarteira({
    saldo: dados.perfil.saldo, carteira: dados.carteira, vendidas: dados.vendidas, futuros: dados.futuros,
    saldoInicial: Number(dados.config.saldo_inicial),
  }), [dados]);
  // Durante o dia, Início e Carteira mostram a carteira estimada com a cotação do dia.
  // Boleta, limites, extrato e ranking seguem pelo fechamento (dados e resumo).
  const aoVivo = useMemo(() => {
    const agora = dados && carteiraAgora(dados);
    if (!agora) return null;
    const dadosAgora = { ...dados, carteira: agora.carteira, vendidas: agora.vendidas, futuros: agora.futuros };
    const r = resumoCarteira({ saldo: dados.perfil.saldo, carteira: agora.carteira, vendidas: agora.vendidas, futuros: agora.futuros,
                               saldoInicial: Number(dados.config.saldo_inicial) });
    return { dados: dadosAgora, resumo: { ...r, estimadoAs: agora.horario, noFechamento: resumo.patrimonio } };
  }, [dados, resumo]);

  if (!dados && semConexao) return <SemConexao aoTentar={carregar} />;
  if (!dados) {
    return (
      <main className="carregando-tela" aria-busy={!erro}>
        {erro && (
          <div className="erro-geral" role="alert">
            <p>{erro}</p>
            <button className="botao" onClick={carregar}>Tentar de novo</button>
          </div>
        )}
      </main>
    );
  }

  // Conta antiga (ou termos novos): escolaridade e aceite dos termos vêm antes de tudo.
  // Só exige depois que o banco tiver o SQL 039 (perfil com a coluna termos_aceitos_em).
  if ('termos_aceitos_em' in dados.perfil && precisaCompletarCadastro(dados.perfil)) {
    return (
      <div className="painel">
        {api.modoDemo && <p className="faixa-demo">Demonstração com preços fictícios</p>}
        <CompletarCadastro perfil={dados.perfil} aoConcluir={carregar} aoSair={() => api.sair()} />
      </div>
    );
  }

  // Sem perfil de investidor: o questionário vem antes de tudo
  // (undefined = banco ainda sem o SQL 010; aí o app segue sem exigir)
  if (dados.perfil.perfil_investidor === null) {
    return (
      <div className="painel">
        {api.modoDemo && <p className="faixa-demo">Demonstração com preços fictícios</p>}
        <Questionario obrigatorio aoConcluir={carregar} />
      </div>
    );
  }

  const mudarFoto = (foto_url) => setDados((d) => ({ ...d, perfil: { ...d.perfil, foto_url } }));

  // Depois do questionário: convite para pôr a foto (pode deixar para depois)
  if (!fotoVista && !dados.perfil.foto_url && !fotoAdiada(uid)) {
    return (
      <div className="painel">
        {api.modoDemo && <p className="faixa-demo">Demonstração com preços fictícios</p>}
        <CompletarFoto perfil={dados.perfil} aoMudarFoto={mudarFoto} aoConcluir={() => setFotoVista(true)} />
      </div>
    );
  }

  // nivel = quantas telas estão empilhadas por cima da aba (para voltar todas de uma vez)
  const nivelAtual = () => window.history.state?.nivel ?? (sobreposta ? 1 : 0);
  const abrir = (s) => {
    window.history.pushState({ sobreposta: s, nivel: nivelAtual() + 1 }, '');
    setSobreposta(s);
    window.scrollTo({ top: 0 });
  };
  const fechar = () => window.history.back();
  // troca a tela de cima sem empilhar outra (o voltar leva para onde estava antes)
  const trocarSobreposta = (s) => {
    window.history.replaceState({ sobreposta: s, nivel: nivelAtual() || 1 }, '');
    setSobreposta(s);
    window.scrollTo({ top: 0 });
  };
  const abrirAcao = (ticker, operacao) => abrir({ tipo: 'acao', ticker, operacao });
  const abrirExtrato = () => abrir({ tipo: 'extrato' });
  const abrirSobre = () => (sobreposta ? trocarSobreposta({ tipo: 'sobre' }) : abrir({ tipo: 'sobre' }));
  const abrirFuturo = (ativo) => abrir({ tipo: 'futuro', ativo });
  const abrirAtivo = (a) => (a === 'WIN' || a === 'WDO' ? abrirFuturo(a) : abrirAcao(a));
  const abrirTopico = (id, destaque = null) => abrir({ tipo: 'topico', id, destaque });
  const novoTopico = (inicial = {}) => abrir({ tipo: 'novo-topico', inicial });
  const verDiscussoes = (busca = '') => { setDiscussoesBusca(busca); trocarAba('discussoes'); };
  // seção "Discussões sobre X" das páginas de ação e minicontrato
  const discussoes = { aoAbrirTopico: (id) => abrirTopico(id), aoNovoTopico: novoTopico, aoVerTodas: verDiscussoes };
  const abrirNotificacoes = () => abrir({ tipo: 'notificacoes' });
  const zerarNaoLidas = () => setDados((d) => ({ ...d, naoLidas: 0 }));
  const trocarAba = (id) => {
    // fecha todas as telas empilhadas (ex.: Notificações > Publicação) antes de trocar de aba
    const n = nivelAtual();
    if (n > 0) window.history.go(-n);
    setAba(id);
    window.scrollTo({ top: 0 });
  };

  // Guia das regras (uma vez por aluno; depois fica em Mais > Regras do BolsaLab)
  const mostrarAviso = !avisoFechado && !sobreposta && !perfilAberto && deveMostrarRegras(dados.perfil, { demo: api.modoDemo });
  const fecharAviso = () => {
    setAvisoFechado(true);
    lembrarRegrasLocal(uid);
    api.marcarAvisoVisto(AVISO_REGRAS).catch(() => {});
    setDados((d) => ({ ...d, perfil: { ...d.perfil, avisos_vistos: [...(d.perfil.avisos_vistos ?? []), AVISO_REGRAS] } }));
  };
  // fechar o aviso leva sempre para a página inicial
  // Instalar o app: aparece sozinho depois do aviso de novidade (celular, fora do app instalado)
  const mostrarInstalarSozinho = !instalarVisto && !mostrarAviso && !sobreposta && !perfilAberto && deveSugerirInstalar();
  const mostrarInstalar = instalarAberto || mostrarInstalarSozinho;
  const fecharInstalar = () => { setInstalarAberto(false); setInstalarVisto(true); };

  const fecharAvisoIrInicio = () => {
    fecharAviso();
    trocarAba('inicio');
  };

  const aoExecutar = async (mensagem) => {
    setRecado(mensagem);
    await carregar();
    setVersao((v) => v + 1);
  };

  let conteudo;
  if (sobreposta?.tipo === 'acao' && ehTesouro(sobreposta.ticker)) {
    conteudo = (
      <Tesouro key={sobreposta.ticker} ticker={sobreposta.ticker} operacaoInicial={sobreposta.operacao}
               dados={dados} aoVoltar={fechar} aoExecutar={aoExecutar} discussoes={discussoes} />
    );
  } else if (sobreposta?.tipo === 'acao') {
    conteudo = (
      <Acao key={sobreposta.ticker} ticker={sobreposta.ticker} operacaoInicial={sobreposta.operacao}
            dados={dados} aoVoltar={fechar} aoExecutar={aoExecutar} discussoes={discussoes} />
    );
  } else if (sobreposta?.tipo === 'futuro') {
    conteudo = <Futuro key={sobreposta.ativo} ativo={sobreposta.ativo} dados={dados} aoVoltar={fechar} aoExecutar={aoExecutar}
                       discussoes={discussoes} />;
  } else if (sobreposta?.tipo === 'questionario') {
    conteudo = <Questionario perfilAtual={dados.perfil.perfil_investidor} aoVoltar={fechar}
                             aoConcluir={async () => { await carregar(); fechar(); setRecado('Perfil de investidor atualizado.'); }} />;
  } else if (sobreposta?.tipo === 'notificacoes') {
    conteudo = <Notificacoes versao={versao} etfs={tickersEtf(dados.mercado)} aoVoltar={fechar} aoLer={zerarNaoLidas}
                             aoAbrirPublicacao={(id, comentario) => abrir({ tipo: 'publicacao', id, comentario })}
                             aoAbrirTopico={(id, resposta) => abrir({ tipo: 'topico', id, destaque: resposta })}
                             aoAbrirExtrato={() => trocarSobreposta({ tipo: 'extrato' })} />
  } else if (sobreposta?.tipo === 'publicacao') {
    conteudo = <PublicacaoTela id={sobreposta.id} comentario={sobreposta.comentario} aoVoltar={fechar} avisar={setRecado}
                               aoEscolher={abrirAcao} aoAbrirFuturo={abrirFuturo} />;
  } else if (sobreposta?.tipo === 'topico') {
    conteudo = <TopicoTela key={sobreposta.id} id={sobreposta.id} destaque={sobreposta.destaque} aoVoltar={fechar}
                           avisar={setRecado} aoAbrirAtivo={abrirAtivo} />;
  } else if (sobreposta?.tipo === 'novo-topico') {
    conteudo = <NovoTopico inicial={sobreposta.inicial} mercado={dados.mercado} aoVoltar={fechar}
                           aoCriado={(id) => { setRecado('Tópico publicado.'); setVersao((v) => v + 1); trocarSobreposta({ tipo: 'topico', id }); }}
                           aoAbrirTopico={(id) => trocarSobreposta({ tipo: 'topico', id })} />;
  } else if (sobreposta?.tipo === 'sobre') {
    conteudo = <Sobre aoVoltar={fechar} />;
  } else if (sobreposta?.tipo === 'extrato') {
    conteudo = <Extrato uid={uid} dados={dados} resumo={resumo} versao={versao} aoVoltar={fechar} />;
  } else if (aba === 'inicio') {
    conteudo = <Inicio uid={uid} dados={aoVivo?.dados ?? dados} resumo={aoVivo?.resumo ?? resumo} linhas={linhas} versao={versao}
                       aoEscolher={abrirAcao} irPara={trocarAba} aoAbrirExtrato={abrirExtrato} />;
  } else if (aba === 'mercado') {
    conteudo = <Mercado dados={dados} linhas={linhas} aoEscolher={abrirAcao} aoAbrirFuturo={abrirFuturo} />;
  } else if (aba === 'comunidade') {
    conteudo = <Comunidade dados={dados} versao={versao} aoEscolher={abrirAcao} aoAbrirFuturo={abrirFuturo} avisar={setRecado}
                           aoVerDiscussoes={() => verDiscussoes('')} />;
  } else if (aba === 'discussoes') {
    conteudo = <Discussoes key={discussoesBusca} buscaInicial={discussoesBusca} versao={versao}
                           aoAbrirTopico={(id) => abrirTopico(id)} aoNovoTopico={novoTopico} />;
  } else if (aba === 'noticias') {
    conteudo = <Noticias dados={dados} aoEscolher={abrirAcao}
                         aoDiscutir={(n) => novoTopico({ noticia: { id: n.id, titulo: n.titulo, link: n.link } })} />;
  } else if (aba === 'carteira') {
    conteudo = <Carteira uid={uid} dados={aoVivo?.dados ?? dados} resumo={aoVivo?.resumo ?? resumo} versao={versao}
                         aoEscolher={abrirAcao} irPara={trocarAba} aoAbrirExtrato={abrirExtrato} aoAbrirFuturo={abrirFuturo} />;
  } else {
    conteudo = <Turma grupos={dados.grupos} versao={versao} aoMudarGrupos={carregar} avisar={setRecado} />;
  }

  return (
    <AbrirPerfilContexto.Provider value={setPessoaAberta}>
    <div className="painel">
      {!sobreposta && <Topo foto={dados.perfil.foto_url} aoAbrirPerfil={() => setPerfilAberto(true)}
                             naoLidas={dados.naoLidas ?? 0} aoAbrirNotificacoes={abrirNotificacoes} />}
      {api.modoDemo && <p className="faixa-demo">Demonstração com preços fictícios</p>}
      <AvisoOffline />
      {erro && <p className="aviso aviso-erro conteudo" role="alert">{erro}</p>}
      <main className="conteudo">{conteudo}</main>
      <Navegacao aba={sobreposta?.tipo === 'acao' || sobreposta?.tipo === 'futuro' ? 'mercado' : sobreposta?.tipo === 'extrato' || sobreposta?.tipo === 'notificacoes' || sobreposta?.tipo === 'sobre' ? sobreposta.tipo : aba} aoTrocar={trocarAba}
                 aoAbrirExtrato={abrirExtrato} aoAbrirPerfil={() => setPerfilAberto(true)}
                 aoAbrirNotificacoes={abrirNotificacoes} naoLidas={dados.naoLidas ?? 0}
                 aoInstalar={() => setInstalarAberto(true)} aoAbrirSobre={abrirSobre} aoAbrirRegras={() => setRegrasAbertas(true)} />

      {perfilAberto && (
        <MenuPerfil
          perfil={dados.perfil}
          grupos={dados.grupos}
          resumo={resumo}
          avisar={setRecado}
          aoRefazerPerfil={() => { setPerfilAberto(false); abrir({ tipo: 'questionario' }); }}
          aoFechar={() => setPerfilAberto(false)}
          aoSair={() => api.sair()}
          aoMudarFoto={mudarFoto}
        />
      )}
      {mostrarAviso && (
        <RegrasBolsaLab config={dados.config} mercado={dados.mercado} aoFechar={fecharAvisoIrInicio} />
      )}
      {regrasAbertas && !mostrarAviso && (
        <RegrasBolsaLab config={dados.config} mercado={dados.mercado} aoFechar={() => setRegrasAbertas(false)} />
      )}
      {mostrarInstalar && !mostrarAviso && <InstalarApp aoFechar={fecharInstalar} avisar={setRecado} />}
      {pessoaAberta && <PerfilPessoa id={pessoaAberta} aoFechar={() => setPessoaAberta(null)} aoAbrirAtivo={abrirAtivo} />}
      {recado && <p className="recado" role="status">{recado}</p>}
    </div>
    </AbrirPerfilContexto.Provider>
  );
}
