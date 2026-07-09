import { useEffect, useRef, useState } from 'react'
import { Button } from '../../../components/Button'
import './SimulationControls.css'

const SPEEDS = [
  { id: 'slow', label: 'Lento', intervalMs: 1200 },
  { id: 'normal', label: 'Normal', intervalMs: 600 },
  { id: 'fast', label: 'Rápido', intervalMs: 300 },
]

export function SimulationControls({ onStep, onReset, episodeCount, stepInEpisode, maxSteps }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speedId, setSpeedId] = useState('normal')
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!isPlaying) return
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const baseInterval = SPEEDS.find((s) => s.id === speedId).intervalMs
    intervalRef.current = setInterval(onStep, prefersReducedMotion ? baseInterval * 2.5 : baseInterval)
    return () => clearInterval(intervalRef.current)
  }, [isPlaying, onStep, speedId])

  return (
    <div className="sim-controls">
      <div className="sim-controls__row">
        <Button
          size="sm"
          onClick={onStep}
          disabled={isPlaying}
          title={isPlaying ? 'Pausa "Reproducir" para avanzar paso a paso' : undefined}
        >
          {isPlaying ? 'Avanzar (en automático)' : 'Avanzar un paso'}
        </Button>
        <Button size="sm" onClick={() => setIsPlaying((p) => !p)}>
          {isPlaying ? 'Pausar' : 'Reproducir'}
        </Button>
        <Button
          size="sm"
          onClick={() => {
            setIsPlaying(false)
            onReset()
          }}
        >
          Reiniciar
        </Button>
      </div>

      <div className="sim-controls__row sim-controls__row--secondary">
        <div className="sim-controls__speed" role="group" aria-label="Velocidad de reproducción">
          {SPEEDS.map((speed) => (
            <button
              key={speed.id}
              type="button"
              className="sim-controls__speed-btn"
              aria-pressed={speedId === speed.id}
              onClick={() => setSpeedId(speed.id)}
            >
              {speed.label}
            </button>
          ))}
        </div>
        <span className="sim-controls__counter">
          Episodio {episodeCount} · Paso {stepInEpisode}/{maxSteps}
        </span>
      </div>
    </div>
  )
}
