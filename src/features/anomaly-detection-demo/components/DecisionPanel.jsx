import { Card } from '../../../components/Card'
import { ACTIONS } from '../../../core/environment/TrafficGridEnv'
import './DecisionPanel.css'

const DIRS = [
  { key: 'up', action: ACTIONS.UP, arrow: '↑', area: 'up', row: false },
  { key: 'left', action: ACTIONS.LEFT, arrow: '←', area: 'left', row: true },
  { key: 'right', action: ACTIONS.RIGHT, arrow: '→', area: 'right', row: true },
  { key: 'down', action: ACTIONS.DOWN, arrow: '↓', area: 'down', row: false },
]

const DIR_NAMES = { [ACTIONS.UP]: 'Arriba', [ACTIONS.DOWN]: 'Abajo', [ACTIONS.LEFT]: 'Izquierda', [ACTIONS.RIGHT]: 'Derecha' }

export function DecisionPanel({ entry, qTable, gridSize }) {
  if (!entry) {
    return (
      <Card dark className="decision-panel">
        <h3>Por qué decidió esto</h3>
        <p className="decision-panel__empty">Presiona "Avanzar" para ver la primera decisión.</p>
      </Card>
    )
  }

  const { fromState, action, isAnomaly, isNewVisit } = entry
  const row = Math.floor(fromState / gridSize)
  const col = fromState % gridSize
  const qValues = qTable[fromState]

  const maxValue = Math.max(...qValues)
  const minValue = Math.min(...qValues)
  const range = maxValue - minValue || 1
  const greedyAction = qValues.indexOf(maxValue)
  const wasExploration = action !== greedyAction

  const sorted = [...qValues].sort((a, b) => b - a)
  const margin = sorted[0] - sorted[1]
  const wasClearChoice = margin > 1

  return (
    <Card dark className="decision-panel">
      <h3>Por qué decidió esto</h3>
      <p className="decision-panel__state">
        Desde la intersección <b>({row}, {col})</b>
        {isNewVisit && isAnomaly && <> — encontró una <b className="decision-panel__anomaly">anomalía</b></>}
      </p>

      <div className="cross">
        {DIRS.map((dir) => {
          const value = qValues[dir.action]
          const barPct = Math.max(6, ((value - minValue) / range) * 100)
          return (
            <div
              key={dir.key}
              className={`cross__item cross__item--${dir.area} ${dir.row ? 'cross__item--row' : ''} ${action === dir.action ? 'cross__item--chosen' : ''}`}
            >
              <span className="cross__arrow" aria-hidden="true">{dir.arrow}</span>
              <span className="cross__value">{value.toFixed(2)}</span>
              <span className="cross__bar-track" aria-hidden="true">
                <span
                  className={`cross__bar-fill ${value >= 0 ? 'cross__bar-fill--up' : 'cross__bar-fill--down'}`}
                  style={{ width: `${barPct}%` }}
                />
              </span>
            </div>
          )
        })}
      </div>

      <p className="decision-panel__reason">
        {wasExploration ? (
          <>
            <strong>Exploró al azar (ε):</strong> esta vez no eligió{' '}
            {DIR_NAMES[greedyAction]} (el valor más alto, {maxValue.toFixed(2)}), sino{' '}
            {DIR_NAMES[action]} — así descubre rutas que todavía no conoce bien.
          </>
        ) : wasClearChoice ? (
          <>
            <strong>Decisión clara:</strong> {DIR_NAMES[action]} tiene un valor notablemente más
            alto que las demás opciones.
          </>
        ) : (
          <>
            <strong>Decisión reñida:</strong> {DIR_NAMES[action]} ganó por poco — el agente todavía
            no está muy seguro de cuál es la mejor dirección desde aquí.
          </>
        )}
      </p>
    </Card>
  )
}
