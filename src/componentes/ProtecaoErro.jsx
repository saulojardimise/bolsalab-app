import { Component } from 'react';
import { api } from '../api/index.js';
import { VERSAO, atualizarAgora } from '../lib/atualizacao.js';

// Tela em que o aluno está (o Painel anota em document.body.dataset.tela)
const telaAtual = () => { try { return document.body.dataset.tela || ''; } catch { return ''; } };

// Se alguma tela quebrar (um dado inesperado, por exemplo), mostra uma mensagem com
// "Recarregar" em vez de deixar a página em branco, e manda o erro para o professor ver em Gestor > Sistema.
export default class ProtecaoErro extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null, tela: '' };
  }

  static getDerivedStateFromError(erro) {
    return { erro, tela: telaAtual() };
  }

  componentDidCatch(erro, info) {
    console.error('BolsaLab: erro na tela', erro, info?.componentStack);
    try {
      const pilha = [String(erro?.stack ?? '').split('\n').slice(0, 6).join('\n'), (info?.componentStack ?? '').trim().split('\n').slice(0, 8).join('\n')]
        .filter(Boolean).join('\n---\n');
      api.registrarErro?.({ tela: telaAtual(), mensagem: `${erro?.name ?? 'Erro'}: ${erro?.message ?? erro}`, detalhe: pilha,
                            navegador: navigator.userAgent, versao: VERSAO })?.catch?.(() => {});
    } catch { /* sem registro */ }
  }

  render() {
    const { erro, tela } = this.state;
    if (!erro) return this.props.children;
    return (
      <main className="carregando-tela">
        <div className="erro-geral" role="alert">
          <h1>Algo deu errado nesta tela</h1>
          <p>Sua carteira e suas ordens estão salvas. Recarregue para continuar.</p>
          {/* recarrega limpando o cache do app: resolve quando o celular ficou com pedaços de uma versão antiga */}
          <button className="botao botao-principal" onClick={() => atualizarAgora(String(Date.now()))}>Recarregar</button>
          <p className="nota">Se acontecer de novo, avise o professor e mande um print desta tela.</p>
          <p className="erro-detalhe">{tela ? `${tela} · ` : ''}{String(erro?.message ?? erro).slice(0, 160)}</p>
        </div>
      </main>
    );
  }
}
