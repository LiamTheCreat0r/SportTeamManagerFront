import { POSTES } from './constants.js'

const pct = (n, total) => (total > 0 ? Math.floor((n / total) * 100) : 0)

export function statistiquesEquipe(rencontres) {
  const jouees = rencontres.filter((r) => r.resultat)
  const victoires = jouees.filter((r) => r.resultat === 'VICTOIRE').length
  const nuls = jouees.filter((r) => r.resultat === 'NUL').length
  const defaites = jouees.filter((r) => r.resultat === 'DEFAITE').length
  return {
    jouees: jouees.length,
    victoires,
    nuls,
    defaites,
    pctVictoires: pct(victoires, jouees.length),
    pctNuls: pct(nuls, jouees.length),
    pctDefaites: pct(defaites, jouees.length),
  }
}

const moyenne = (values) => (values.length ? values.reduce((a, b) => a + b, 0) / values.length : null)

// Per-player statistics, only counting matches that have a result.
export function statistiquesJoueurs(joueurs, participations, rencontres) {
  const jouees = rencontres
    .filter((r) => r.resultat)
    .sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure)) // most recent first
  const resultatParRencontre = new Map(jouees.map((r) => [r.rencontreId, r.resultat]))

  return joueurs.map((joueur) => {
    const parts = participations.filter(
      (p) => p.joueur?.joueurId === joueur.joueurId && resultatParRencontre.has(p.rencontre?.rencontreId),
    )
    const evaluees = parts.filter((p) => p.performance != null)

    // Position with the best average rating
    let posteLePlusPerformant = null
    let meilleureMoyenne = -Infinity
    for (const poste of POSTES) {
      const m = moyenne(evaluees.filter((p) => p.poste === poste).map((p) => p.performance))
      if (m !== null && m > meilleureMoyenne) {
        meilleureMoyenne = m
        posteLePlusPerformant = poste
      }
    }

    // Number of consecutive played matches up to today
    const rencontresDuJoueur = new Set(parts.map((p) => p.rencontre.rencontreId))
    let consecutifs = 0
    for (const r of jouees) {
      if (!rencontresDuJoueur.has(r.rencontreId)) break
      consecutifs++
    }

    const gagnes = parts.filter((p) => resultatParRencontre.get(p.rencontre.rencontreId) === 'VICTOIRE').length

    return {
      joueur,
      posteLePlusPerformant,
      consecutifs,
      titularisations: parts.filter((p) => p.titulaireOuRemplacant === 'TITULAIRE').length,
      remplacements: parts.filter((p) => p.titulaireOuRemplacant === 'REMPLACANT').length,
      moyenneEvaluations: moyenne(evaluees.map((p) => p.performance)),
      pctGagnes: parts.length ? pct(gagnes, parts.length) : null,
    }
  })
}
