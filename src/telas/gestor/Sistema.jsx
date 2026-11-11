import { useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { dataHora } from '../../lib/formato.js';
import Icone from '../../componentes/Icone.jsx';
import TrocarSenha from '../../componentes/TrocarSenha.jsx';

// Negociação (pausar/liberar), coletas de cotações e conta do gestor
export default function Sistema({ email, avisar }) {
  const [config, setConfig] = useState(null);
  const [coletas, setColetas] = useState(null);
  const [erro, setErro] = useState('');
  const [versao, setVersao] = useState(0);
  const [trocandoSenha, setTrocandoSenha] = useState(false);
  const [errosApp, setErrosApp] = useState(null);   // null = carregando; false = SQL 041 não rodado

  useEffect(() => {
    Promise.all([api.config(), api.coletas()])
      .then(([c, k]) => { setConfig(c); setColetas(k); })
      .catch((e) => setErro(e.message));
    api.errosApp?.().then(setErrosApp).catch(() => setErrosApp(false));
  }, [versao]);

  async function alternarPausa() {
    try {
      const pausada = await api.definirPausa(!config.negociacao_pausada);
      setVersao((v) => v + 1);
      avisar(pausada ? 'Negociações pausadas para todos os alunos.' : 'Negociações liberadas.');
    } catch (e) { setErro(e.message); }
  }

  return (
    <div className="pilha">
      <h1>Sistema</h1>
      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}

      {config && (
        <section className="cartao" aria-labelledby="titulo-negociacao">
          <h2 id="titulo-negociacao">Negociação</h2>
          <p className={`status ${config.negociacao_pausada ? 'status-fechado' : 'status-aberto'}`}>
            <span className="status-sinal" aria-hidden="true" />
            <span>
              {config.negociacao_pausada
                ? <><strong>Pausada.</strong> Nenhum aluno consegue enviar ordens.</>
                : <><strong>Normal.</strong> Dias úteis das 19h às 9h, fins de semana e feriados o dia todo.</>}
            </span>
          </p>
          <button className={`botao ${config.negociacao_pausada ? 'botao-principal' : ''}`} onClick={alternarPausa}>
            <Icone nome={config.negociacao_pausada ? 'play' : 'pausa'} tamanho={18} />
            {config.negociacao_pausada ? 'Liberar negociações' : 'Pausar negociações'}
          </button>
        </section>
      )}

      <section aria-labelledby="titulo-coletas">
        <h2 id="titulo-coletas" className="secao-titulo">Coletas de cotações e notícias</h2>
        {coletas?.length === 0 && <p className="cartao vazio">Nenhuma coleta registrada ainda.</p>}
        {coletas?.length > 0 && (
          <ul className="cartao cartao-lista extrato">
            {coletas.map((c) => (
              <li key={c.id}>
                <div className="extrato-linha">
                  <span>{dataHora(c.executada_em)}</span>
                  <span className={c.com_erro ? 'baixa' : 'alta'}>{c.com_erro ? `${c.com_erro} com erro` : 'Tudo certo'}</span>
                </div>
                <div className="extrato-detalhe">
                  <span>{c.origem?.startsWith('notícias') ? `${c.gravadas} notícias novas, ${c.total} lidas`
                    : c.origem?.startsWith('índices') ? `${c.gravadas} pontos de Ibovespa e CDI`
                    : `${c.gravadas} de ${c.total} cotações gravadas`}</span>
                  <span>{c.origem}</span>
                </div>
                {c.erros?.length > 0 && (
                  <p className="extrato-obs">{c.erros.map((e) => `${e.ticker}: ${e.erro}`).join('; ')}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="titulo-erros">
        <h2 id="titulo-erros" className="secao-titulo">Erros nas telas</h2>
        <p className="suave">Quando aparece "Algo deu errado nesta tela" para alguém, o erro fica registrado aqui (últimos 30 dias).</p>
        {errosApp === false && <p className="cartao vazio">Para ver os erros, rode o SQL 041 (erros do app) no Supabase.</p>}
        {Array.isArray(errosApp) && errosApp.length === 0 && <p className="cartao vazio">Nenhum erro registrado.</p>}
        {Array.isArray(errosApp) && errosApp.length > 0 && (
          <ul className="cartao cartao-lista extrato">
            {errosApp.map((e) => (
              <li key={e.id}>
                <div className="extrato-linha">
                  <span>{dataHora(e.criado_em)}</span>
                  <span>{e.nome || e.email || 'Sem nome'}</span>
                </div>
                <div className="extrato-detalhe">
                  <span>{e.tela || 'tela desconhecida'}</span>
                  <span>{navegadorCurto(e.navegador)}</span>
                </div>
                <p className="extrato-obs erro-detalhe">{e.mensagem}</p>
                {e.detalhe && (
                  <details className="erro-pilha"><summary>Detalhes técnicos</summary><pre>{e.detalhe}</pre></details>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="cartao" aria-labelledby="titulo-conta">
        <h2 id="titulo-conta">Conta</h2>
        <p className="suave">{email}</p>
        {trocandoSenha ? (
          <TrocarSenha email={email} aoCancelar={() => setTrocandoSenha(false)}
                       aoConcluir={() => { setTrocandoSenha(false); avisar('Senha alterada.'); }} />
        ) : (
          <button className="botao" onClick={() => setTrocandoSenha(true)}><Icone nome="chave" tamanho={18} />Trocar senha</button>
        )}
        <button className="botao" onClick={() => api.sair()}><Icone nome="sair" tamanho={18} />Sair da conta</button>
      </section>
    </div>
  );
}

// "iPhone · iOS 16.3 · Safari" a partir do user agent
function navegadorCurto(ua = '') {
  if (!ua) return '';
  const ios = ua.match(/OS (\d+)[_.](\d+)/);
  const android = ua.match(/Android (\d+)/);
  const sistema = /iPhone|iPad/.test(ua) && ios ? `iOS ${ios[1]}.${ios[2]}` : android ? `Android ${android[1]}` : /Windows/.test(ua) ? 'Windows' : /Mac OS X/.test(ua) ? 'Mac' : '';
  const nav = /CriOS|Chrome/.test(ua) ? 'Chrome' : /FxiOS|Firefox/.test(ua) ? 'Firefox' : /Instagram/.test(ua) ? 'Instagram' : /Safari/.test(ua) ? 'Safari' : '';
  return [sistema, nav].filter(Boolean).join(' · ');
}
