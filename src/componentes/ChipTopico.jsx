import Icone from './Icone.jsx';

const NOMES_FUTURO = { WIN: 'Mini Ibovespa', WDO: 'Mini dólar' };

// Etiqueta do que o tópico discute: ação, minicontrato ou notícia
export default function ChipTopico({ t, aoAbrirAtivo, grande = false }) {
  if (t.ativo) {
    const futuro = NOMES_FUTURO[t.ativo];
    const rotulo = futuro ? `${futuro} (${t.ativo})` : t.ativo;
    // na lista o tópico inteiro já é um botão: a etiqueta é só texto
    if (!aoAbrirAtivo) return <span className="chip-topico"><Icone nome="mercado" tamanho={14} />{rotulo}</span>;
    return (
      <button type="button" className="chip-topico" onClick={() => aoAbrirAtivo(t.ativo)}>
        <Icone nome="mercado" tamanho={14} />
        {rotulo}
      </button>
    );
  }
  if (t.noticia_titulo) {
    return grande && t.noticia_link ? (
      <a className="chip-topico chip-topico-noticia" href={t.noticia_link} target="_blank" rel="noopener noreferrer">
        <Icone nome="noticias" tamanho={14} /><span>{t.noticia_titulo}</span>
      </a>
    ) : (
      <span className="chip-topico chip-topico-noticia"><Icone nome="noticias" tamanho={14} /><span>{t.noticia_titulo}</span></span>
    );
  }
  return null;
}
