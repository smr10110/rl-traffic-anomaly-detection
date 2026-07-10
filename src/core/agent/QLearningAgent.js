// Agente Q-learning tabular puro — sin imports de React. Tabular y no DQN porque el espacio de
// 25 estados x 4 acciones no justifica aproximación de funciones.

export class QLearningAgent {
  /**
   * @param {number} stateCount - tamaño del espacio de estados (25 = posiciones del grid 5x5).
   * @param {number} actionCount - tamaño del espacio de acciones (4 = arriba/abajo/izq/der).
   * @param {number} alpha - tasa de aprendizaje. 0.1: valor conservador estándar para que la
   *   tabla Q converja de forma estable en pocos episodios sin oscilar por recompensas grandes
   *   puntuales (p. ej. el +100 de encontrar una anomalía).
   * @param {number} gamma - factor de descuento. 0.9: prioriza fuertemente la recompensa futura
   *   sobre la inmediata, necesario porque la anomalía (la recompensa que importa) suele estar a
   *   varios pasos de distancia del estado actual, no en la celda adyacente.
   * @param {number} epsilon - probabilidad de exploración aleatoria (epsilon-greedy). 0.2:
   *   deja suficiente exploración para descubrir congestión/anomalías en un grid que cambia en
   *   cada episodio, sin volver la política demasiado errática para la demo en vivo.
   * @param {() => number} rng - generador de números aleatorios inyectable (por defecto
   *   `Math.random`), para poder testear la política epsilon-greedy de forma determinística.
   */
  constructor({ stateCount, actionCount, alpha = 0.1, gamma = 0.9, epsilon = 0.2, rng = Math.random }) {
    this.actionCount = actionCount
    this.alpha = alpha
    this.gamma = gamma
    this.epsilon = epsilon
    this.rng = rng
    this.qTable = Array.from({ length: stateCount }, () => new Array(actionCount).fill(0))
  }

  /** Política epsilon-greedy: explora al azar con probabilidad `epsilon`, si no explota el
   * mejor Q-value conocido para el estado actual. */
  chooseAction(state) {
    if (this.rng() < this.epsilon) {
      return Math.floor(this.rng() * this.actionCount)
    }
    const qValues = this.qTable[state]
    return qValues.indexOf(Math.max(...qValues))
  }

  /** Actualización de Bellman para Q-learning tabular (off-policy): mueve `Q(s,a)` hacia
   * `reward + gamma * max(Q(s'))`, con tasa `alpha`. */
  update(state, action, reward, nextState) {
    const maxNextQ = Math.max(...this.qTable[nextState])
    const currentQ = this.qTable[state][action]
    this.qTable[state][action] =
      currentQ + this.alpha * (reward + this.gamma * maxNextQ - currentQ)
  }

  getQTable() {
    return this.qTable
  }
}
