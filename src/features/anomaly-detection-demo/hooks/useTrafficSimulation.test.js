import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTrafficSimulation } from './useTrafficSimulation'

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
})
