import './Band.css'

// Banda full-bleed (fondo edge-to-edge) para el "page rhythm" del DESIGN.md:
// alterna light/soft/dark en vez de dejar todo el contenido sobre un único fondo.
// `wide` amplía el contenedor interno (1024px) para layouts de dos columnas texto+imagen.
export function Band({ tone = 'light', wide = false, id, className = '', children }) {
  return (
    <div className={`band band--${tone} ${className}`} id={id}>
      <div className={`band__inner ${wide ? 'band__inner--wide' : ''}`}>{children}</div>
    </div>
  )
}
