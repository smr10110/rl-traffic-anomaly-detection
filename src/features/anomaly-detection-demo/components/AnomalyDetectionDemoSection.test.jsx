import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { AnomalyDetectionDemoSection } from './AnomalyDetectionDemoSection'

describe('AnomalyDetectionDemoSection', () => {
  it('renderiza sin errores y muestra el título del caso práctico', () => {
    render(<AnomalyDetectionDemoSection />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/tráfico vehicular/i)
  })

  it('no tiene violaciones de accesibilidad básicas', async () => {
    const { container } = render(<AnomalyDetectionDemoSection />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
