import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { SimulationControls } from '@/features/anomaly-detection-demo/components/SimulationControls'

function mockMatchMedia(reducedMotion = false) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches: query.includes('reduced-motion') ? reducedMotion : false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }))
}

// Los clicks que activan el intervalo usan fireEvent en vez de user-event: user-event
// depende de sus propios temporizadores internos para simular la secuencia de un click
// real, lo que se cuelga indefinidamente al combinarse con vi.useFakeTimers(). fireEvent
// dispara el evento sincrónicamente y evita ese conflicto.
function setup(reducedMotion = false) {
  mockMatchMedia(reducedMotion)
  const onStep = vi.fn()
  const onReset = vi.fn()
  const utils = render(
    <SimulationControls onStep={onStep} onReset={onReset} episodeCount={1} stepInEpisode={3} maxSteps={50} />,
  )
  return { onStep, onReset, ...utils }
}

describe('SimulationControls', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('muestra el contador de episodio y paso', () => {
    mockMatchMedia()
    render(<SimulationControls onStep={() => {}} onReset={() => {}} episodeCount={2} stepInEpisode={7} maxSteps={50} />)
    expect(screen.getByText('Episodio 2 · Paso 7/50')).toBeInTheDocument()
  })

  it('llama a onStep al hacer click en "Avanzar un paso"', async () => {
    vi.useRealTimers()
    mockMatchMedia()
    const user = userEvent.setup()
    const onStep = vi.fn()
    render(<SimulationControls onStep={onStep} onReset={() => {}} episodeCount={1} stepInEpisode={0} maxSteps={50} />)
    await user.click(screen.getByRole('button', { name: 'Avanzar un paso' }))
    expect(onStep).toHaveBeenCalledTimes(1)
  })

  it('llama a onReset y deja de reproducir al hacer click en "Reiniciar"', () => {
    const { onReset } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))
    expect(screen.getByRole('button', { name: 'Pausar' })).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar' }))
    expect(onReset).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('button', { name: 'Reproducir' })).toBeInTheDocument()
  })

  it('al reproducir, deshabilita "Avanzar un paso" y llama a onStep repetidamente por intervalo', () => {
    const { onStep } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))

    expect(screen.getByRole('button', { name: /avanzar/i })).toBeDisabled()

    vi.advanceTimersByTime(600) // velocidad "normal" por defecto
    expect(onStep).toHaveBeenCalledTimes(1)

    vi.advanceTimersByTime(600 * 2)
    expect(onStep).toHaveBeenCalledTimes(3)
  })

  it('al pausar, deja de llamar a onStep', () => {
    const { onStep } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))
    vi.advanceTimersByTime(600)
    expect(onStep).toHaveBeenCalledTimes(1)

    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }))
    vi.advanceTimersByTime(600 * 3)
    expect(onStep).toHaveBeenCalledTimes(1)
  })

  it('cambia de velocidad: "Rápido" dispara steps cada 300ms en vez de 600ms', () => {
    const { onStep } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Rápido' }))
    expect(screen.getByRole('button', { name: 'Rápido' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'Normal' })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))
    vi.advanceTimersByTime(300)
    expect(onStep).toHaveBeenCalledTimes(1)
  })

  it('duplica el intervalo (aprox.) cuando prefers-reduced-motion está activo', () => {
    const { onStep } = setup(true)
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))

    vi.advanceTimersByTime(600) // el intervalo normal (600ms) no alcanza con reduced motion (600*2.5)
    expect(onStep).not.toHaveBeenCalled()

    vi.advanceTimersByTime(900) // completa 1500ms = 600 * 2.5
    expect(onStep).toHaveBeenCalledTimes(1)
  })

  it('no tiene violaciones de accesibilidad en reposo', async () => {
    mockMatchMedia()
    const { container } = render(
      <SimulationControls onStep={() => {}} onReset={() => {}} episodeCount={1} stepInEpisode={0} maxSteps={50} />,
    )
    vi.useRealTimers()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
    vi.useFakeTimers()
  })

  it('no tiene violaciones de accesibilidad mientras reproduce', async () => {
    const { container } = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Reproducir' }))
    vi.useRealTimers()
    const results = await axe(container)
    expect(results).toHaveNoViolations()
    vi.useFakeTimers()
  })
})
