import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { AlgorithmExplainer } from '@/features/theory/components/AlgorithmExplainer'

describe('AlgorithmExplainer', () => {
  it('renderiza el título del algoritmo y la tabla de recompensas', () => {
    render(<AlgorithmExplainer />)
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(/Q-learning/i)
    expect(screen.getByText('+100')).toBeInTheDocument()
    expect(screen.getByText('−50')).toBeInTheDocument()
    expect(screen.getByText('−1')).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<AlgorithmExplainer />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
