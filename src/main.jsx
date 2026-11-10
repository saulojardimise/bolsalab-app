import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/plus-jakarta-sans';
import './estilos.css';
import App from './App.jsx';
import ProtecaoErro from './componentes/ProtecaoErro.jsx';
import AvisoAtualizar from './componentes/AvisoAtualizar.jsx';
// guarda o aviso de "dá para instalar" do navegador, que chega logo no início
import './lib/instalar.js';
import { registerSW } from 'virtual:pwa-register';
import { guardarRegistro, vigiarAtualizacoes } from './lib/atualizacao.js';

// Versão nova publicada: o app se atualiza sozinho ao abrir, sem precisar recarregar duas vezes
registerSW({ immediate: true, onRegisteredSW: (_url, registro) => guardarRegistro(registro) });
// e não deixa ninguém preso numa versão antiga (app aberto por dias)
vigiarAtualizacoes();
// (quando há versão nova, a página recarrega uma vez; a aba aberta é mantida — ver Painel)

createRoot(document.getElementById('raiz')).render(
  <StrictMode>
    <ProtecaoErro>
      <App />
      <AvisoAtualizar />
    </ProtecaoErro>
  </StrictMode>,
);
