import { useEffect, useRef, useState } from 'react';
import Icone from './Icone.jsx';

// Abas do app. No celular: barra embaixo com as principais e "Mais" para o resto.
// No PC: menu lateral com todas (o CSS esconde o "Mais" e mostra as abas extras).
const ABAS = [
  ['inicio', 'Início'],
  ['mercado', 'Mercado'],
  ['comunidade', 'Comunidade'],
  ['carteira', 'Carteira'],
];
// no celular ficam dentro do "Mais"; no PC aparecem no menu lateral
const EXTRAS = [
  ['noticias', 'Notícias', 'Manchetes do dia e fatos relevantes'],
  ['turma', 'Grupo', 'Ranking e colegas do seu grupo'],
];

export default function Navegacao({ aba, aoTrocar, aoAbrirExtrato, aoAbrirPerfil }) {
  const [maisAberto, setMaisAberto] = useState(false);
  const noMais = EXTRAS.some(([id]) => id === aba);

  return (
    <>
      <nav className="navegacao" aria-label="Seções">
        {[...ABAS, ...EXTRAS].map(([id, rotulo]) => (
          <button key={id} className={`nav-item nav-${id} ${EXTRAS.some(([e]) => e === id) ? 'nav-extra' : ''}`}
                  aria-current={aba === id ? 'page' : undefined} onClick={() => aoTrocar(id)}>
            <Icone nome={id} tamanho={24} />
            <span>{rotulo}</span>
          </button>
        ))}
        {/* só no PC: o que no celular fica no "Mais" */}
        <button className="nav-item nav-extra nav-separado" aria-current={aba === 'extrato' ? 'page' : undefined} onClick={aoAbrirExtrato}>
          <Icone nome="extrato" tamanho={24} />
          <span>Extrato</span>
        </button>
        <button className="nav-item nav-extra" onClick={aoAbrirPerfil}>
          <Icone nome="usuario" tamanho={24} />
          <span>Meu perfil</span>
        </button>
        <button className="nav-item nav-mais" aria-current={noMais ? 'page' : undefined}
                aria-haspopup="dialog" onClick={() => setMaisAberto(true)}>
          <Icone nome="menu" tamanho={24} />
          <span>Mais</span>
        </button>
      </nav>
      {maisAberto && (
        <FolhaMais aba={aba} aoFechar={() => setMaisAberto(false)}
                   aoEscolher={(acao) => { setMaisAberto(false); acao(); }}
                   itens={[
                     ...EXTRAS.map(([id, rotulo, detalhe]) => ({ id, icone: id, rotulo, detalhe, acao: () => aoTrocar(id) })),
                     { id: 'extrato', icone: 'extrato', rotulo: 'Extrato', detalhe: 'Todo o dinheiro que entrou e saiu', acao: aoAbrirExtrato },
                     { id: 'perfil', icone: 'usuario', rotulo: 'Meu perfil', detalhe: 'Foto, desempenho, perfil de investidor e senha', acao: aoAbrirPerfil },
                   ]} />
      )}
    </>
  );
}

function FolhaMais({ aba, itens, aoFechar, aoEscolher }) {
  const dialogo = useRef(null);
  useEffect(() => {
    const d = dialogo.current;
    d.showModal();
    return () => d.close();
  }, []);

  return (
    <dialog ref={dialogo} className="folha" aria-labelledby="titulo-mais"
            onCancel={(e) => { e.preventDefault(); aoFechar(); }}
            onClick={(e) => e.target === dialogo.current && aoFechar()}>
      <div className="mais">
        <div className="mais-topo">
          <h2 id="titulo-mais">Mais</h2>
          <button className="botao-icone" onClick={aoFechar} aria-label="Fechar"><Icone nome="fechar" /></button>
        </div>
        <ul className="mais-lista">
          {itens.map((i) => (
            <li key={i.id}>
              <button className="atalho" aria-current={aba === i.id ? 'page' : undefined} onClick={() => aoEscolher(i.acao)}>
                <Icone nome={i.icone} />
                <span><strong>{i.rotulo}</strong><small>{i.detalhe}</small></span>
                <Icone nome="seta" tamanho={18} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </dialog>
  );
}
