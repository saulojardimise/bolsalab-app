// Assinatura no fim das páginas. Tocando, abre "Sobre o app".
export default function Assinatura({ aoAbrir }) {
  const texto = <>Desenvolvido pelo <strong>Prof. Dr. Saulo Jardim</strong></>;
  return (
    <footer className="assinatura">
      {aoAbrir ? <button className="link" onClick={aoAbrir}>{texto}</button> : <span>{texto}</span>}
    </footer>
  );
}
