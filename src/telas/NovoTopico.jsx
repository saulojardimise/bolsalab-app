import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import ListaTopicos from '../componentes/ListaTopicos.jsx';
import Icone from '../componentes/Icone.jsx';

// Abrir um tópico. inicial: { ativo: 'WEGE3' } ou { noticia: { id, titulo, link } } quando vem
// da página de um ativo ou do "Discutir isso" de uma notícia.
export default function NovoTopico({ inicial = {}, mercado = [], aoVoltar, aoCriado, aoAbrirTopico }) {
  const sobreInicial = inicial.noticia ? 'noticia' : ['WIN', 'WDO'].includes(inicial.ativo) ? 'futuro' : inicial.ativo ? 'acao' : 'geral';
  const [sobre, setSobre] = useState(sobreInicial);
  const [ativo, setAtivo] = useState(inicial.ativo ?? '');
  const [titulo, setTitulo] = useState('');
  const [texto, setTexto] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [existentes, setExistentes] = useState([]);

  const alvoAtivo = sobre === 'acao' || sobre === 'futuro' ? ativo : null;
  const noticia = sobre === 'noticia' ? inicial.noticia : null;

  // mostra discussões que já existem sobre o mesmo assunto, para não repetir
  useEffect(() => {
    let vivo = true;
    if (!alvoAtivo && !noticia) { setExistentes([]); return undefined; }
    api.topicos({ ativo: alvoAtivo, noticia: noticia?.id ?? null, limite: 3 })
      .then((l) => vivo && setExistentes(l)).catch(() => vivo && setExistentes([]));
    return () => { vivo = false; };
  }, [alvoAtivo, noticia]);

  async function criar(e) {
    e.preventDefault();
    setErro('');
    if (titulo.trim().length < 5) { setErro('Escreva um título com pelo menos 5 letras.'); return; }
    if ((sobre === 'acao' || sobre === 'futuro') && !ativo) { setErro('Escolha o ativo.'); return; }
    setEnviando(true);
    try {
      const id = await api.criarTopico({ titulo: titulo.trim(), texto: texto.trim(), ativo: alvoAtivo || null, noticia });
      aoCriado(id);
    } catch (err) { setErro(err.message); } finally { setEnviando(false); }
  }

  const acoes = [...mercado].sort((a, b) => a.ticker.localeCompare(b.ticker));
  const exemplo = sobre === 'acao' && ativo ? `Ex.: ${ativo} está cara?`
    : sobre === 'futuro' ? 'Ex.: Vale a pena operar o mini dólar agora?'
      : sobre === 'noticia' ? 'Ex.: Essa notícia é boa para o acionista?' : 'Ex.: Como vocês escolhem um setor?';

  return (
    <div className="pilha">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>Novo tópico</h1>
        <span style={{ width: 40 }} />
      </header>

      <form className="cartao formulario" onSubmit={criar}>
        <fieldset className="campo">
          <legend>Sobre o quê?</legend>
          <div className="chips" role="group">
            {[['geral', 'Geral'], ['acao', 'Uma ação'], ['futuro', 'Minicontrato'],
              ...(inicial.noticia ? [['noticia', 'A notícia']] : [])].map(([id, rotulo]) => (
              <button type="button" key={id} aria-pressed={sobre === id}
                      onClick={() => { setSobre(id); if (id === 'futuro' && !['WIN', 'WDO'].includes(ativo)) setAtivo('WIN'); if (id === 'acao' && ['WIN', 'WDO'].includes(ativo)) setAtivo(''); }}>
                {rotulo}
              </button>
            ))}
          </div>
        </fieldset>

        {sobre === 'acao' && (
          <label className="campo">
            <span>Ação</span>
            <select value={ativo} onChange={(e) => setAtivo(e.target.value)}>
              <option value="">Escolha a ação</option>
              {acoes.map((a) => <option key={a.ticker} value={a.ticker}>{a.ticker} · {a.nome}</option>)}
            </select>
          </label>
        )}
        {sobre === 'futuro' && (
          <label className="campo">
            <span>Minicontrato</span>
            <select value={ativo} onChange={(e) => setAtivo(e.target.value)}>
              <option value="WIN">Mini Ibovespa (WIN)</option>
              <option value="WDO">Mini dólar (WDO)</option>
            </select>
          </label>
        )}
        {sobre === 'noticia' && (
          <p className="topico-noticia-alvo"><Icone nome="noticias" tamanho={16} /><span>{inicial.noticia.titulo}</span></p>
        )}

        <label className="campo">
          <span>Título</span>
          <input value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={120} placeholder={exemplo} autoFocus />
        </label>
        <label className="campo">
          <span>Explique melhor <small className="suave">(opcional)</small></span>
          <textarea rows={4} maxLength={2000} value={texto} onChange={(e) => setTexto(e.target.value)}
                    placeholder="Conte o que você pensa e o que quer saber dos colegas." />
        </label>

        {erro && <p className="aviso aviso-erro" role="alert">{erro}</p>}
        <button className="botao botao-principal" disabled={enviando}>{enviando ? 'Publicando…' : 'Publicar tópico'}</button>
      </form>

      {existentes.length > 0 && (
        <section aria-labelledby="titulo-existentes">
          <h2 id="titulo-existentes" className="secao-titulo">Já existem discussões sobre isso</h2>
          <ListaTopicos topicos={existentes} aoAbrir={aoAbrirTopico} compacta />
        </section>
      )}
    </div>
  );
}
