import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { axe } from 'jest-axe'
import { Band } from '@/components/Band'

describe('Band', () => {
  it('renderiza sus children y el tono por defecto (light)', () => {
    const { container } = render(<Band>contenido</Band>)
    expect(screen.getByText('contenido')).toBeInTheDocument()
    expect(container.querySelector('.band--light')).toBeInTheDocument()
  })

  it('aplica el tono y el modo "wide" indicados', () => {
    const { container } = render(
      <Band tone="dark" wide id="seccion">
        contenido
      </Band>,
    )
    expect(container.querySelector('.band--dark')).toBeInTheDocument()
    expect(container.querySelector('.band__inner--wide')).toBeInTheDocument()
    expect(container.querySelector('#seccion')).toBeInTheDocument()
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Band tone="soft">contenido</Band>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
