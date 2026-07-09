import './ConceptsGrid.css'

const CONCEPTS = [
  {
    term: 'Agente',
    definition: 'Quien aprende y toma las decisiones.',
    example: 'El dron de monitoreo que patrulla la ciudad buscando anomalías.',
  },
  {
    term: 'Entorno',
    definition: 'El mundo con el que el agente interactúa y que responde a sus acciones.',
    example: 'La cuadrícula de calles e intersecciones de la ciudad.',
  },
  {
    term: 'Estado',
    definition: 'La información que describe la situación actual del entorno.',
    example: 'La coordenada actual del dron en el mapa (fila, columna).',
  },
  {
    term: 'Acción',
    definition: 'Lo que el agente puede hacer en cada estado.',
    example: 'Moverse al Norte, Sur, Este u Oeste.',
  },
  {
    term: 'Recompensa',
    definition: 'La señal numérica que le dice al agente qué tan buena fue su acción.',
    example: '+100 por encontrar la anomalía, −50 por entrar a congestión, −1 por cada paso.',
  },
  {
    term: 'Política',
    definition: 'La estrategia aprendida: qué acción tomar en cada estado.',
    example: '"Desde esta intersección → moverse al Este es la ruta más directa y sin congestión."',
  },
]

export function ConceptsGrid() {
  return (
    <dl className="concepts">
      {CONCEPTS.map(({ term, definition, example }) => (
        <div className="concepts__card" key={term}>
          <dt>{term}</dt>
          <dd>
            <p>{definition}</p>
            <p className="concepts__example">{example}</p>
          </dd>
        </div>
      ))}
    </dl>
  )
}
