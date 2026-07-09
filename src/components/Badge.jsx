import { Radio } from 'lucide-react'
import './Badge.css'

const VARIANTS = {
  live: { Icon: Radio, className: 'badge--live' },
}

export function Badge({ variant, children }) {
  const { Icon, className } = VARIANTS[variant]
  return (
    <span className={`badge ${className}`}>
      <Icon size={14} aria-hidden="true" className="badge__icon" /> {children}
    </span>
  )
}
