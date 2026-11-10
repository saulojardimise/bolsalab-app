import { useAbrirPerfil } from '../lib/pessoa.js';

// Envolve foto e nome de alguém: tocando, abre o perfil da pessoa.
// Sem quem abra perfis (ou sem identificador), mostra só o conteúdo.
export default function BotaoPessoa({ id, nome, children, className = '' }) {
  const abrir = useAbrirPerfil();
  if (!abrir || !id) return <span className={className}>{children}</span>;
  return (
    <button type="button" className={`botao-pessoa ${className}`} onClick={(e) => { e.stopPropagation(); abrir(id); }}
            aria-label={nome ? `Ver o perfil de ${nome}` : 'Ver perfil'}>
      {children}
    </button>
  );
}
