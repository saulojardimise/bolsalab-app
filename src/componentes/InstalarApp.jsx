import { useEffect, useRef, useState } from 'react';
import Icone from './Icone.jsx';
import iconeApp from '../marca/icone-app.png';
import {
  deixarParaDepois, instalar, navegadorDeApp, ouvirInstalacao, plataforma, podeInstalarDireto,
} from '../lib/instalar.js';

// Tela "Instalar o app": no Android/PC um botão abre a instalação do navegador;
// no iPhone, o passo a passo do Safari.
export default function InstalarApp({ aoFechar, avisar }) {
  const dialogo = useRef(null);
  const [direto, setDireto] = useState(podeInstalarDireto());
  const [instalando, setInstalando] = useState(false);
  const p = plataforma();
  const deApp = navegadorDeApp();

  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    return () => d.close();
  }, []);
  useEffect(() => ouvirInstalacao(() => setDireto(podeInstalarDireto())), []);

  const agoraNao = () => { deixarParaDepois(); aoFechar(); };

  async function instalarAgora() {
    setInstalando(true);
    const ok = await instalar().catch(() => false);
    setInstalando(false);
    if (ok) { avisar?.('Pronto! O BolsaLab está na sua tela de início.'); aoFechar(); }
  }

  let passos;
  if (deApp) {
    passos = (
      <ol className="instalar-passos">
        <li>Você abriu o link dentro de outro app (Instagram, WhatsApp...). Toque nos <strong>três pontinhos</strong> ou no ícone de navegador e escolha <strong>Abrir no {p === 'ios' ? 'Safari' : 'Chrome'}</strong>.</li>
        <li>No {p === 'ios' ? 'Safari' : 'Chrome'}, entre em <strong>bolsalab.app</strong> e toque em <strong>Instalar app</strong> no menu Mais.</li>
      </ol>
    );
  } else if (p === 'ios') {
    passos = (
      <ol className="instalar-passos">
        <li>
          Toque em <strong>Compartilhar</strong> <span className="instalar-icone" aria-hidden="true"><Icone nome="compartilhar" tamanho={18} /></span>
          {' '}na barra do Safari (embaixo, ou no alto no iPad). Se não aparecer, toque nos <strong>três pontinhos</strong> primeiro.
        </li>
        <li>Role a lista e toque em <strong>Adicionar à Tela de Início</strong> <span className="instalar-icone" aria-hidden="true"><Icone nome="mais" tamanho={18} /></span>.</li>
        <li>Toque em <strong>Adicionar</strong>. O ícone do BolsaLab aparece na tela de início.</li>
      </ol>
    );
  } else if (!direto) {
    passos = (
      <ol className="instalar-passos">
        {p === 'android' ? (
          <>
            <li>Toque nos <strong>três pontinhos</strong> <span className="instalar-icone instalar-pontos" aria-hidden="true">⋮</span> no canto de cima do Chrome.</li>
            <li>Toque em <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.</li>
            <li>Confirme em <strong>Instalar</strong>.</li>
          </>
        ) : (
          <>
            <li>No Chrome ou no Edge, clique no ícone de <strong>instalar</strong> no fim da barra de endereço (um monitor com uma seta).</li>
            <li>Clique em <strong>Instalar</strong>. O BolsaLab abre numa janela própria e ganha um atalho.</li>
          </>
        )}
      </ol>
    );
  }

  return (
    <dialog ref={dialogo} className="folha instalar-app" aria-labelledby="titulo-instalar"
            onCancel={(e) => { e.preventDefault(); agoraNao(); }}>
      <div className="instalar-conteudo">
        <img className="instalar-logo" src={iconeApp} alt="" width="72" height="72" />
        <h2 id="titulo-instalar">Instale o BolsaLab</h2>
        <p className="suave">
          Fica com ícone na tela de início, abre em tela cheia, sem a barra do navegador, e você entra mais rápido.
          Não ocupa quase nada de espaço.
        </p>

        {direto && !deApp ? (
          <button className="botao botao-principal" onClick={instalarAgora} disabled={instalando}>
            <Icone nome="baixar" tamanho={20} />{instalando ? 'Abrindo…' : 'Instalar app'}
          </button>
        ) : passos}

        <button className="botao" onClick={agoraNao}>Agora não</button>
        <p className="nota">Você encontra esta opção depois em Mais › Instalar app.</p>
      </div>
    </dialog>
  );
}
