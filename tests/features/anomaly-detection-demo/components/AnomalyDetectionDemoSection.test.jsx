import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { AnomalyDetectionDemoSection } from '@/features/anomaly-detection-demo/components/AnomalyDetectionDemoSection'

describe('AnomalyDetectionDemoSection', () => {
  it('renderiza sin errores y muestra el título del caso práctico', () => {
    render(<AnomalyDetectionDemoSection />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/tráfico vehicular/i)
  })

  it('muestra el contador de episodio/paso inicial provisto por el hook real', () => {
    render(<AnomalyDetectionDemoSection />)
    expect(screen.getByText(/Episodio 1 · Paso 0\/50/)).toBeInTheDocument()
  })

  it('avanzar un paso actualiza el contador de episodio/paso en el render integrado', async () => {
    const user = userEvent.setup()
    render(<AnomalyDetectionDemoSection />)

    await user.click(screen.getByRole('button', { name: 'Avanzar un paso' }))

    expect(screen.getByText(/Episodio 1 · Paso 1\/50/)).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad básicas en el estado inicial', async () => {
    const { container } = render(<AnomalyDetectionDemoSection />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no tiene violaciones de accesibilidad básicas tras avanzar pasos (estado con historial/statusMessage)', async () => {
    const user = userEvent.setup()
    const { container } = render(<AnomalyDetectionDemoSection />)

    await user.click(screen.getByRole('button', { name: 'Avanzar un paso' }))
    await user.click(screen.getByRole('button', { name: 'Avanzar un paso' }))

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
