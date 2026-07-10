import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { TheorySection } from '@/features/theory/components/TheorySection'

describe('TheorySection', () => {
  it('renderiza sin errores y muestra el título principal', () => {
    render(<TheorySection />)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(/Aprendizaje por Refuerzo/i)
  })

  it('no tiene violaciones de accesibilidad básicas', async () => {
    const { container } = render(<TheorySection />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
