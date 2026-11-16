export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  )
}

export function Alert({ children, onClose }) {
  if (!children) return null
  return (
    <div className="alert" role="alert">
      <span>{children}</span>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Fermer">
          ×
        </button>
      )}
    </div>
  )
}

const BADGE_TONES = {
  ACTIF: 'green',
  BLESSE: 'red',
  SUSPENDU: 'orange',
  ABSENT: 'gray',
  VICTOIRE: 'green',
  DEFAITE: 'red',
  NUL: 'gray',
  DOMICILE: 'blue',
  EXTERIEUR: 'purple',
}

export function Badge({ value, label, tone }) {
  if (!value && !label) return null
  return <span className={`badge ${tone || BADGE_TONES[value] || 'gray'}`}>{label ?? value}</span>
}

export function StatusPill({ ok, okLabel, koLabel }) {
  return <span className={`status-pill ${ok ? 'ok' : 'ko'}`}>{ok ? okLabel : koLabel}</span>
}

export function Loading() {
  return <div className="loading">Chargement…</div>
}

export function Empty({ children }) {
  return <div className="empty">{children}</div>
}
