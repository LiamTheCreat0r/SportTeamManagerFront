import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Alert, Empty, Loading, PageHeader } from '../components/ui.jsx'
import { useAction, useAsync } from '../hooks.js'
import { formatDate, joueurLabel } from '../utils.js'

export default function Commentaires() {
  const { id } = useParams()
  const action = useAction()
  const [contenu, setContenu] = useState('')
  const { data, error, loading, reload } = useAsync(async () => {
    const [joueur, commentaires] = await Promise.all([api.joueurs.get(id), api.commentaires.byJoueur(id)])
    commentaires.sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '') || b.commentaireId - a.commentaireId)
    return { joueur, commentaires }
  }, [id])

  async function publier(e) {
    e.preventDefault()
    if (!contenu.trim()) return
    const ok = await action.run('create', () => api.commentaires.create(Number(id), contenu.trim()))
    if (ok) {
      setContenu('')
      reload()
    }
  }

  async function supprimer(commentaireId) {
    if (!confirm('Supprimer ce commentaire ?')) return
    const ok = await action.run(commentaireId, () => api.commentaires.remove(commentaireId))
    if (ok) reload()
  }

  return (
    <>
      <PageHeader title="Commentaires" subtitle={data ? joueurLabel(data.joueur) : null}>
        <Link className="btn" to="/joueurs">
          ← Joueurs
        </Link>
      </PageHeader>

      <Alert onClose={() => action.setError(null)}>{action.error}</Alert>
      <Alert>{error && (error.status === 404 ? 'Joueur introuvable.' : error.message)}</Alert>

      <div className="stack">
        <form className="card card-body form" style={{ maxWidth: 'none' }} onSubmit={publier}>
          <label className="field">
            <span>Nouveau commentaire</span>
            <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} maxLength={200} placeholder="Votre commentaire…" />
          </label>
          <div className="char-count">{contenu.length}/200</div>
          <div className="form-actions">
            <button className="btn primary" disabled={!contenu.trim() || action.pending === 'create'}>
              Publier le commentaire
            </button>
          </div>
        </form>

        <div className="card">
          {loading && !data ? (
            <Loading />
          ) : !data?.commentaires.length ? (
            <Empty>Aucun commentaire pour ce joueur.</Empty>
          ) : (
            data.commentaires.map((c) => (
              <div className="comment" key={c.commentaireId}>
                <div>
                  <div className="comment-date">{formatDate(c.date)}</div>
                  <p>{c.contenu}</p>
                </div>
                <button className="btn small danger" disabled={action.pending === c.commentaireId} onClick={() => supprimer(c.commentaireId)}>
                  Supprimer
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}
