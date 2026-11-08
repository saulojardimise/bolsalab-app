import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import ListaTopicos from './ListaTopicos.jsx';
import Icone from './Icone.jsx';

// Seção "Discussões sobre X" na página de uma ação ou minicontrato
export default function DiscussoesDoAtivo({ ativo, rotulo = ativo, aoAbrirTopico, aoNovoTopico, aoVerTodas }) {
  const [lista, setLista] = useState(null);

  useEffect(() => {
    let vivo = true;
    api.topicos({ ativo, limite: 4 }).then((l) => vivo && setLista(l)).catch(() => vivo && setLista([]));
    return () => { vivo = false; };
  }, [ativo]);

  if (lista === null || !aoAbrirTopico) return null;
  return (
    <section className="discussoes-ativo" aria-labelledby={`titulo-discussoes-${ativo}`}>
      <div className="secao-topo">
        <h2 id={`titulo-discussoes-${ativo}`}>Discussões sobre {rotulo}</h2>
        {lista.length > 3 && (
          <button className="link-acao" onClick={() => aoVerTodas(ativo)}>Ver todas <Icone nome="seta" tamanho={16} /></button>
        )}
      </div>
      {lista.length > 0
        ? <ListaTopicos topicos={lista.slice(0, 3)} aoAbrir={aoAbrirTopico} compacta />
        : <p className="cartao vazio">Ninguém abriu uma discussão sobre {rotulo} ainda.</p>}
      <button className="botao" onClick={() => aoNovoTopico({ ativo })}>
        <Icone nome="discussoes" tamanho={18} />Começar uma discussão sobre {rotulo}
      </button>
    </section>
  );
}
