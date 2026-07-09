import { useMemo } from 'react'
import { Card } from '../../../components/Card'
import './RewardChart.css'

const WIDTH = 480
const HEIGHT = 140
const PADDING = 12
const SMOOTHING = 0.6 // EMA, mismo patrón que TensorBoard/Weights & Biases

export function RewardChart({ history, episodeHistory = [] }) {
  const { rawPath, smoothedPath, episodeBoundaryXs, showSmoothed } = useMemo(() => {
    if (history.length === 0) {
      return { rawPath: '', smoothedPath: '', episodeBoundaryXs: [], showSmoothed: false }
    }

    const chronological = [...history].reverse()
    let cumulative = 0
    const cumulativeRewards = chronological.map((entry) => {
      cumulative += entry.reward
      return cumulative
    })

    const smoothed = [cumulativeRewards[0]]
    for (let i = 1; i < cumulativeRewards.length; i += 1) {
      smoothed.push(SMOOTHING * smoothed[i - 1] + (1 - SMOOTHING) * cumulativeRewards[i])
    }

    const min = Math.min(0, ...cumulativeRewards)
    const max = Math.max(0, ...cumulativeRewards)
    const range = max - min || 1

    const xAt = (i) =>
      cumulativeRewards.length === 1
        ? WIDTH / 2
        : PADDING + (i / (cumulativeRewards.length - 1)) * (WIDTH - PADDING * 2)
    const yAt = (value) => HEIGHT - PADDING - ((value - min) / range) * (HEIGHT - PADDING * 2)

    const toPath = (values) =>
      values.map((value, i) => `${i === 0 ? 'M' : 'L'}${xAt(i)},${yAt(value)}`).join(' ')

    const boundaries = []
    for (let i = 1; i < chronological.length; i += 1) {
      if (chronological[i].episode !== chronological[i - 1].episode) {
        boundaries.push(xAt(i))
      }
    }

    return {
      rawPath: toPath(cumulativeRewards),
      smoothedPath: toPath(smoothed),
      episodeBoundaryXs: boundaries,
      showSmoothed: cumulativeRewards.length >= 4,
    }
  }, [history])

  const last = history[0]?.reward ?? null
  const rawTotal = history.length > 0 ? history.reduce((acc, h) => acc + h.reward, 0) : 0
  const total = Math.round(rawTotal * 100) / 100

  return (
    <Card dark className="reward-chart">
      <div className="reward-chart__header">
        <h3>Recompensa acumulada</h3>
        <span className="reward-chart__total">{total >= 0 ? '+' : ''}{total}</span>
      </div>
      {rawPath === '' ? (
        <p className="reward-chart__empty">Aún no hay episodios registrados.</p>
      ) : (
        <>
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="reward-chart__svg"
            role="img"
            aria-label={`Curva de recompensa acumulada, valor actual ${total}`}
          >
            <line x1={PADDING} y1={HEIGHT / 2} x2={WIDTH - PADDING} y2={HEIGHT / 2} className="reward-chart__zero" />
            {episodeBoundaryXs.map((x) => (
              <line key={x} x1={x} y1={PADDING} x2={x} y2={HEIGHT - PADDING} className="reward-chart__episode-boundary" />
            ))}
            <path d={rawPath} className="reward-chart__path reward-chart__path--raw" fill="none" />
            {showSmoothed && (
              <path d={smoothedPath} className="reward-chart__path reward-chart__path--smoothed" fill="none" />
            )}
          </svg>
          {showSmoothed && (
            <p className="reward-chart__legend">
              <span className="reward-chart__legend-swatch reward-chart__legend-swatch--raw" /> valor real{' '}
              <span className="reward-chart__legend-swatch reward-chart__legend-swatch--smoothed" /> tendencia suavizada (EMA)
            </p>
          )}
        </>
      )}
      {last !== null && (
        <p className="reward-chart__last">
          Último paso: {last >= 0 ? '+' : ''}{last}
        </p>
      )}
      {episodeHistory.length > 0 && (
        <div className="reward-chart__episodes">
          <span className="reward-chart__episodes-label">Episodios anteriores:</span>
          <ul className="reward-chart__episodes-list">
            {episodeHistory.map((ep) => (
              <li key={ep.episode} className="reward-chart__episode-chip">
                #{ep.episode}: {ep.steps} pasos, {ep.reward >= 0 ? '+' : ''}{ep.reward}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
