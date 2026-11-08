import { useCallback, useEffect, useState } from 'react';
import { api } from '../../api/index.js';
import { quando } from '../../lib/noticias.js';
import Icone from '../../componentes/Icone.jsx';

// O gestor escreve avisos que aparecem no sino de notificações:
// para todo mundo ou só para as pessoas de um grupo. Ficam 30 dias.
export default function AvisosGestor({ avisar }) {
  const [lista, setLista] = useState(null);
  const [grupos, setGrupos] = useState([]);
  const [aberto, setAberto] = useState(false);
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [grupo, setGrupo] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [apagando, setApagando] = useState(null);

  const carregar = useCallback(() => {
    api.avisosGestor().then(setLista).catch((e) => { setErro(e.message); setLista([]); });
  }, []);
  useEffect(() => {
    carregar();
    api.turmas().then(setGrupos).catch(() => {});
  }, [carregar]);

  async function enviar(e) {
    e.preventDefault();
    setErro('');
    if (titulo.trim().length < 3) { setErro('Escreva um título com pelo menos 3 letras.'); return; }
    setEnviando(true);
    try {
      await api.criarAviso({ titulo, texto, grupo: grupo ? Number(grupo) : null });
      const nomeGrupo = grupos.find((g) => String(g.id) === grupo)?.nome;
      avisar(nomeGrupo ? `Aviso enviado para o grupo ${nomeGrupo}.` : 'Aviso enviado para todo mundo.');
      setTitulo(''); setTexto(''); setGrupo(''); setAberto(false);
      carregar();
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  async function apagar(id) {
    setErro('');
    try {
      await api.apagarAviso(id);
      avisar('Aviso apagado. Ele some do sino de todos.');
      setApagando(null);
      carregar();
    } catch (err) { setErro(err.message); }
  }

  return (
    <section aria-labelledby="titulo-avisos" className="avisos-gestor">
      <h2 id="titulo-avisos" className="secao-titulo">Avisos no sino</h2>
      <p className="suave">
        Escreva um aviso e ele aparece nas notificações (o sino) de todo mundo ou só de um grupo, por 30 dias.
      </p>

      {!aberto && (
        <button className="botao botao-principal" onClick={() => setAberto(true)}>
          <Icone nome="sino" tamanho={18} />Novo aviso
        </button>
      )}

      {aberto && (
        <form className="cartao formulario" onSubmit={enviar} aria-label="Novo aviso">
          <label className="campo">
            <span>Para quem</span>
            <select value={grupo} onChange={(e) => setGrupo(e.target.value)}>
              <option value="">Todo mundo</option>
              {grupos.map((g) => <option key={g.id} value={g.id}>Grupo {g.nome}</option>)}
            </select>
          </label>
          <label className="campo">
            <span>Título</span>
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} autoFocus
                   placeholder="Ex.: Ranking fecha na sexta às 18h" />
          </label>
          <label className="campo">
            <span>Mensagem <small className="suave">(opcional)</small></span>
            <textarea rows={4} maxLength={1000} value={texto} onChange={(e) => setTexto(e.target.value)}
                      placeholder="Detalhes do aviso." />
          </label>
          {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
          <div className="botoes-linha">
            <button type="button" className="botao" onClick={() => { setAberto(false); setErro(''); }}>Cancelar</button>
            <button className="botao botao-principal" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar aviso'}</button>
          </div>
        </form>
      )}

      {!aberto && erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
      {lista === null && <p className="carregando" aria-busy="true">Carregando…</p>}
      {lista?.length > 0 && (
        <ul className="cartao cartao-lista lista-avisos">
          {lista.map((a) => (
            <li key={a.id}>
              <p className="aviso-linha-topo">
                <strong>{a.titulo}</strong>
                <span className={`chip-destino ${a.do_professor ? '' : 'chip-destino-sistema'}`}>
                  {a.do_professor ? (a.grupo ? `Grupo ${a.grupo}` : 'Todo mundo') : 'Sistema'}
                </span>
              </p>
              {a.texto && <p className="aviso-texto">{a.texto}</p>}
              <p className="suave aviso-rodape">
                <span>{quando(a.criado_em)} · {a.pessoas} {Number(a.pessoas) === 1 ? 'pessoa' : 'pessoas'}</span>
                {apagando === a.id ? (
                  <span className="botoes-membro">
                    <span>Apagar do sino de todos?</span>
                    <button className="link link-perigo" onClick={() => apagar(a.id)}>Sim, apagar</button>
                    <button className="link" onClick={() => setApagando(null)}>Não</button>
                  </span>
                ) : (
                  <button className="link link-perigo" onClick={() => setApagando(a.id)}>Apagar</button>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
