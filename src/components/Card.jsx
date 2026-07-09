import './Card.css'

export function Card({ children, dark = false, className = '' }) {
  return <div className={`card ${dark ? 'card--dark' : ''} ${className}`}>{children}</div>
}
