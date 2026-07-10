import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import { QLearningAgent } from '@/core/agent/QLearningAgent'

function makeAgent(overrides = {}) {
  return new QLearningAgent({ stateCount: 4, actionCount: 2, ...overrides })
}

describe('QLearningAgent - inicialización', () => {
  it('empieza con una Q-table de ceros del tamaño (stateCount x actionCount)', () => {
    const agent = makeAgent()
    const qTable = agent.getQTable()
    expect(qTable).toHaveLength(4)
    qTable.forEach((row) => expect(row).toEqual([0, 0]))
  })
})

describe('QLearningAgent - chooseAction (epsilon-greedy)', () => {
  it('explora (acción aleatoria) cuando rng() < epsilon', () => {
    const agent = makeAgent({ epsilon: 0.5, rng: () => 0.1 })
    // con rng fijo en 0.1 (< epsilon) siempre explora; segunda llamada de rng decide la acción
    const values = [0.1, 0.9]
    let i = 0
    agent.rng = () => values[i++ % values.length]
    const action = agent.chooseAction(0)
    expect(action).toBe(1) // floor(0.9 * 2) = 1
  })

  it('explota (mejor acción conocida) cuando rng() >= epsilon', () => {
    const agent = makeAgent({ epsilon: 0.1, rng: () => 0.9 })
    agent.qTable[0] = [0.2, 0.8]
    const action = agent.chooseAction(0)
    expect(action).toBe(1)
  })

  it('siempre devuelve una acción dentro del espacio válido de acciones (invariante)', () => {
    fc.assert(
      fc.property(
        fc.double({ min: 0, max: 1, noNaN: true }),
        fc.integer({ min: 0, max: 3 }),
        (randomSeed, state) => {
          const agent = makeAgent({ rng: () => randomSeed })
          const action = agent.chooseAction(state)
          expect(action).toBeGreaterThanOrEqual(0)
          expect(action).toBeLessThan(2)
        },
      ),
    )
  })
})

describe('QLearningAgent - update (ecuación de Bellman)', () => {
  it('actualiza el Q-value exactamente según la fórmula alpha*(reward + gamma*maxNextQ - currentQ)', () => {
    const agent = makeAgent({ alpha: 0.1, gamma: 0.9 })
    agent.qTable[1] = [2, 5] // maxNextQ = 5
    const expected = 0 + 0.1 * (10 + 0.9 * 5 - 0)

    agent.update(0, 0, 10, 1)

    expect(agent.qTable[0][0]).toBeCloseTo(expected, 10)
  })

  it('nunca produce NaN dado cualquier reward/estado válido (invariante)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: -5, max: 5 }),
        fc.integer({ min: 0, max: 3 }),
        fc.integer({ min: 0, max: 3 }),
        (reward, state, nextState) => {
          const agent = makeAgent()
          agent.update(state, 0, reward, nextState)
          expect(Number.isNaN(agent.qTable[state][0])).toBe(false)
        },
      ),
    )
  })
})
