import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Card } from '@/components/Card'

describe('Card', () => {
  it('renderiza sus children sin la clase "card--dark" por defecto', () => {
    const { container } = render(<Card>contenido</Card>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(container.querySelector('.card--dark')).not.toBeInTheDocument()
  })

  it('aplica la clase "card--dark" cuando dark=true, junto a className extra', () => {
    const { container } = render(
      <Card dark className="custom-class">
        contenido
      </Card>,
    )
    expect(container.querySelector('.card--dark')).toBeInTheDocument()
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Card dark>contenido</Card>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
