import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTrafficSimulation } from '@/features/anomaly-detection-demo/hooks/useTrafficSimulation'

describe('useTrafficSimulation', () => {
  it('inicializa con grid de 25 celdas sin visitar, posición (0,0) y Q-table de ceros', () => {
    const { result } = renderHook(() => useTrafficSimulation())
    expect(result.current.grid).toHaveLength(25)
    result.current.grid.forEach((node) => {
      expect(node.visited).toBe(false)
      expect(node.isCongestion).toBe(false)
    })
    expect(result.current.position).toEqual({ row: 0, col: 0 })
    expect(result.current.totalReward).toBe(0)
    result.current.qTable.forEach((row) => expect(row).toEqual([0, 0, 0, 0]))
  })

  it('step() mueve al agente y marca una celda como visitada', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    act(() => {
      result.current.step()
    })

    const visitedCount = result.current.grid.filter((n) => n.visited).length
    expect(visitedCount).toBeGreaterThanOrEqual(1)
    expect(result.current.history).toHaveLength(1)
  })

  it('la instancia del agente/entorno persiste entre steps sucesivos (via useRef)', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    act(() => {
      result.current.step()
      result.current.step()
      result.current.step()
    })

    expect(result.current.history).toHaveLength(3)
    expect(result.current.history.map((h) => h.id).sort()).toEqual([0, 1, 2])
  })

  it('reset() reinicializa grid, posición, historial y Q-table', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    act(() => {
      result.current.step()
      result.current.step()
    })
    expect(result.current.history.length).toBeGreaterThan(0)

    act(() => {
      result.current.reset()
    })

    expect(result.current.grid.every((n) => !n.visited)).toBe(true)
    expect(result.current.position).toEqual({ row: 0, col: 0 })
    expect(result.current.history).toEqual([])
    expect(result.current.totalReward).toBe(0)
  })

  it('el historial se acota a 20 entradas', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    act(() => {
      for (let i = 0; i < 25; i++) result.current.step()
    })

    expect(result.current.history.length).toBeLessThanOrEqual(20)
  })

  it('expone maxSteps (50) tal como lo define el entorno', () => {
    const { result } = renderHook(() => useTrafficSimulation())
    expect(result.current.maxSteps).toBe(50)
  })

  it('episodeCount empieza en 1 y stepInEpisode en 0', () => {
    const { result } = renderHook(() => useTrafficSimulation())
    expect(result.current.episodeCount).toBe(1)
    expect(result.current.stepInEpisode).toBe(0)
    expect(result.current.episodeHistory).toEqual([])
  })

  it('stepInEpisode se incrementa con cada step() dentro del mismo episodio', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    act(() => {
      result.current.step()
    })
    const first = result.current.stepInEpisode

    act(() => {
      result.current.step()
    })

    // Si el primer step ya completó el episodio (posible pero raro), stepInEpisode se resetea a 0.
    // En el caso normal (episodio en curso) debe haber avanzado en 1.
    if (first !== 0) {
      expect(result.current.stepInEpisode).toBe(first + 1)
    }
  })

  it('al completar un episodio: episodeCount se incrementa, stepInEpisode vuelve a 0, y episodeHistory registra {episode, steps, reward}', () => {
    const { result } = renderHook(() => useTrafficSimulation())
    expect(result.current.episodeCount).toBe(1)

    let steps = 0
    // Cada llamada a step() va en su propio act() para que el useCallback memoizado
    // se refresque entre pasos (depende de episodeCount/episodeReward/stepInEpisode).
    while (result.current.episodeCount === 1 && steps < 50) {
      act(() => {
        result.current.step()
      })
      steps++
    }

    expect(result.current.episodeCount).toBe(2)
    expect(steps).toBeLessThanOrEqual(50)
    expect(result.current.stepInEpisode).toBe(0)
    expect(result.current.episodeHistory).toHaveLength(1)
    // Es el primer episodio: el total acumulado coincide exactamente con la recompensa del episodio.
    expect(result.current.episodeHistory[0]).toEqual({
      episode: 1,
      steps,
      reward: result.current.totalReward,
    })
    expect(result.current.statusMessage).toBe(
      'Episodio completo. Se generó un nuevo recorrido y el dron volvió al inicio.',
    )
  })

  it('episodeHistory se acota a 5 entradas tras varios episodios completos', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    let guard = 0
    // Cada episodio dura como máximo MAX_STEPS (50) pasos, así que 6 episodios
    // están garantizados dentro de 6*50 pasos.
    while (result.current.episodeCount < 7 && guard < 6 * 50) {
      act(() => {
        result.current.step()
      })
      guard++
    }

    expect(result.current.episodeCount).toBeGreaterThanOrEqual(7)
    expect(result.current.episodeHistory.length).toBeLessThanOrEqual(5)
    expect(result.current.episodeHistory[0].episode).toBeGreaterThan(
      result.current.episodeHistory[result.current.episodeHistory.length - 1].episode,
    )
  })

  it('reset() reinicia episodeCount a 1, stepInEpisode a 0, episodeHistory vacío y setea el mensaje de reinicio manual', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    act(() => {
      result.current.step()
      result.current.step()
    })

    act(() => {
      result.current.reset()
    })

    expect(result.current.episodeCount).toBe(1)
    expect(result.current.stepInEpisode).toBe(0)
    expect(result.current.episodeHistory).toEqual([])
    expect(result.current.statusMessage).toBe('Simulación reiniciada. Tabla Q y recompensa en cero.')
  })

  it('statusMessage anuncia "Anomalía encontrada" al visitar por primera vez una celda con anomalía', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    let guard = 0
    // Probabilidad de anomalía por celda ~18%; recorriendo suficientes pasos (con
    // regeneración automática de grid en cada episodio) es prácticamente seguro
    // encontrar al menos una dentro de este límite.
    while (guard < 1000) {
      act(() => {
        result.current.step()
      })
      guard++
      const last = result.current.history[0]
      if (last && last.isNewVisit && last.isAnomaly) break
    }

    expect(result.current.statusMessage).toMatch(/^Anomalía encontrada en fila \d+, columna \d+\.$/)
  })

  it('statusMessage anuncia congestión al entrar a una celda congestionada', () => {
    const { result } = renderHook(() => useTrafficSimulation())

    let guard = 0
    while (guard < 1000) {
      act(() => {
        result.current.step()
      })
      guard++
      const last = result.current.history[0]
      if (last && last.isCongestion) break
    }

    expect(result.current.statusMessage).toMatch(
      /^Congestión en fila \d+, columna \d+\. Recompensa penalizada\.$/,
    )
  })
})
