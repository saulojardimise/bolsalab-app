import { quando } from '../lib/noticias.js';
import { nomeCurto } from '../lib/comunidade.js';
import Avatar from './Avatar.jsx';
import ChipTopico from './ChipTopico.jsx';
import Icone from './Icone.jsx';

// Lista de tópicos (página Discussões e seção da página de um ativo)
export default function ListaTopicos({ topicos, aoAbrir, compacta = false }) {
  return (
    <ul className={`cartao cartao-lista topicos ${compacta ? 'topicos-compactos' : ''}`}>
      {topicos.map((t) => (
        <li key={t.id}>
          <button className="topico-item" onClick={() => aoAbrir(t.id)}>
            {!compacta && <Avatar foto={t.foto_url} tamanho={36} />}
            <span className="topico-corpo">
              <span className="topico-titulo">
                {t.fixado && <span className="chip-fixado"><Icone nome="alfinete" tamanho={12} />Fixado</span>}
                <strong>{t.titulo}</strong>
              </span>
              {!compacta && <ChipTopico t={t} />}
              <small className="suave">
                {t.eu ? 'Você' : nomeCurto(t.nome)}{t.professor && ' (professor)'} · {quando(t.atividade_em)}
                {' · '}{t.respostas} {t.respostas === 1 ? 'resposta' : 'respostas'}
              </small>
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}
