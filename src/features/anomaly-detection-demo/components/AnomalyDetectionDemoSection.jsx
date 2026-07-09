import { useTrafficSimulation } from '../hooks/useTrafficSimulation'
import { SimulationControls } from './SimulationControls'
import { TrafficGridMap } from './TrafficGridMap'
import { QTablePanel } from './QTablePanel'
import { RewardChart } from './RewardChart'
import { DecisionPanel } from './DecisionPanel'
import './AnomalyDetectionDemoSection.css'

export function AnomalyDetectionDemoSection() {
  const {
    grid,
    gridSize,
    position,
    history,
    qTable,
    statusMessage,
    episodeCount,
    stepInEpisode,
    maxSteps,
    episodeHistory,
    step,
    reset,
  } = useTrafficSimulation()

  return (
    <section className="demo-section" id="demo">
      <div className="demo-section__intro">
        <h2>Caso práctico: detección de anomalías en tráfico vehicular</h2>
        <p>
          Un agente Q-learning patrulla una red de intersecciones. Aprende, por prueba y error, a
          encontrar el flujo de tráfico anómalo (accidentes, congestión atípica) — sin que nadie
          le diga de antemano dónde está ni cuáles son las reglas.
        </p>
      </div>

      <SimulationControls
        onStep={step}
        onReset={reset}
        episodeCount={episodeCount}
        stepInEpisode={stepInEpisode}
        maxSteps={maxSteps}
      />

      <div className="demo-section__grid">
        <div className="demo-section__grid-col">
          <p className="demo-section__tip">
            <strong>Cómo empezar:</strong> "Avanzar un paso" mueve al dron una intersección a la
            vez. "Reproducir" lo deja patrullando solo, a la velocidad elegida.
          </p>
          <TrafficGridMap
            grid={grid}
            gridSize={gridSize}
            position={position}
            hasStarted={history.length > 0}
          />
        </div>
        <DecisionPanel entry={history[0]} qTable={qTable} gridSize={gridSize} />
      </div>

      <p className="visually-hidden" role="status" aria-live="polite">
        {statusMessage}
      </p>

      <div className="demo-section__full-width">
        <RewardChart history={history} episodeHistory={episodeHistory} />
      </div>

      <div className="demo-section__full-width">
        <QTablePanel qTable={qTable} />
      </div>
    </section>
  )
}
