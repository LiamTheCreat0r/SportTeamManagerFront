import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Alert, Loading, PageHeader } from '../components/ui.jsx'
import { STATUT_LABELS, STATUTS } from '../constants.js'
import { useAction } from '../hooks.js'

const EMPTY = { nom: '', prenom: '', numeroLicence: '', dateNaissance: '', taille: '', poids: '', statut: 'ACTIF' }

export default function JoueurForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const action = useAction()
  const [form, setForm] = useState(id ? null : EMPTY)

  useEffect(() => {
    if (!id) return
    api.joueurs
      .get(id)
      .then((j) =>
        setForm({
          nom: j.nom ?? '',
          prenom: j.prenom ?? '',
          numeroLicence: j.numeroLicence ?? '',
          dateNaissance: j.dateNaissance ?? '',
          taille: j.taille ?? '',
          poids: j.poids ?? '',
          statut: j.statut ?? 'ACTIF',
        }),
      )
      .catch((err) => action.setError(err.status === 404 ? 'Joueur introuvable.' : err.message))
  }, [id, action.setError])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    const body = {
      ...form,
      dateNaissance: form.dateNaissance || null,
      taille: form.taille === '' ? null : Number(form.taille),
      poids: form.poids === '' ? null : Number(form.poids),
    }
    const ok = await action.run(
      'save',
      () => (id ? api.joueurs.update(id, body) : api.joueurs.create(body)),
      {
        409: 'Ce numéro de licence est déjà utilisé.',
        400: 'Données invalides, vérifiez le formulaire.',
      },
    )
    if (ok) navigate('/joueurs')
  }

  return (
    <>
      <PageHeader title={id ? 'Modifier un joueur' : 'Ajouter un joueur'} />
      <Alert onClose={() => action.setError(null)}>{action.error}</Alert>
      {!form ? (
        !action.error && <Loading />
      ) : (
        <div className="card card-body">
          <form className="form" onSubmit={onSubmit}>
            <div className="form-row">
              <label className="field">
                <span>Nom</span>
                <input value={form.nom} onChange={set('nom')} maxLength={50} required />
              </label>
              <label className="field">
                <span>Prénom</span>
                <input value={form.prenom} onChange={set('prenom')} maxLength={50} required />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Numéro de licence</span>
                <input
                  value={form.numeroLicence}
                  onChange={set('numeroLicence')}
                  placeholder="00042"
                  minLength={5}
                  maxLength={5}
                  pattern=".{5}"
                  title="5 caractères"
                  required
                />
              </label>
              <label className="field">
                <span>Date de naissance</span>
                <input type="date" value={form.dateNaissance} onChange={set('dateNaissance')} required />
              </label>
            </div>
            <div className="form-row">
              <label className="field">
                <span>Taille (cm)</span>
                <input type="number" min="0" max="999.99" step="0.01" value={form.taille} onChange={set('taille')} required />
              </label>
              <label className="field">
                <span>Poids (kg)</span>
                <input type="number" min="0" max="999.99" step="0.01" value={form.poids} onChange={set('poids')} required />
              </label>
            </div>
            <label className="field">
              <span>Statut</span>
              <select value={form.statut} onChange={set('statut')}>
                {STATUTS.map((s) => (
                  <option key={s} value={s}>
                    {STATUT_LABELS[s]}
                  </option>
                ))}
              </select>
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => navigate('/joueurs')}>
                Annuler
              </button>
              <button className="btn primary" disabled={action.pending}>
                {id ? 'Enregistrer' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
