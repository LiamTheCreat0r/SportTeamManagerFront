import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { Alert, Badge, Empty, Loading, PageHeader } from '../components/ui.jsx'
import { LIEU_LABELS, RESULTAT_LABELS, RESULTATS } from '../constants.js'
import { useAction, useAsync } from '../hooks.js'
import { estPassee, formatDateTime } from '../utils.js'

export default function Rencontres() {
  const navigate = useNavigate()
  const action = useAction()
  const [resultats, setResultats] = useState({})
  const { data: rencontres, error, loading, reload } = useAsync(async () => {
    const list = await api.rencontres.list()
    return list.sort((a, b) => new Date(b.dateHeure) - new Date(a.dateHeure))
  }, [])

  async function enregistrerResultat(rencontre) {
    const resultat = resultats[rencontre.rencontreId]
    if (!resultat) return action.setError('Choisissez un résultat avant de l’enregistrer.')
    const ok = await action.run(rencontre.rencontreId, () => api.rencontres.patch(rencontre.rencontreId, { resultat }))
    if (ok) reload()
  }

  async function supprimer(rencontre) {
    if (!confirm(`Supprimer la rencontre contre ${rencontre.equipeAdverse} ?`)) return
    const ok = await action.run(rencontre.rencontreId, () => api.rencontres.remove(rencontre.rencontreId), {
      409: 'Cette rencontre ne peut pas être supprimée : sa feuille de match contient encore des joueurs.',
    })
    if (ok) reload()
  }

  return (
    <>
      <PageHeader title="Rencontres" subtitle="Planifiez les matchs et suivez les résultats">
        <Link className="btn primary" to="/rencontres/nouvelle">
          + Ajouter une rencontre
        </Link>
      </PageHeader>

      <Alert onClose={() => action.setError(null)}>{action.error}</Alert>
      <Alert>{error?.message}</Alert>

      <div className="card">
        {loading && !rencontres ? (
          <Loading />
        ) : !rencontres?.length ? (
          <Empty>Aucune rencontre.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Équipe adverse</th>
                  <th>Adresse</th>
                  <th>Lieu</th>
                  <th>Résultat</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {rencontres.map((r) => {
                  const passee = estPassee(r)
                  const busy = action.pending === r.rencontreId
                  return (
                    <tr key={r.rencontreId}>
                      <td style={{ whiteSpace: 'nowrap' }}>{formatDateTime(r.dateHeure)}</td>
                      <td>
                        <strong>{r.equipeAdverse}</strong>
                      </td>
                      <td className="muted">{r.adresse}</td>
                      <td>
                        <Badge value={r.lieu} label={LIEU_LABELS[r.lieu]} />
                      </td>
                      <td>
                        {r.resultat ? (
                          <Badge value={r.resultat} label={RESULTAT_LABELS[r.resultat]} />
                        ) : passee ? (
                          <select
                            className="small"
                            value={resultats[r.rencontreId] ?? ''}
                            onChange={(e) => setResultats({ ...resultats, [r.rencontreId]: e.target.value })}
                          >
                            <option value="">—</option>
                            {RESULTATS.map((res) => (
                              <option key={res} value={res}>
                                {RESULTAT_LABELS[res]}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <Badge label="À venir" tone="blue" />
                        )}
                      </td>
                      <td>
                        <div className="actions">
                          {passee ? (
                            <>
                              {!r.resultat && (
                                <button className="btn small primary" disabled={busy} onClick={() => enregistrerResultat(r)}>
                                  Enregistrer résultat
                                </button>
                              )}
                              <button className="btn small" onClick={() => navigate(`/rencontres/${r.rencontreId}/evaluations`)}>
                                Évaluations
                              </button>
                            </>
                          ) : (
                            <>
                              <button className="btn small" onClick={() => navigate(`/rencontres/${r.rencontreId}/feuille-de-match`)}>
                                Feuille de match
                              </button>
                              <button className="btn small" onClick={() => navigate(`/rencontres/${r.rencontreId}/modifier`)}>
                                Modifier
                              </button>
                              <button className="btn small danger" disabled={busy} onClick={() => supprimer(r)}>
                                Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
