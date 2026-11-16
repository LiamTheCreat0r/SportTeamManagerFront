import { POSTES } from './constants.js'

export function participantAuPoste(participations, poste, role) {
  return participations.find((p) => p.poste === poste && p.titulaireOuRemplacant === role) ?? null
}

// Complete = every position has a starter and every player on the sheet is active.
export function estComplete(participations) {
  return (
    POSTES.every((poste) => participantAuPoste(participations, poste, 'TITULAIRE')) &&
    participations.every((p) => p.joueur?.statut === 'ACTIF')
  )
}

// Evaluated = every player on the sheet has a performance.
export function estEvaluee(participations) {
  return participations.length > 0 && participations.every((p) => p.performance != null)
}
