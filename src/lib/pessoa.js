import { createContext, useContext } from 'react';

// Quem mostra telas com nomes de pessoas fornece "abrir perfil" por aqui.
export const AbrirPerfilContexto = createContext(null);
export const useAbrirPerfil = () => useContext(AbrirPerfilContexto);

// identificador da pessoa num item (publicação, comentário, tópico, ranking)
export const idDaPessoa = (x) => x?.autor_id ?? x?.user_id ?? null;

// "há 3 dias", "há 2 meses", "há 1 ano"
export function tempoNoApp(iso, agora = new Date()) {
  if (!iso) return '';
  const dias = Math.floor((agora - new Date(iso)) / 86400000);
  if (dias < 1) return 'Entrou hoje';
  if (dias < 30) return `Há ${dias} ${dias === 1 ? 'dia' : 'dias'} no app`;
  const meses = Math.floor(dias / 30.44);
  if (meses < 12) return `Há ${meses} ${meses === 1 ? 'mês' : 'meses'} no app`;
  const anos = Math.floor(meses / 12);
  return `Há ${anos} ${anos === 1 ? 'ano' : 'anos'} no app`;
}
