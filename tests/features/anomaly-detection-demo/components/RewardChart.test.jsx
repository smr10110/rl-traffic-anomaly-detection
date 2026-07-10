import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { RewardChart } from '@/features/anomaly-detection-demo/components/RewardChart'

// history viene del hook con el más reciente primero (unshift), igual que useTrafficSimulation.
function makeHistory(rewardsNewestFirst, episodesNewestFirst) {
  return rewardsNewestFirst.map((reward, i) => ({
    id: rewardsNewestFirst.length - i,
    reward,
    episode: episodesNewestFirst ? episodesNewestFirst[i] : 1,
  }))
}

describe('RewardChart', () => {
  it('muestra el estado vacío cuando no hay historial', () => {
    render(<RewardChart history={[]} />)
    expect(screen.getByText(/aún no hay episodios registrados/i)).toBeInTheDocument()
    expect(screen.getByText('+0')).toBeInTheDocument()
    expect(screen.queryByText(/último paso/i)).not.toBeInTheDocument()
  })

  it('calcula el total acumulado como la suma de todas las recompensas', () => {
    const history = makeHistory([10, -50, -1])
    render(<RewardChart history={history} />)
    // total = 10 + -50 + -1 = -41
    expect(screen.getByText('-41')).toBeInTheDocument()
  })

  it('muestra signo + en el total cuando es positivo o cero', () => {
    const history = makeHistory([5, 2])
    render(<RewardChart history={history} />)
    expect(screen.getByText('+7')).toBeInTheDocument()
  })

  it('muestra "Último paso" con la recompensa más reciente (history[0])', () => {
    const history = makeHistory([-50, 10, -1])
    render(<RewardChart history={history} />)
    expect(screen.getByText(/último paso: -50/i)).toBeInTheDocument()
  })

  it('renderiza el path SVG cuando hay datos', () => {
    const history = makeHistory([10, -1, -1])
    const { container } = render(<RewardChart history={history} />)
    const rawPath = container.querySelector('.reward-chart__path--raw')
    expect(rawPath).toBeInTheDocument()
    expect(rawPath.getAttribute('d')).toMatch(/^M/)
  })

  it('no muestra la curva suavizada (EMA) con menos de 4 puntos', () => {
    const history = makeHistory([10, -1, -1])
    const { container } = render(<RewardChart history={history} />)
    expect(container.querySelector('.reward-chart__path--smoothed')).not.toBeInTheDocument()
    expect(screen.queryByText(/tendencia suavizada/i)).not.toBeInTheDocument()
  })

  it('muestra la curva suavizada (EMA) con 4 o más puntos', () => {
    const history = makeHistory([10, -1, -1, -50])
    const { container } = render(<RewardChart history={history} />)
    expect(container.querySelector('.reward-chart__path--smoothed')).toBeInTheDocument()
    expect(screen.getByText(/tendencia suavizada/i)).toBeInTheDocument()
  })

  it('dibuja una línea de separación de episodio por cada cambio de episodio', () => {
    // Cronológico (invertido): episodio 1, 1, 2, 2, 3 -> 2 cambios de episodio
    const history = makeHistory([1, 1, 1, 1, 1], [3, 2, 2, 1, 1])
    const { container } = render(<RewardChart history={history} />)
    const boundaries = container.querySelectorAll('.reward-chart__episode-boundary')
    expect(boundaries).toHaveLength(2)
  })

  it('lista los episodios anteriores cuando se provee episodeHistory', () => {
    const history = makeHistory([10])
    const episodeHistory = [
      { episode: 2, steps: 12, reward: 45 },
      { episode: 1, steps: 30, reward: -10 },
    ]
    render(<RewardChart history={history} episodeHistory={episodeHistory} />)
    expect(screen.getByText(/#2: 12 pasos, \+45/)).toBeInTheDocument()
    expect(screen.getByText(/#1: 30 pasos, -10/)).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad en el estado vacío', async () => {
    const { container } = render(<RewardChart history={[]} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no tiene violaciones de accesibilidad con datos', async () => {
    const history = makeHistory([10, -50, -1, 20])
    const episodeHistory = [{ episode: 1, steps: 20, reward: -21 }]
    const { container } = render(<RewardChart history={history} episodeHistory={episodeHistory} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
