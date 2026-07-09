import './Button.css'

// size="lg" (56px) = button-pill-cta del hero. size="sm" (44px) = el CTA real
// "Sign up" medido en coinbase.com — usado para controles inline (ver SimulationControls).
export function Button({ children, size = 'lg', ...props }) {
  return (
    <button className={`btn btn--${size}`} {...props}>
      {children}
    </button>
  )
}
