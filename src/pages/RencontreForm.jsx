import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { Alert, Loading, PageHeader } from '../components/ui.jsx'
import { LIEU_LABELS, LIEUX } from '../constants.js'
import { useAction } from '../hooks.js'
import { toDateTimeInput } from '../utils.js'

const EMPTY = { dateHeure: '', equipeAdverse: '', adresse: '', lieu: 'DOMICILE', resultat: null }

export default function RencontreForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const action = useAction()
  const [form, setForm] = useState(id ? null : EMPTY)
  const [minDate] = useState(() => toDateTimeInput(new Date()))

  useEffect(() => {
    if (!id) return
    api.rencontres
      .get(id)
      .then((r) =>
        setForm({
          dateHeure: r.dateHeure ? toDateTimeInput(r.dateHeure) : '',
          equipeAdverse: r.equipeAdverse ?? '',
          adresse: r.adresse ?? '',
          lieu: r.lieu ?? 'DOMICILE',
          resultat: r.resultat ?? null,
        }),
      )
      .catch((err) => action.setError(err.status === 404 ? 'Rencontre introuvable.' : err.message))
  }, [id, action.setError])

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

  async function onSubmit(e) {
    e.preventDefault()
    if (new Date(form.dateHeure) < new Date()) {
      return action.setError('La date de la rencontre doit être dans le futur.')
    }
    const body = { ...form, dateHeure: `${form.dateHeure}:00` }
    const ok = await action.run('save', () => (id ? api.rencontres.update(id, body) : api.rencontres.create(body)), {
      400: 'Données invalides, vérifiez le formulaire.',
    })
    if (ok) navigate('/rencontres')
  }

  return (
    <>
      <PageHeader title={id ? 'Modifier une rencontre' : 'Ajouter une rencontre'} />
      <Alert onClose={() => action.setError(null)}>{action.error}</Alert>
      {!form ? (
        !action.error && <Loading />
      ) : (
        <div className="card card-body">
          <form className="form" onSubmit={onSubmit}>
            <div className="form-row">
              <label className="field">
                <span>Date et heure</span>
                <input type="datetime-local" min={minDate} value={form.dateHeure} onChange={set('dateHeure')} required />
              </label>
              <label className="field">
                <span>Lieu</span>
                <select value={form.lieu} onChange={set('lieu')}>
                  {LIEUX.map((l) => (
                    <option key={l} value={l}>
                      {LIEU_LABELS[l]}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="field">
              <span>Équipe adverse</span>
              <input value={form.equipeAdverse} onChange={set('equipeAdverse')} maxLength={50} required />
            </label>
            <label className="field">
              <span>Adresse</span>
              <input value={form.adresse} onChange={set('adresse')} maxLength={255} required />
            </label>
            <div className="form-actions">
              <button type="button" className="btn" onClick={() => navigate('/rencontres')}>
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
