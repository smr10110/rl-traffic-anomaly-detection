import { Car, CircleCheck, TriangleAlert, Construction } from 'lucide-react'
import { Card } from '../../../components/Card'
import { Badge } from '../../../components/Badge'
import './TrafficGridMap.css'

function Node({ node, isAgentHere }) {
  let className = 'grid-node'
  let icon = null

  if (isAgentHere) {
    className += ' grid-node--agent'
    icon = <Car size={18} aria-hidden="true" />
  } else if (node.visited && node.isAnomaly) {
    className += ' grid-node--anomaly'
    icon = <TriangleAlert size={16} aria-hidden="true" />
  } else if (node.visited && node.isCongestion) {
    className += ' grid-node--congestion'
    icon = <Construction size={16} aria-hidden="true" />
  } else if (node.visited) {
    className += ' grid-node--normal'
    icon = <CircleCheck size={16} aria-hidden="true" />
  } else {
    className += ' grid-node--unvisited'
  }

  return (
    <div className={className}>
      {icon}
    </div>
  )
}

export function TrafficGridMap({ grid, gridSize, position, hasStarted = true }) {
  return (
    <Card dark className="grid-map">
      <div className="grid-map__header">
        <h3>Red vial en vivo</h3>
        <Badge variant="live">EN VIVO</Badge>
      </div>
      <div className="grid-map__grid-wrapper">
        <div
          className="grid-map__grid"
          style={{ gridTemplateColumns: `repeat(${gridSize}, 1fr)` }}
          role="img"
          aria-label={`Mapa de ${gridSize} por ${gridSize} intersecciones, agente en fila ${position.row}, columna ${position.col}`}
        >
          {grid.map((node, i) => {
            const row = Math.floor(i / gridSize)
            const col = i % gridSize
            const isAgentHere = row === position.row && col === position.col
            return <Node key={i} node={node} isAgentHere={isAgentHere} />
          })}
        </div>
        {!hasStarted && (
          <p className="grid-map__empty-hint" aria-hidden="true">
            Grid listo — presiona "Avanzar un paso" para empezar
          </p>
        )}
      </div>
      <div className="grid-map__legend">
        <span><Car size={14} aria-hidden="true" /> Dron</span>
        <span><CircleCheck size={14} aria-hidden="true" className="legend__icon--up" /> Flujo normal</span>
        <span><Construction size={14} aria-hidden="true" className="legend__icon--warn" /> Congestión</span>
        <span><TriangleAlert size={14} aria-hidden="true" className="legend__icon--down" /> Anomalía</span>
        <span className="legend__unvisited-swatch" /> Sin visitar
      </div>
    </Card>
  )
}
