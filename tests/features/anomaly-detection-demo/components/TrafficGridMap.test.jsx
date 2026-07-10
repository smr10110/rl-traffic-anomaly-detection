import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { TrafficGridMap } from '@/features/anomaly-detection-demo/components/TrafficGridMap'

const GRID_SIZE = 5

function emptyGrid() {
  return Array.from({ length: GRID_SIZE * GRID_SIZE }, () => ({
    visited: false,
    isAnomaly: false,
    isCongestion: false,
  }))
}

describe('TrafficGridMap', () => {
  it('en el estado inicial muestra el hint de "Grid listo" y ningún nodo visitado', () => {
    const { container } = render(
      <TrafficGridMap grid={emptyGrid()} gridSize={GRID_SIZE} position={{ row: 0, col: 0 }} hasStarted={false} />,
    )
    expect(screen.getByText(/grid listo/i)).toBeInTheDocument()
    expect(container.querySelectorAll('.grid-node--unvisited')).toHaveLength(GRID_SIZE * GRID_SIZE - 1) // menos la celda del agente
    expect(container.querySelectorAll('.grid-node--agent')).toHaveLength(1)
  })

  it('no muestra el hint una vez que el recorrido comenzó', () => {
    render(
      <TrafficGridMap grid={emptyGrid()} gridSize={GRID_SIZE} position={{ row: 0, col: 0 }} hasStarted />,
    )
    expect(screen.queryByText(/grid listo/i)).not.toBeInTheDocument()
  })

  it('marca celdas visitadas como anomalía, congestión o normal según corresponda', () => {
    const grid = emptyGrid()
    grid[6] = { visited: true, isAnomaly: true, isCongestion: false }
    grid[8] = { visited: true, isAnomaly: false, isCongestion: true }
    grid[10] = { visited: true, isAnomaly: false, isCongestion: false }
    const { container } = render(
      <TrafficGridMap grid={grid} gridSize={GRID_SIZE} position={{ row: 4, col: 4 }} hasStarted />,
    )
    expect(container.querySelectorAll('.grid-node--anomaly')).toHaveLength(1)
    expect(container.querySelectorAll('.grid-node--congestion')).toHaveLength(1)
    expect(container.querySelectorAll('.grid-node--normal')).toHaveLength(1)
  })

  it('la celda del agente tiene prioridad visual sobre su estado (anomalía/congestión)', () => {
    const grid = emptyGrid()
    grid[0] = { visited: true, isAnomaly: true, isCongestion: false }
    const { container } = render(
      <TrafficGridMap grid={grid} gridSize={GRID_SIZE} position={{ row: 0, col: 0 }} hasStarted />,
    )
    expect(container.querySelectorAll('.grid-node--agent')).toHaveLength(1)
    expect(container.querySelectorAll('.grid-node--anomaly')).toHaveLength(0)
  })

  it('el mapa incluye la posición del agente en su aria-label', () => {
    render(
      <TrafficGridMap grid={emptyGrid()} gridSize={GRID_SIZE} position={{ row: 2, col: 3 }} hasStarted />,
    )
    expect(screen.getByRole('img', { name: /fila 2, columna 3/i })).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad en el estado inicial', async () => {
    const { container } = render(
      <TrafficGridMap grid={emptyGrid()} gridSize={GRID_SIZE} position={{ row: 0, col: 0 }} hasStarted={false} />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no tiene violaciones de accesibilidad con datos (celdas visitadas)', async () => {
    const grid = emptyGrid()
    grid[6] = { visited: true, isAnomaly: true, isCongestion: false }
    grid[8] = { visited: true, isAnomaly: false, isCongestion: true }
    const { container } = render(
      <TrafficGridMap grid={grid} gridSize={GRID_SIZE} position={{ row: 3, col: 1 }} hasStarted />,
    )
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
