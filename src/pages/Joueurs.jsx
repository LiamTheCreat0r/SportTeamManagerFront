import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api.js'
import { Alert, Badge, Empty, Loading, PageHeader } from '../components/ui.jsx'
import { STATUT_LABELS, STATUTS } from '../constants.js'
import { useAction, useAsync } from '../hooks.js'
import { formatDate } from '../utils.js'

export default function Joueurs() {
  const navigate = useNavigate()
  const { data: joueurs, error, loading, reload } = useAsync(() => api.joueurs.list(), [])
  const action = useAction()
  const [recherche, setRecherche] = useState('')
  const [statut, setStatut] = useState('')

  const filtered = useMemo(() => {
    const q = recherche.trim().toLowerCase()
    return (joueurs ?? []).filter(
      (j) =>
        (!q || (j.nom ?? '').toLowerCase().includes(q) || (j.prenom ?? '').toLowerCase().includes(q)) &&
        (!statut || j.statut === statut),
    )
  }, [joueurs, recherche, statut])

  async function supprimer(joueur) {
    if (!confirm(`Voulez-vous vraiment supprimer ${joueur.prenom} ${joueur.nom} ?`)) return
    const ok = await action.run(joueur.joueurId, () => api.joueurs.remove(joueur.joueurId), {
      409: 'Ce joueur ne peut pas être supprimé : il a encore des commentaires ou des participations.',
    })
    if (ok) reload()
  }

  return (
    <>
      <PageHeader title="Joueurs" subtitle="Gérez l'effectif de l'équipe">
        <Link className="btn primary" to="/joueurs/nouveau">
          + Ajouter un joueur
        </Link>
      </PageHeader>

      <Alert onClose={() => action.setError(null)}>{action.error}</Alert>
      <Alert>{error?.message}</Alert>

      <div className="card">
        <div className="toolbar">
          <input type="search" placeholder="Rechercher par nom ou prénom…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
          <select value={statut} onChange={(e) => setStatut(e.target.value)}>
            <option value="">Tous les statuts</option>
            {STATUTS.map((s) => (
              <option key={s} value={s}>
                {STATUT_LABELS[s]}
              </option>
            ))}
          </select>
        </div>

        {loading && !joueurs ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <Empty>Aucun joueur trouvé.</Empty>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Licence</th>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Date de naissance</th>
                  <th className="num">Taille</th>
                  <th className="num">Poids</th>
                  <th>Statut</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((j) => (
                  <tr key={j.joueurId}>
                    <td className="muted">{j.numeroLicence}</td>
                    <td>
                      <strong>{j.nom}</strong>
                    </td>
                    <td>{j.prenom}</td>
                    <td>{formatDate(j.dateNaissance)}</td>
                    <td className="num">{j.taille != null && `${Number(j.taille)} cm`}</td>
                    <td className="num">{j.poids != null && `${Number(j.poids)} kg`}</td>
                    <td>
                      <Badge value={j.statut} label={STATUT_LABELS[j.statut]} />
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn small" onClick={() => navigate(`/joueurs/${j.joueurId}/commentaires`)}>
                          Commentaires
                        </button>
                        <button className="btn small" onClick={() => navigate(`/joueurs/${j.joueurId}/modifier`)}>
                          Modifier
                        </button>
                        <button className="btn small danger" disabled={action.pending === j.joueurId} onClick={() => supprimer(j)}>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {joueurs && <div className="table-footer">{filtered.length} joueur(s) affiché(s)</div>}
      </div>
    </>
  )
}
