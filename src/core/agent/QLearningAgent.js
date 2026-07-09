// Agente Q-learning tabular puro — sin imports de React.

export class QLearningAgent {
  constructor({ stateCount, actionCount, alpha = 0.1, gamma = 0.9, epsilon = 0.2, rng = Math.random }) {
    this.actionCount = actionCount
    this.alpha = alpha
    this.gamma = gamma
    this.epsilon = epsilon
    this.rng = rng
    this.qTable = Array.from({ length: stateCount }, () => new Array(actionCount).fill(0))
  }

  chooseAction(state) {
    if (this.rng() < this.epsilon) {
      return Math.floor(this.rng() * this.actionCount)
    }
    const qValues = this.qTable[state]
    return qValues.indexOf(Math.max(...qValues))
  }

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
