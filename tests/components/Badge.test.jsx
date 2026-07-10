import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Badge } from '@/components/Badge'

describe('Badge', () => {
  it('renderiza el texto pasado como children', () => {
    render(<Badge variant="live">EN VIVO</Badge>)
    expect(screen.getByText('EN VIVO')).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Badge variant="live">EN VIVO</Badge>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
