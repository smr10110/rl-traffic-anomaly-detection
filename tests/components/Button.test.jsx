import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { Button } from '@/components/Button'

describe('Button', () => {
  it('renderiza sus children y usa el tamaño "lg" por defecto', () => {
    render(<Button>Continuar</Button>)
    const button = screen.getByRole('button', { name: 'Continuar' })
    expect(button).toHaveClass('btn--lg')
  })

  it('aplica el tamaño "sm" cuando se indica', () => {
    render(<Button size="sm">Avanzar</Button>)
    expect(screen.getByRole('button', { name: 'Avanzar' })).toHaveClass('btn--sm')
  })

  it('llama a onClick al hacer click y respeta "disabled"', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Click</Button>)
    await user.click(screen.getByRole('button', { name: 'Click' }))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Button>Continuar</Button>)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
