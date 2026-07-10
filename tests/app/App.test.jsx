import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { App } from '@/app/App'

describe('App', () => {
  it('monta el shell completo con navegación y todas las secciones', () => {
    render(<App />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /caso práctico/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /conclusiones y limitaciones/i })).toBeInTheDocument()
  })
})
