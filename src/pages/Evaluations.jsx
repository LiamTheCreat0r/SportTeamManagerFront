import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../api.js'
import RencontreHeader from '../components/RencontreHeader.jsx'
import { Alert, Badge, Loading, StatusPill } from '../components/ui.jsx'
import { PERFORMANCES, performanceLabel, POSTES, ROLE_LABELS, ROLES } from '../constants.js'
import { estEvaluee, participantAuPoste } from '../feuilleDeMatch.js'
import { useAction, useAsync } from '../hooks.js'
import { joueurLabel } from '../utils.js'

const PERF_TONES = { 5: 'green', 4: 'green', 3: 'gray', 2: 'orange', 1: 'red' }

export default function Evaluations() {
  const { id } = useParams()
  const rencontreId = Number(id)
  const action = useAction()
  // Performance chosen in each row's select, keyed by participationId
  const [choix, setChoix] = useState({})

  const { data, error, loading, reload } = useAsync(async () => {
    const [rencontre, participations] = await Promise.all([
      api.rencontres.get(rencontreId),
      api.participations.byRencontre(rencontreId),
    ])
    return { rencontre, participations }
  }, [rencontreId])

  async function submit(participationId, fn) {
    const ok = await action.run(participationId, fn)
    if (ok) {
      setChoix((c) => ({ ...c, [participationId]: undefined }))
      reload()
    }
  }

  if (loading && !data) return <Loading />
  if (error && !data) {
    return (
      <>
        <RencontreHeader title="Évaluations" />
        <Alert>{error.status === 404 ? 'Rencontre introuvable.' : error.message}</Alert>
      </>
    )
  }

  const { rencontre, participations } = data

  return (
    <>
      <RencontreHeader title="Évaluations" rencontre={rencontre}>
        <StatusPill ok={estEvaluee(participations)} okLabel="TERMINÉES" koLabel="INCOMPLÈTES" />
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
                    <th>Performance</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {POSTES.map((poste) => {
                    const p = participantAuPoste(participations, poste, role)
                    if (!p) {
                      return (
                        <tr key={poste}>
                          <td>
                            <strong>{poste}</strong>
                          </td>
                          <td className="muted" colSpan={3}>
                            Aucun joueur
                          </td>
                        </tr>
                      )
                    }
                    const selected = choix[p.participationId] ?? (p.performance != null ? String(p.performance) : '')
                    const busy = action.pending === p.participationId
                    return (
                      <tr key={poste}>
                        <td>
                          <strong>{poste}</strong>
                        </td>
                        <td>{joueurLabel(p.joueur)}</td>
                        <td style={{ minWidth: 160 }}>
                          <select
                            className="small"
                            value={selected}
                            onChange={(e) => setChoix({ ...choix, [p.participationId]: e.target.value })}
                          >
                            <option value="">—</option>
                            {PERFORMANCES.map((perf) => (
                              <option key={perf.value} value={perf.value}>
                                {perf.name}
                              </option>
                            ))}
                          </select>
                          {p.performance != null && (
                            <div style={{ marginTop: 6 }}>
                              <Badge label={performanceLabel(p.performance)} tone={PERF_TONES[p.performance]} />
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="actions">
                            <button
                              className="btn small primary"
                              disabled={busy || !selected || selected === String(p.performance)}
                              onClick={() =>
                                submit(p.participationId, () =>
                                  api.participations.patch(p.participationId, { performance: Number(selected) }),
                                )
                              }
                            >
                              Mettre à jour
                            </button>
                            <button
                              className="btn small danger"
                              disabled={busy || p.performance == null}
                              onClick={() => submit(p.participationId, () => api.participations.removePerformance(p.participationId))}
                            >
                              Supprimer
                            </button>
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
