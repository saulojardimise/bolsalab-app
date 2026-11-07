import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/index.js';
import Publicacao from '../componentes/Publicacao.jsx';

const ESCOPOS = [['todos', 'Todos'], ['grupo', 'Meus grupos']];
const LIMITE = 20;

// Comunidade: mural com as operações dos alunos de todos os grupos,
// reações e comentários.
export default function Comunidade({ dados, versao, aoEscolher, aoAbrirFuturo, avisar, moderar = false }) {
  const [escopo, setEscopo] = useState(() => {
    try { return localStorage.getItem('bolsalab:comunidade') || 'todos'; } catch { return 'todos'; }
  });
  const [lista, setLista] = useState(null);
  const [temMais, setTemMais] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = useCallback(async (antes = null) => {
    setCarregando(true); setErro('');
    try {
      const e = moderar || !dados?.grupos?.length ? 'todos' : escopo;
      const novos = await api.comunidade(e, antes, LIMITE);
      setLista((l) => (antes ? [...(l ?? []), ...novos] : novos));
      setTemMais(novos.length === LIMITE);
    } catch (e) {
      setErro(e.message);
      setLista((l) => l ?? []);
    } finally {
      setCarregando(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [escopo, moderar, dados?.grupos?.length]);

  useEffect(() => { setLista(null); carregar(); }, [carregar, versao]);

  const trocarEscopo = (e) => {
    setEscopo(e);
    try { localStorage.setItem('bolsalab:comunidade', e); } catch { /* sem armazenamento */ }
  };
  const mudar = (p) => setLista((l) => l.map((x) => (x.id === p.id ? p : x)));
  const escolher = (p) => (p.origem === 'futuro' ? aoAbrirFuturo?.(p.base) : aoEscolher?.(p.ativo));

  return (
    <div className="pilha comunidade">
      {!moderar && (
        <>
          <div className="secao-topo">
            <h1>Comunidade</h1>
          </div>
          <p className="suave">
            As operações de todos que simulam no BolsaLab. Reaja e comente.
          </p>
          <div className="chips" role="group" aria-label="Mostrar">
            {ESCOPOS.filter(([id]) => id !== 'grupo' || dados?.grupos?.length > 0).map(([id, rotulo]) => (
              <button key={id} aria-pressed={escopo === id} onClick={() => trocarEscopo(id)}>{rotulo}</button>
            ))}
          </div>
        </>
      )}

      {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {lista === null && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length === 0 && !erro && (
        <p className="cartao vazio">
          {escopo === 'grupo' && !moderar
            ? 'Ninguém dos seus grupos operou ainda. Que tal ser o primeiro?'
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
