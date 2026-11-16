import { Link } from 'react-router-dom'
import { LIEU_LABELS } from '../constants.js'
import { formatDateTime } from '../utils.js'
import { PageHeader } from './ui.jsx'

export default function RencontreHeader({ title, rencontre, children }) {
  const subtitle = rencontre
    ? `vs ${rencontre.equipeAdverse} · ${formatDateTime(rencontre.dateHeure)} · ${LIEU_LABELS[rencontre.lieu] ?? ''}`
    : null
  return (
    <PageHeader title={title} subtitle={subtitle}>
      {children}
      <Link className="btn" to="/rencontres">
        ← Rencontres
      </Link>
    </PageHeader>
  )
}
