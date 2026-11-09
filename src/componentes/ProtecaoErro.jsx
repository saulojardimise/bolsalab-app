import { Component } from 'react';

// Se alguma tela quebrar (um dado inesperado, por exemplo), mostra uma mensagem com
// "Recarregar" em vez de deixar a página em branco.
export default class ProtecaoErro extends Component {
  constructor(props) {
    super(props);
    this.state = { erro: null };
  }

  static getDerivedStateFromError(erro) {
    return { erro };
  }

  componentDidCatch(erro, info) {
    console.error('BolsaLab: erro na tela', erro, info?.componentStack);
  }

  render() {
    if (!this.state.erro) return this.props.children;
    return (
      <main className="carregando-tela">
        <div className="erro-geral" role="alert">
          <h1>Algo deu errado nesta tela</h1>
          <p>Sua carteira e suas ordens estão salvas. Recarregue para continuar.</p>
          <button className="botao botao-principal" onClick={() => location.replace(location.pathname)}>Recarregar</button>
          <p className="nota">Se acontecer de novo, avise o professor.</p>
        </div>
      </main>
    );
  }
}
