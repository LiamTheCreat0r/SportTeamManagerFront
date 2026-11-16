import { api } from '../api.js'
import { Alert, Badge, Empty, Loading, PageHeader } from '../components/ui.jsx'
import { STATUT_LABELS } from '../constants.js'
import { useAsync } from '../hooks.js'
import { statistiquesEquipe, statistiquesJoueurs } from '../stats.js'
import { joueurLabel } from '../utils.js'

function Stat({ value, pct, label, tone }) {
  return (
    <div className={`card stat ${tone}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">
        {label} · {pct}%
      </div>
      <div className="stat-bar">
        <div style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

const dash = <span className="muted">—</span>

export default function TableauDeBord() {
  const { data, error, loading } = useAsync(async () => {
    const [joueurs, rencontres, participations] = await Promise.all([
      api.joueurs.list(),
      api.rencontres.list(),
      api.participations.list(),
    ])
    return {
      equipe: statistiquesEquipe(rencontres),
      joueurs: statistiquesJoueurs(joueurs, participations, rencontres),
    }
  }, [])

  if (loading && !data) return <Loading />

  return (
    <>
      <PageHeader
        title="Tableau de bord"
        subtitle={data ? `${data.equipe.jouees} match(s) joué(s)` : null}
      />
      <Alert>{error?.message}</Alert>

      {data && (
        <>
          <div className="stats">
            <Stat tone="green" value={data.equipe.victoires} pct={data.equipe.pctVictoires} label="Matchs gagnés" />
            <Stat tone="gray" value={data.equipe.nuls} pct={data.equipe.pctNuls} label="Matchs nuls" />
            <Stat tone="red" value={data.equipe.defaites} pct={data.equipe.pctDefaites} label="Matchs perdus" />
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Statistiques des joueurs</h2>
            </div>
            {data.joueurs.length === 0 ? (
              <Empty>Aucun joueur.</Empty>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Joueur</th>
                      <th>Statut</th>
                      <th>Poste le plus performant</th>
                      <th className="num">Matchs consécutifs</th>
                      <th className="num">Titularisations</th>
                      <th className="num">Remplaçant</th>
                      <th className="num">Moyenne éval.</th>
                      <th className="num">% gagnés</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.joueurs.map((s) => (
                      <tr key={s.joueur.joueurId}>
                        <td>{joueurLabel({ ...s.joueur, statut: 'ACTIF' })}</td>
                        <td>
                          <Badge value={s.joueur.statut} label={STATUT_LABELS[s.joueur.statut]} />
                        </td>
                        <td>{s.posteLePlusPerformant ?? dash}</td>
                        <td className="num">{s.consecutifs}</td>
                        <td className="num">{s.titularisations}</td>
                        <td className="num">{s.remplacements}</td>
                        <td className="num">{s.moyenneEvaluations != null ? s.moyenneEvaluations.toFixed(1) : dash}</td>
                        <td className="num">{s.pctGagnes != null ? `${s.pctGagnes}%` : dash}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
