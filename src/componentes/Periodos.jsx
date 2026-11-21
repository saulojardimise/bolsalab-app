import { periodosDisponiveis } from '../lib/periodos.js';

// Seletor de período dos gráficos. `desde`: primeira data da série (libera 6M e 1A quando houver dados)
export default function Periodos({ valor, aoTrocar, desde }) {
  return (
    <div className="periodos" role="group" aria-label="Período do gráfico">
      {periodosDisponiveis(desde).map((p) => (
        <button key={p.id} type="button" aria-pressed={valor === p.id} onClick={() => aoTrocar(p.id)}>
          {p.rotulo}
        </button>
      ))}
    </div>
  );
}
