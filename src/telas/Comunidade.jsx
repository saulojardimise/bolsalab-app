import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/index.js';
import Publicacao from '../componentes/Publicacao.jsx';

const ESCOPOS = [['todos', 'Todos os grupos'], ['grupo', 'Meu grupo']];
const LIMITE = 20;

// Comunidade: mural com as operações dos alunos de todos os grupos,
// reações, comentários e a tese de cada operação.
export default function Comunidade({ dados, versao, aoEscolher, aoAbrirFuturo, aoMudarPerfil, avisar, moderar = false }) {
  const [escopo, setEscopo] = useState(() => {
    try { return localStorage.getItem('bolsalab:comunidade') || 'todos'; } catch { return 'todos'; }
  });
  const [lista, setLista] = useState(null);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const mostrando = dados?.perfil?.mostrar_operacoes !== false;

  const carregar = useCallback(async (antes = null) => {
    setCarregando(true); setErro('');
    try {
      const novos = await api.comunidade(moderar ? 'todos' : escopo, antes, LIMITE);
      setLista((l) => (antes ? [...(l ?? []), ...novos] : novos));
      setTemMais(novos.length === LIMITE);
    } catch (e) {
      setErro(e.message);
      setLista((l) => l ?? []);
    } finally {
      setCarregando(false);
    }
  }, [escopo, moderar]);

  useEffect(() => { setLista(null); carregar(); }, [carregar, versao]);

  const trocarEscopo = (e) => {
    setEscopo(e);
    try { localStorage.setItem('bolsalab:comunidade', e); } catch { /* sem armazenamento */ }
  };
  const mudar = (p) => setLista((l) => l.map((x) => (x.id === p.id ? p : x)));
  const escolher = (p) => (p.origem === 'futuro' ? aoAbrirFuturo?.(p.base) : aoEscolher?.(p.ativo));

  async function alternarVisibilidade() {
    try {
      const v = await api.mostrarOperacoes(!mostrando);
      aoMudarPerfil?.({ mostrar_operacoes: v });
      avisar?.(v ? 'Suas operações voltaram a aparecer na comunidade.' : 'Suas operações agora estão escondidas da comunidade.');
      carregar();
    } catch (e) { setErro(e.message); }
  }

  return (
    <div className="pilha comunidade">
      {!moderar && (
        <>
          <div className="secao-topo">
            <h1>Comunidade</h1>
          </div>
          <p className="suave">
            As operações dos alunos de todos os grupos. Reaja, comente e conte por que você fez cada operação.
          </p>
          <div className="chips" role="group" aria-label="Mostrar">
            {ESCOPOS.map(([id, rotulo]) => (
              <button key={id} aria-pressed={escopo === id} onClick={() => trocarEscopo(id)}>{rotulo}</button>
            ))}
          </div>
          <div className={`cartao privacidade ${mostrando ? '' : 'privacidade-oculta'}`}>
            <p>
              {mostrando
                ? <>Suas operações <strong>aparecem</strong> aqui (ativo, quantidade e preço; nunca seu saldo).</>
                : <>Suas operações estão <strong>escondidas</strong>. Só você as vê aqui.</>}
            </p>
            <button className="link" onClick={alternarVisibilidade}>{mostrando ? 'Esconder' : 'Mostrar'}</button>
          </div>
        </>
      )}

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {lista === null && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length === 0 && !erro && (
        <p className="cartao vazio">
          {escopo === 'grupo' && !moderar
            ? 'Ninguém do seu grupo operou ainda. Que tal ser o primeiro?'
            : 'Nenhuma operação ainda. As ordens dos alunos aparecem aqui assim que são feitas.'}
        </p>
      )}

      <div className="mural">
        {lista?.map((p) => (
          <Publicacao key={p.id} p={p} aoMudar={mudar} aoEscolher={moderar ? null : escolher}
                      moderar={moderar} avisar={avisar} />
        ))}
      </div>

      {temMais && (
        <button className="botao" onClick={() => carregar(lista.at(-1).id)} disabled={carregando}>
          {carregando ? 'Carregando…' : 'Carregar mais'}
        </button>
      )}

      {!moderar && lista?.length > 0 && (
        <p className="nota">
          Seja respeitoso: o professor acompanha a comunidade e pode ocultar publicações e comentários.
          Viu algo ofensivo? Toque em Denunciar.
        </p>
      )}
    </div>
  );
}
