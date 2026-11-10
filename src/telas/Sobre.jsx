import { useEffect, useState } from 'react';
import { api } from '../api/index.js';
import Icone from '../componentes/Icone.jsx';
import Marca from '../componentes/Marca.jsx';
import Termos from '../componentes/Termos.jsx';

// Sobre o app: quem criou, para quê e como o BolsaLab é usado nas aulas.
export default function Sobre({ aoVoltar }) {
  const [foto, setFoto] = useState(null);
  const [termos, setTermos] = useState(false);

  useEffect(() => {
    let vivo = true;
    api.fotoProfessor?.().then((f) => vivo && setFoto(f)).catch(() => {});
    return () => { vivo = false; };
  }, []);

  return (
    <div className="pilha sobre">
      <header className="barra-acao">
        <button className="botao-icone" onClick={aoVoltar} aria-label="Voltar"><Icone nome="voltar" /></button>
        <h1>Sobre o app</h1>
        <span style={{ width: 40 }} />
      </header>

      <section className="cartao sobre-marca">
        <Marca />
        <p>
          O BolsaLab é um simulador de investimentos feito para a sala de aula. Cada pessoa começa com
          <strong> R$ 10.000 virtuais</strong> e investe em ações, ETFs e minicontratos futuros com os
          preços reais da B3.
        </p>
      </section>

      <section className="cartao sobre-autor" aria-labelledby="titulo-autor">
        {foto
          ? <img className="sobre-foto" src={foto} alt="Professor Saulo Jardim" width="96" height="96" />
          : <span className="sobre-foto sobre-foto-vazia" aria-hidden="true"><Icone nome="usuario" tamanho={40} /></span>}
        <div>
          <h2 id="titulo-autor">Prof. Saulo Jardim</h2>
          <p className="suave">Doutor em Economia pela Universidade Federal Fluminense (UFF)</p>
        </div>
        <p>
          O BolsaLab foi criado pelo professor Saulo Jardim para apoiar as disciplinas de
          <strong> Economia, Administração e Finanças</strong>.
        </p>
      </section>

      <section className="cartao" aria-labelledby="titulo-proposta">
        <h2 id="titulo-proposta">A proposta</h2>
        <p>
          Aproximar a teoria da prática. Em vez de só ler sobre o mercado, o aluno toma decisões, acompanha
          as consequências e aprende com os próprios acertos e erros, sem arriscar dinheiro de verdade.
        </p>
        <p>
          Mais do que acertar ou errar, o objetivo é construir uma leitura <strong>didática e crítica</strong> do
          mercado: entender risco, diversificação, custos e alavancagem; perceber como notícias e juros mexem
          nos preços; comparar o próprio resultado com o Ibovespa e o CDI; e debater as escolhas com os colegas.
        </p>
      </section>

      <section className="cartao" aria-labelledby="titulo-como">
        <h2 id="titulo-como">Como é usado nas aulas</h2>
        <ul className="sobre-lista">
          <li>Cada turma tem um grupo e um ranking próprio.</li>
          <li>As operações aparecem na comunidade, onde os alunos reagem, comentam e abrem discussões.</li>
          <li>Os termos técnicos têm explicação no próprio app: é só tocar no <strong>?</strong>.</li>
          <li>O professor acompanha a turma, publica avisos e registra os eventos das empresas, como troca de código e desdobramento de ações.</li>
        </ul>
      </section>

      <p className="nota">
        O BolsaLab é uma ferramenta educacional. O dinheiro é virtual e nada aqui é recomendação de investimento.
      </p>
      <button className="botao" onClick={() => setTermos(true)}>Termos de Uso e Política de Privacidade</button>
      {termos && <Termos aoFechar={() => setTermos(false)} />}
      <p className="sobre-assinatura">Desenvolvido pelo <strong>Prof. Dr. Saulo Jardim</strong></p>
    </div>
  );
}
