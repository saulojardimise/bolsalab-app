import { useState } from 'react';
import { api } from '../api/index.js';
import CamposEscolaridade, { conferirEscolaridade } from '../componentes/CamposEscolaridade.jsx';
import Termos from '../componentes/Termos.jsx';
import Marca from '../componentes/Marca.jsx';
import { TERMOS_VERSAO } from '../lib/termos.js';

// Quem já tinha conta responde uma vez à escolaridade e aceita os Termos de Uso.
export default function CompletarCadastro({ perfil, aoConcluir, aoSair }) {
  const [esc, setEsc] = useState({
    escolaridade: perfil.escolaridade ?? '', situacao: perfil.escolaridade_situacao ?? '', curso: perfil.curso ?? '', universidade: perfil.universidade ?? '',
  });
  const [aceite, setAceite] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const soTermos = Boolean(perfil.escolaridade) && !(perfil.escolaridade !== 'medio' && !perfil.curso);   // já respondeu antes; só os termos mudaram

  async function enviar(e) {
    e.preventDefault();
    const falta = conferirEscolaridade(esc);
    if (falta) { setErro(falta); return; }
    if (!aceite) { setErro('Para continuar, aceite os Termos de Uso e a Política de Privacidade.'); return; }
    setEnviando(true); setErro('');
    try {
      await api.completarCadastro({ ...esc, termosVersao: TERMOS_VERSAO });
      await aoConcluir();
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  return (
    <main className="entrada completar-cadastro">
      <div className="entrada-marca"><Marca /></div>
      <form className="cartao formulario" onSubmit={enviar}>
        <h1>{soTermos ? 'Novos Termos de Uso' : 'Complete seu cadastro'}</h1>
        <p className="suave">
          {soTermos
            ? 'Atualizamos os Termos de Uso e a Política de Privacidade. Leia e aceite para continuar.'
            : 'Algumas perguntas rápidas e o aceite dos Termos de Uso. É só desta vez.'}
        </p>
        <CamposEscolaridade valor={esc} aoMudar={setEsc} />
        <label className="aceite-termos">
          <input type="checkbox" checked={aceite} onChange={(e) => setAceite(e.target.checked)} />
          <span>
            Li e aceito os{' '}
            <button type="button" className="link" onClick={() => setLendo(true)}>Termos de Uso e a Política de Privacidade</button>
          </span>
        </label>
        {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
        <button className="botao botao-principal" disabled={enviando}>{enviando ? 'Salvando…' : 'Continuar'}</button>
        <button type="button" className="link link-discreto" onClick={aoSair}>Sair da conta</button>
      </form>
      {lendo && <Termos aoFechar={() => setLendo(false)} aoAceitar={() => { setAceite(true); setLendo(false); }} />}
    </main>
  );
}
