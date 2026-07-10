import { useCallback, useRef, useState } from 'react'
import { TrafficGridEnv, ACTIONS, STATE_COUNT, ACTION_COUNT, GRID_SIZE, MAX_STEPS } from '../../../core/environment/TrafficGridEnv'
import { QLearningAgent } from '../../../core/agent/QLearningAgent'

function buildGrid() {
  return Array.from({ length: STATE_COUNT }, () => ({
    visited: false,
    isAnomaly: false,
    isCongestion: false,
  }))
}

/**
 * Hook puente entre la lógica de RL pura (`core/environment/TrafficGridEnv`,
 * `core/agent/QLearningAgent`) y la UI de la demo. Mantiene el entorno y el agente en `useRef`
 * (no en `useState`) para que no se recreen en cada render — solo se recrean en `reset()` o al
 * completarse un episodio (`done`).
 *
 * Efectos secundarios por llamada a `step()`:
 * - Consulta al agente una acción (epsilon-greedy) y avanza el entorno un paso.
 * - Actualiza la tabla Q del agente in-place (`agentRef.current`), sin pasar por React state —
 *   por eso `qTable` se expone leyendo directamente `agentRef.current.getQTable()` en cada
 *   render en vez de guardarse en un `useState` propio.
 * - Si el episodio termina (`done`: se encontraron todas las anomalías o se llegó a
 *   `MAX_STEPS`), regenera el grid, reinicia la posición del dron a (0,0) y **conserva** la
 *   misma instancia de `QLearningAgent` (el aprendizaje persiste entre episodios dentro de una
 *   misma sesión de simulación).
 *
 * @returns {{
 *   grid: Array,
 *   gridSize: number,
 *   position: {row: number, col: number},
 *   history: Array,
 *   totalReward: number,
 *   qTable: number[][],
 *   actions: object,
 *   statusMessage: string,
 *   episodeCount: number,
 *   stepInEpisode: number,
 *   maxSteps: number,
 *   episodeHistory: Array,
 *   step: () => void,
 *   reset: () => void,
 * }}
 */
export function useTrafficSimulation() {
  const envRef = useRef(null)
  const agentRef = useRef(null)
  const stateRef = useRef(null)

  if (envRef.current === null) {
    envRef.current = new TrafficGridEnv()
    agentRef.current = new QLearningAgent({ stateCount: STATE_COUNT, actionCount: ACTION_COUNT })
    stateRef.current = envRef.current.reset()
  }

  const [grid, setGrid] = useState(buildGrid)
  const [position, setPosition] = useState({ row: 0, col: 0 })
  const [history, setHistory] = useState([])
  const [totalReward, setTotalReward] = useState(0)
  const [statusMessage, setStatusMessage] = useState('')
  const [episodeCount, setEpisodeCount] = useState(1)
  const [stepInEpisode, setStepInEpisode] = useState(0)
  const [episodeReward, setEpisodeReward] = useState(0)
  const [episodeHistory, setEpisodeHistory] = useState([])

  const step = useCallback(() => {
    const state = stateRef.current
    const action = agentRef.current.chooseAction(state)
    const {
      position: nextPosition,
      nodeIndex,
      isAnomaly,
      isCongestion,
      isNewVisit,
      reward,
      nextState,
      done,
    } = envRef.current.step(action)

    agentRef.current.update(state, action, reward, nextState)
    stateRef.current = nextState

    const nextStepInEpisode = stepInEpisode + 1
    const nextEpisodeReward = episodeReward + reward

    setPosition(nextPosition)
    setTotalReward((prev) => prev + reward)
    setStepInEpisode(nextStepInEpisode)
    setEpisodeReward(nextEpisodeReward)
    setGrid((prev) => {
      const next = [...prev]
      next[nodeIndex] = { visited: true, isAnomaly, isCongestion }
      return next
    })
    setHistory((prev) => [
      { id: prev.length, fromState: state, action, isAnomaly, isCongestion, isNewVisit, reward, episode: episodeCount },
      ...prev,
    ].slice(0, 20))

    if (isNewVisit && isAnomaly) {
      setStatusMessage(`Anomalía encontrada en fila ${nextPosition.row + 1}, columna ${nextPosition.col + 1}.`)
    } else if (isCongestion) {
      setStatusMessage(`Congestión en fila ${nextPosition.row + 1}, columna ${nextPosition.col + 1}. Recompensa penalizada.`)
    }

    if (done) {
      envRef.current.reset()
      stateRef.current = 0
      setGrid(buildGrid())
      setPosition({ row: 0, col: 0 })
      setEpisodeHistory((prev) => [
        { episode: episodeCount, steps: nextStepInEpisode, reward: Math.round(nextEpisodeReward * 100) / 100 },
        ...prev,
      ].slice(0, 5))
      setEpisodeCount((e) => e + 1)
      setStepInEpisode(0)
      setEpisodeReward(0)
      setStatusMessage('Episodio completo. Se generó un nuevo recorrido y el dron volvió al inicio.')
    }
  }, [episodeCount, episodeReward, stepInEpisode])

  const reset = useCallback(() => {
    envRef.current = new TrafficGridEnv()
    agentRef.current = new QLearningAgent({ stateCount: STATE_COUNT, actionCount: ACTION_COUNT })
    stateRef.current = envRef.current.reset()
    setGrid(buildGrid())
    setPosition({ row: 0, col: 0 })
    setHistory([])
    setTotalReward(0)
    setEpisodeCount(1)
    setStepInEpisode(0)
    setEpisodeReward(0)
    setEpisodeHistory([])
    setStatusMessage('Simulación reiniciada. Tabla Q y recompensa en cero.')
  }, [])

  return {
    grid,
    gridSize: GRID_SIZE,
    position,
    history,
    totalReward,
    qTable: agentRef.current.getQTable(),
    actions: ACTIONS,
    statusMessage,
    episodeCount,
    stepInEpisode,
    maxSteps: MAX_STEPS,
    episodeHistory,
    step,
    reset,
  }
}
