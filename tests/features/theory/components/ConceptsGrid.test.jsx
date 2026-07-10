import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { ConceptsGrid } from '@/features/theory/components/ConceptsGrid'

describe('ConceptsGrid', () => {
  it('renderiza los 6 conceptos fundamentales de RL', () => {
    render(<ConceptsGrid />)
    ;['Agente', 'Entorno', 'Estado', 'Acción', 'Recompensa', 'Política'].forEach((term) => {
      expect(screen.getByText(term)).toBeInTheDocument()
    })
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<ConceptsGrid />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
