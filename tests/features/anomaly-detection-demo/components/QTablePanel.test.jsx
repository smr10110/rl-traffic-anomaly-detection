import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'
import { QTablePanel } from '@/features/anomaly-detection-demo/components/QTablePanel'

function makeQTable(rows = 25) {
  return Array.from({ length: rows }, () => [0, 0, 0, 0])
}

describe('QTablePanel', () => {
  it('muestra la cantidad de estados y acciones en el resumen', () => {
    render(<QTablePanel qTable={makeQTable(25)} />)
    expect(screen.getByText(/ver tabla q completa \(25 estados × 4 acciones\)/i)).toBeInTheDocument()
  })

  it('renderiza una fila por estado con sus 4 valores formateados', () => {
    const qTable = makeQTable(2)
    qTable[0] = [1.5, -2, 0, 3.256]
    qTable[1] = [0, 0, 0, 0]
    render(<QTablePanel qTable={qTable} />)
    expect(screen.getByText('1.50')).toBeInTheDocument()
    expect(screen.getByText('-2.00')).toBeInTheDocument()
    expect(screen.getByText('3.26')).toBeInTheDocument()
  })

  it('asigna la clase "up" a valores no negativos y "down" a negativos', () => {
    const qTable = [[5, -5, 0, -0.1]]
    const { container } = render(<QTablePanel qTable={qTable} />)
    expect(container.querySelectorAll('.qtable-grid__cell--up')).toHaveLength(2) // 5 y 0
    expect(container.querySelectorAll('.qtable-grid__cell--down')).toHaveLength(2)
  })

  it('la celda con mayor magnitud tiene opacidad máxima y una en cero tiene la mínima', () => {
    const qTable = [[10, 0, -5, 2]]
    const { container } = render(<QTablePanel qTable={qTable} />)
    const cells = container.querySelectorAll('.qtable-grid__cell')
    expect(cells[0].style.opacity).toBe('1') // 0.15 + (10/10)*0.85 = 1
    expect(cells[1].style.opacity).toBe('0.15') // valor 0 -> intensidad 0
  })

  it('el detalle es expandible: el summary permite alternar la sección', async () => {
    const user = userEvent.setup()
    const { container } = render(<QTablePanel qTable={makeQTable(3)} />)
    const details = container.querySelector('details')
    expect(details.open).toBe(false)
    await user.click(screen.getByText(/ver tabla q completa/i))
    expect(details.open).toBe(true)
  })

  it('no tiene violaciones de accesibilidad cerrado', async () => {
    const { container } = render(<QTablePanel qTable={makeQTable(5)} />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('no tiene violaciones de accesibilidad abierto (con datos)', async () => {
    const user = userEvent.setup()
    const { container } = render(<QTablePanel qTable={makeQTable(5)} />)
    await user.click(screen.getByText(/ver tabla q completa/i))
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
