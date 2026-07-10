import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ConclusionsSection } from '@/features/conclusions/components/ConclusionsSection'

describe('ConclusionsSection', () => {
  it('renderiza sin errores y muestra el título de la sección', () => {
    render(<ConclusionsSection />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/conclusiones y limitaciones/i)
  })

  it('muestra la sección de referencias con las 4 fuentes citadas', () => {
    render(<ConclusionsSection />)
    expect(screen.getByRole('heading', { name: /referencias/i })).toBeInTheDocument()
    expect(screen.getByText(/Sutton, R\. S\./)).toBeInTheDocument()
    expect(screen.getByText(/Watkins, C\. J\. C\. H\./)).toBeInTheDocument()
    expect(screen.getByText(/OpenAI\./)).toBeInTheDocument()
    expect(screen.getByText(/Juliani, A\./)).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad básicas', async () => {
    const { container } = render(<ConclusionsSection />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
