import { ChevronDown } from 'lucide-react'
import { Card } from '../../../components/Card'
import './QTablePanel.css'

const ACTION_LABELS = ['Arriba', 'Abajo', 'Izquierda', 'Derecha']

function cellIntensity(value, maxAbs) {
  if (maxAbs === 0) return 0
  return Math.min(1, Math.abs(value) / maxAbs)
}

export function QTablePanel({ qTable }) {
  const maxAbs = Math.max(1, ...qTable.flat().map(Math.abs))

  return (
    <Card dark className="qtable-panel">
      <details className="qtable-panel__details">
        <summary className="qtable-panel__summary">
          <ChevronDown size={16} aria-hidden="true" className="qtable-panel__chevron" />
          <span>Ver tabla Q completa ({qTable.length} estados × 4 acciones)</span>
        </summary>
        <h3 className="qtable-panel__title">Tabla Q completa</h3>
        <p className="qtable-panel__hint">
          Cada fila es una posición del grid. El color muestra qué tan conveniente le parece al
          agente moverse en cada dirección desde ahí:{' '}
          <span className="qtable-panel__legend-swatch qtable-panel__legend-swatch--up" /> favorable,{' '}
          <span className="qtable-panel__legend-swatch qtable-panel__legend-swatch--down" /> desfavorable
          (evita congestión) — más intenso significa más seguro de esa estimación.
        </p>
        <div className="qtable-grid" role="table" aria-label="Tabla Q del agente">
          <div className="qtable-grid__header" role="row">
            <span role="columnheader">Estado</span>
            {ACTION_LABELS.map((label) => (
              <span role="columnheader" key={label}>{label}</span>
            ))}
          </div>
          {qTable.map((row, state) => (
            <div className="qtable-grid__row" role="row" key={state}>
              <span className="qtable-grid__state" role="cell">{state}</span>
              {row.map((value, action) => (
                <span
                  key={action}
                  role="cell"
                  className={`qtable-grid__cell ${value >= 0 ? 'qtable-grid__cell--up' : 'qtable-grid__cell--down'}`}
                  style={{ opacity: 0.15 + cellIntensity(value, maxAbs) * 0.85 }}
                >
                  {value.toFixed(2)}
                </span>
              ))}
            </div>
          ))}
        </div>
      </details>
    </Card>
  )
}
