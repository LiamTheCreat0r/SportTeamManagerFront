import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api.js'
import RencontreHeader from '../components/RencontreHeader.jsx'
import { Alert, Loading, StatusPill } from '../components/ui.jsx'
import { POSTES, ROLE_LABELS, ROLES } from '../constants.js'
import { estComplete, participantAuPoste } from '../feuilleDeMatch.js'
import { useAction, useAsync } from '../hooks.js'
import { joueurLabel } from '../utils.js'

export default function FeuilleDeMatch() {
  const { id } = useParams()
  const rencontreId = Number(id)
  const action = useAction()
  // Player chosen in each row's select, keyed by "ROLE-POSTE"
  const [choix, setChoix] = useState({})

  const { data, error, loading, reload } = useAsync(async () => {
    const [rencontre, participations, joueurs] = await Promise.all([
      api.rencontres.get(rencontreId),
      api.participations.byRencontre(rencontreId),
      api.joueurs.list(),
    ])
    return { rencontre, participations, joueurs }
  }, [rencontreId])

  async function submit(key, fn) {
    const ok = await action.run(key, fn, {
      409: 'Ce joueur est déjà sur la feuille de match.',
      400: 'Requête invalide.',
    })
    if (ok) {
      setChoix((c) => ({ ...c, [key]: undefined }))
      reload()
    }
  }

  if (loading && !data) return <Loading />
  if (error && !data) {
    return (
      <>
        <RencontreHeader title="Feuille de match" />
        <Alert>{error.status === 404 ? 'Rencontre introuvable.' : error.message}</Alert>
      </>
    )
  }

  const { rencontre, participations, joueurs } = data
  const surLaFeuille = new Set(participations.map((p) => p.joueur?.joueurId))
  const selectionnables = joueurs.filter((j) => j.statut === 'ACTIF' && !surLaFeuille.has(j.joueurId))

  return (
    <>
      <RencontreHeader title="Feuille de match" rencontre={rencontre}>
        <StatusPill ok={estComplete(participations)} okLabel="COMPLÈTE" koLabel="INCOMPLÈTE" />
      </RencontreHeader>

      <Alert onClose={() => action.setError(null)}>{action.error}</Alert>

      <div className="grid-2">
        {ROLES.map((role) => (
          <div className="card" key={role}>
            <div className="card-header">
              <h2>{ROLE_LABELS[role]}</h2>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Poste</th>
                    <th>Joueur</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {POSTES.map((poste) => {
                    const key = `${role}-${poste}`
                    const participant = participantAuPoste(participations, poste, role)
                    const options = participant ? [participant.joueur, ...selectionnables] : selectionnables
                    const selected = choix[key] ?? (participant ? String(participant.joueur.joueurId) : '')
                    const busy = action.pending === key
                    return (
                      <tr key={poste}>
                        <td>
                          <strong>{poste}</strong>
                        </td>
                        <td style={{ minWidth: 200 }}>
                          <select className="small" value={selected} onChange={(e) => setChoix({ ...choix, [key]: e.target.value })}>
                            {!participant && <option value="">— Sélectionner un joueur —</option>}
                            {options.map((j) => (
                              <option key={j.joueurId} value={j.joueurId}>
                                {joueurLabel(j)}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <div className="actions">
                            {participant ? (
                              <>
                                <button
                                  className="btn small"
                                  disabled={busy || selected === String(participant.joueur.joueurId)}
                                  onClick={() =>
                                    submit(key, () =>
                                      api.participations.patch(participant.participationId, {
                                        joueur: { joueurId: Number(selected) },
                                        poste,
                                        titulaireOuRemplacant: role,
                                      }),
                                    )
                                  }
                                >
                                  Modifier
                                </button>
                                <button
                                  className="btn small danger"
                                  disabled={busy}
                                  onClick={() => submit(key, () => api.participations.remove(participant.participationId))}
                                >
                                  Retirer
                                </button>
                              </>
                            ) : (
                              <button
                                className="btn small primary"
                                disabled={busy || !selected}
                                onClick={() =>
                                  submit(key, () =>
                                    api.participations.create({
                                      joueur: { joueurId: Number(selected) },
                                      rencontre: { rencontreId },
                                      poste,
                                      titulaireOuRemplacant: role,
                                    }),
                                  )
                                }
                              >
                                Assigner
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
