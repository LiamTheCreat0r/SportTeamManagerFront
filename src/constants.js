export const STATUTS = ['ACTIF', 'BLESSE', 'ABSENT', 'SUSPENDU']
export const STATUT_LABELS = { ACTIF: 'Actif', BLESSE: 'Blessé', ABSENT: 'Absent', SUSPENDU: 'Suspendu' }

export const POSTES = ['TOPLANE', 'JUNGLE', 'MIDLANE', 'ADCARRY', 'SUPPORT']
export const ROLES = ['TITULAIRE', 'REMPLACANT']
export const ROLE_LABELS = { TITULAIRE: 'Titulaires', REMPLACANT: 'Remplaçants' }

export const LIEUX = ['DOMICILE', 'EXTERIEUR']
export const LIEU_LABELS = { DOMICILE: 'Domicile', EXTERIEUR: 'Extérieur' }

export const RESULTATS = ['VICTOIRE', 'DEFAITE', 'NUL']
export const RESULTAT_LABELS = { VICTOIRE: 'Victoire', DEFAITE: 'Défaite', NUL: 'Nul' }

export const PERFORMANCES = [
  { name: 'EXCELLENTE', value: 5 },
  { name: 'BONNE', value: 4 },
  { name: 'MOYENNE', value: 3 },
  { name: 'MAUVAISE', value: 2 },
  { name: 'CATASTROPHIQUE', value: 1 },
]

export function performanceLabel(value) {
  if (value === null || value === undefined) return null
  return PERFORMANCES.find((p) => p.value === value)?.name ?? String(value)
}
