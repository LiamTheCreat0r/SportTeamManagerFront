// "00001 : NOM Prénom" (+ statut when the player is not active), same as the old frontend.
export function joueurLabel(joueur) {
  if (!joueur) return ''
  let label = `${joueur.numeroLicence} : ${joueur.nom ?? ''} ${joueur.prenom ?? ''}`.trim()
  if (joueur.statut && joueur.statut !== 'ACTIF') label += ` (${joueur.statut})`
  return label
}

const pad = (n) => String(n).padStart(2, '0')

export function formatDate(value) {
  if (!value) return ''
  const [y, m, d] = value.slice(0, 10).split('-')
  return `${d}/${m}/${y}`
}

export function formatDateTime(value) {
  if (!value) return ''
  const d = new Date(value)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Value for <input type="datetime-local">
export function toDateTimeInput(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function estPassee(rencontre) {
  return new Date(rencontre.dateHeure) < new Date()
}
