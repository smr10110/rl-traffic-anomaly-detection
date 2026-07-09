import { describe, it, expect } from 'vitest'
import fc from 'fast-check'
import {
  TrafficGridEnv,
  encodePosition,
  generateGrid,
  ACTIONS,
  GRID_SIZE,
  STATE_COUNT,
} from './TrafficGridEnv'

describe('encodePosition', () => {
  it('mapea (0,0) a 0 y (gridSize-1,gridSize-1) al último índice', () => {
    expect(encodePosition(0, 0)).toBe(0)
    expect(encodePosition(GRID_SIZE - 1, GRID_SIZE - 1)).toBe(STATE_COUNT - 1)
  })
})

describe('generateGrid (propiedad de invariante)', () => {
  it('siempre genera STATE_COUNT nodos, anomalía y congestión mutuamente excluyentes', () => {
    fc.assert(
      fc.property(fc.double({ min: 0, max: 1, noNaN: true }), (randomSeed) => {
        const grid = generateGrid(GRID_SIZE, () => randomSeed)
        expect(grid).toHaveLength(STATE_COUNT)
        grid.forEach((node) => {
          expect(typeof node.isAnomalyGroundTruth).toBe('boolean')
          expect(typeof node.isCongestionGroundTruth).toBe('boolean')
          expect(node.isAnomalyGroundTruth && node.isCongestionGroundTruth).toBe(false)
        })
      }),
    )
  })
})

describe('TrafficGridEnv - reset', () => {
  it('inicia al agente en (0,0) y marca esa celda como visitada', () => {
    const env = new TrafficGridEnv({ rng: () => 0.99 })
    const state = env.reset()
    expect(state).toBe(0)
    expect(env.getGridSnapshot()[0].visited).toBe(true)
  })
})

describe('TrafficGridEnv - movimiento y colisión con bordes', () => {
  it('moverse fuera del borde superior/izquierdo deja al agente en su lugar', () => {
    const env = new TrafficGridEnv({ rng: () => 0.99 })
    env.reset()
    const { position: afterUp } = env.step(ACTIONS.UP)
    expect(afterUp).toEqual({ row: 0, col: 0 })
    const { position: afterLeft } = env.step(ACTIONS.LEFT)
    expect(afterLeft).toEqual({ row: 0, col: 0 })
  })

  it('moverse dentro del grid actualiza la posición correctamente', () => {
    const env = new TrafficGridEnv({ rng: () => 0.99 })
    env.reset()
    const { position } = env.step(ACTIONS.RIGHT)
    expect(position).toEqual({ row: 0, col: 1 })
  })

  it('moverse fuera del borde inferior/derecho deja al agente en el último índice', () => {
    const env = new TrafficGridEnv({ rng: () => 0.99 })
    env.reset()
    for (let i = 0; i < GRID_SIZE + 1; i++) env.step(ACTIONS.DOWN)
    for (let i = 0; i < GRID_SIZE + 1; i++) env.step(ACTIONS.RIGHT)
    const { position } = env.step(ACTIONS.DOWN)
    expect(position).toEqual({ row: GRID_SIZE - 1, col: GRID_SIZE - 1 })
  })
})

describe('TrafficGridEnv - recompensa', () => {
  it('da +100 al visitar por primera vez una celda con anomalía real', () => {
    const env = new TrafficGridEnv({ rng: () => 0.01 }) // < 0.18 → todas las celdas son anomalía
    env.reset()
    const { reward, isAnomaly, isNewVisit } = env.step(ACTIONS.RIGHT)
    expect(isAnomaly).toBe(true)
    expect(isNewVisit).toBe(true)
    expect(reward).toBe(100)
  })

  it('da -50 al entrar a una celda congestionada', () => {
    const env = new TrafficGridEnv({ rng: () => 0.25 }) // entre 0.18 y 0.33 → congestión
    env.reset()
    const { reward, isCongestion } = env.step(ACTIONS.RIGHT)
    expect(isCongestion).toBe(true)
    expect(reward).toBe(-50)
  })

  it('da el step penalty (-1) al visitar una celda normal', () => {
    const env = new TrafficGridEnv({ rng: () => 0.99 }) // > 0.33 → celda normal
    env.reset()
    const { reward, isAnomaly, isCongestion } = env.step(ACTIONS.RIGHT)
    expect(isAnomaly).toBe(false)
    expect(isCongestion).toBe(false)
    expect(reward).toBe(-1)
  })

  it('no repite la recompensa de anomalía si se revisita la misma celda', () => {
    const env = new TrafficGridEnv({ rng: () => 0.01 })
    env.reset()
    env.step(ACTIONS.RIGHT)
    const second = env.step(ACTIONS.LEFT) // vuelve a (0,0), ya visitada
    expect(second.isNewVisit).toBe(false)
    expect(second.reward).toBe(-1)
  })

  it('penaliza la congestión en cada paso, no solo la primera vez', () => {
    const env = new TrafficGridEnv({ rng: () => 0.25 })
    env.reset()
    env.step(ACTIONS.RIGHT)
    const second = env.step(ACTIONS.LEFT) // vuelve a (0,0) que también salió congestión con este rng
    // (0,0) fue generado con el mismo roll, así que también es congestión
    expect(second.reward).toBe(-50)
  })
})

describe('TrafficGridEnv - terminación', () => {
  it('termina cuando se alcanza el máximo de pasos', () => {
    const env = new TrafficGridEnv({ rng: () => 0.99 }) // sin anomalías → nunca termina por completar
    env.reset()
    let done = false
    for (let i = 0; i < 50; i++) {
      done = env.step(i % 2 === 0 ? ACTIONS.RIGHT : ACTIONS.LEFT).done
    }
    expect(done).toBe(true)
  })
})

describe('nextState (propiedad de invariante)', () => {
  it('siempre cae en el rango [0, STATE_COUNT)', () => {
    fc.assert(
      fc.property(fc.integer({ min: 0, max: 3 }), (action) => {
        const env = new TrafficGridEnv({ rng: Math.random })
        env.reset()
        const { nextState } = env.step(action)
        expect(nextState).toBeGreaterThanOrEqual(0)
        expect(nextState).toBeLessThan(STATE_COUNT)
      }),
    )
  })
})
