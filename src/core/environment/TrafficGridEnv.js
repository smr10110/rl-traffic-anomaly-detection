// Entorno MDP puro — sin imports de React. Ver CLAUDE.md, sección "Caso práctico de anomalías".
//
// El agente (un dron de monitoreo) patrula un grid de intersecciones (posición 2D) y aprende a
// NAVEGAR hacia las que tienen anomalías de tráfico reales (accidentes/cortes), evitando las
// zonas de congestión. La acción es un movimiento (arriba/abajo/izquierda/derecha) y la
// recompensa refleja el costo real de la misión: tiempo/batería, retraso por congestión, y el
// valor de encontrar la anomalía.

export const GRID_SIZE = 5
export const STATE_COUNT = GRID_SIZE * GRID_SIZE // 25 posiciones
export const ACTIONS = Object.freeze({ UP: 0, DOWN: 1, LEFT: 2, RIGHT: 3 })
export const ACTION_COUNT = Object.keys(ACTIONS).length

const ACTION_DELTAS = {
  [ACTIONS.UP]: [-1, 0],
  [ACTIONS.DOWN]: [1, 0],
  [ACTIONS.LEFT]: [0, -1],
  [ACTIONS.RIGHT]: [0, 1],
}

const ANOMALY_PROBABILITY = 0.18
const CONGESTION_PROBABILITY = 0.15

// Recompensas — ver CLAUDE.md / docs/decisions/ para la justificación de negocio de cada valor.
export const STEP_PENALTY = -1 // cada movimiento consume tiempo/batería del dron
export const CONGESTION_PENALTY = -50 // entrar a un embotellamiento retrasa la misión
export const ANOMALY_REWARD = 100 // llegar a la coordenada del accidente/corte

export const MAX_STEPS = 50

export function encodePosition(row, col, gridSize = GRID_SIZE) {
  return row * gridSize + col
}

// rng es inyectable para que la generación sea determinística en tests (ver test-writer agent).
// Cada celda es anomalía, congestión, o normal — mutuamente excluyentes.
export function generateGrid(gridSize = GRID_SIZE, rng = Math.random) {
  return Array.from({ length: gridSize * gridSize }, () => {
    const roll = rng()
    return {
      isAnomalyGroundTruth: roll < ANOMALY_PROBABILITY,
      isCongestionGroundTruth: roll >= ANOMALY_PROBABILITY && roll < ANOMALY_PROBABILITY + CONGESTION_PROBABILITY,
    }
  })
}

export class TrafficGridEnv {
  constructor({ rng = Math.random, gridSize = GRID_SIZE } = {}) {
    this.rng = rng
    this.gridSize = gridSize
    this.grid = null
    this.position = null
    this.visited = null
    this.stepCount = 0
  }

  reset() {
    this.grid = generateGrid(this.gridSize, this.rng)
    this.position = { row: 0, col: 0 }
    this.visited = new Set([encodePosition(0, 0, this.gridSize)])
    this.stepCount = 0
    return encodePosition(0, 0, this.gridSize)
  }

  step(action) {
    const [dRow, dCol] = ACTION_DELTAS[action]
    const row = Math.min(this.gridSize - 1, Math.max(0, this.position.row + dRow))
    const col = Math.min(this.gridSize - 1, Math.max(0, this.position.col + dCol))
    this.position = { row, col }

    const nodeIndex = encodePosition(row, col, this.gridSize)
    const node = this.grid[nodeIndex]
    const isNewVisit = !this.visited.has(nodeIndex)

    let reward
    if (isNewVisit && node.isAnomalyGroundTruth) reward = ANOMALY_REWARD
    else if (node.isCongestionGroundTruth) reward = CONGESTION_PENALTY
    else reward = STEP_PENALTY

    this.visited.add(nodeIndex)
    this.stepCount += 1

    const allAnomaliesFound = this.grid.every(
      (n, i) => !n.isAnomalyGroundTruth || this.visited.has(i),
    )
    const done = allAnomaliesFound || this.stepCount >= MAX_STEPS

    return {
      position: this.position,
      nodeIndex,
      isAnomaly: node.isAnomalyGroundTruth,
      isCongestion: node.isCongestionGroundTruth,
      isNewVisit,
      reward,
      nextState: nodeIndex,
      done,
    }
  }

  getGridSnapshot() {
    return this.grid.map((node, i) => ({ ...node, visited: this.visited.has(i) }))
  }
}
