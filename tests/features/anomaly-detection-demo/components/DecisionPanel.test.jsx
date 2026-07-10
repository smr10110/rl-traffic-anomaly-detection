import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { DecisionPanel } from '@/features/anomaly-detection-demo/components/DecisionPanel'
import { ACTIONS } from '@/core/environment/TrafficGridEnv'

const GRID_SIZE = 5

function makeQTable(rowIndex, values) {
  const qTable = Array.from({ length: 25 }, () => [0, 0, 0, 0])
  qTable[rowIndex] = values
  return qTable
}

describe('DecisionPanel', () => {
  it('muestra el mensaje vacío cuando no hay entry', () => {
    render(<DecisionPanel entry={null} qTable={[]} gridSize={GRID_SIZE} />)
    expect(screen.getByText(/presiona "avanzar" para ver la primera decisión/i)).toBeInTheDocument()
  })

  it('calcula fila y columna a partir de fromState y gridSize', () => {
    const entry = { fromState: 7, action: ACTIONS.RIGHT, isAnomaly: false, isNewVisit: false }
    const qTable = makeQTable(7, [1, 1, 1, 1])
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    // 7 = fila 1, columna 2
    expect(screen.getByText(/\(1, 2\)/)).toBeInTheDocument()
  })

  it('detecta exploración cuando la acción tomada no es la de mayor valor Q', () => {
    const entry = { fromState: 0, action: ACTIONS.LEFT, isAnomaly: false, isNewVisit: false }
    // greedy sería UP (index 0, valor 5); el agente eligió LEFT
    const qTable = makeQTable(0, [5, 1, 1, 1])
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    expect(screen.getByText(/exploró al azar/i)).toBeInTheDocument()
  })

  it('detecta decisión clara cuando el margen entre el mejor y el segundo mejor es amplio', () => {
    const entry = { fromState: 0, action: ACTIONS.UP, isAnomaly: false, isNewVisit: false }
    const qTable = makeQTable(0, [5, 1, 1, 1]) // margen = 4 > 1
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    expect(screen.getByText(/decisión clara/i)).toBeInTheDocument()
  })

  it('detecta decisión reñida cuando el margen es pequeño', () => {
    const entry = { fromState: 0, action: ACTIONS.UP, isAnomaly: false, isNewVisit: false }
    const qTable = makeQTable(0, [5, 4.5, 1, 1]) // margen = 0.5 <= 1
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    expect(screen.getByText(/decisión reñida/i)).toBeInTheDocument()
  })

  it('anuncia el hallazgo de una anomalía en primera visita', () => {
    const entry = { fromState: 3, action: ACTIONS.DOWN, isAnomaly: true, isNewVisit: true }
    const qTable = makeQTable(3, [1, 1, 1, 1])
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    expect(screen.getByText(/encontró una/i)).toBeInTheDocument()
    expect(screen.getByText('anomalía')).toBeInTheDocument()
  })

  it('no anuncia hallazgo si la anomalía ya había sido visitada antes', () => {
    const entry = { fromState: 3, action: ACTIONS.DOWN, isAnomaly: true, isNewVisit: false }
    const qTable = makeQTable(3, [1, 1, 1, 1])
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    expect(screen.queryByText(/encontró una/i)).not.toBeInTheDocument()
  })

  it('renderiza los 4 valores Q de la cruz de decisión', () => {
    const entry = { fromState: 0, action: ACTIONS.UP, isAnomaly: false, isNewVisit: false }
    const qTable = makeQTable(0, [1.5, -2, 0, 3.25])
    render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    expect(screen.getByText('1.50')).toBeInTheDocument()
    expect(screen.getByText('-2.00')).toBeInTheDocument()
    expect(screen.getByText('0.00')).toBeInTheDocument()
    expect(screen.getByText('3.25')).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad en el estado vacío', async () => {
    const { container } = render(<DecisionPanel entry={null} qTable={[]} gridSize={GRID_SIZE} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no tiene violaciones de accesibilidad con una decisión ya tomada', async () => {
    const entry = { fromState: 12, action: ACTIONS.RIGHT, isAnomaly: true, isNewVisit: true }
    const qTable = makeQTable(12, [1, 2, 3, 4])
    const { container } = render(<DecisionPanel entry={entry} qTable={qTable} gridSize={GRID_SIZE} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
