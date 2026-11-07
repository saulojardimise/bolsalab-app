import Icone from './Icone.jsx';
import Marca from './Marca.jsx';
import Avatar from './Avatar.jsx';

// Cabeçalho: marca, aviso de simulação e botão do perfil (com a foto do aluno)
export default function Topo({ foto, aoAbrirPerfil, naoLidas = 0, aoAbrirNotificacoes }) {
  return (
    <header className="topo">
      <Marca />
      <span className="chip-simulacao"><Icone nome="capelo" tamanho={18} />SIMULAÇÃO</span>
      {aoAbrirNotificacoes && (
        <button className="botao-icone botao-sino" onClick={aoAbrirNotificacoes}
                aria-label={naoLidas ? `Notificações, ${naoLidas} novas` : 'Notificações'}>
          <span className="nav-icone">
            <Icone nome="sino" tamanho={24} />
            {naoLidas > 0 && <span className="contador" aria-hidden="true">{naoLidas > 99 ? '99+' : naoLidas}</span>}
          </span>
        </button>
      )}
      <button className="avatar-botao" onClick={aoAbrirPerfil} aria-label="Abrir perfil">
        <Avatar foto={foto} />
      </button>
    </header>
  );
}
