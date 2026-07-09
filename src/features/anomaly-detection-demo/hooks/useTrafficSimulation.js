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
