import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { getApiUrl, setApiUrl } from '../api.js'
import { useAuth } from '../auth.jsx'

export default function Login() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [apiUrl, setApiUrlField] = useState(getApiUrl())
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function onSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setApiUrl(apiUrl)
    try {
      await login(username, password)
      navigate(location.state?.from || '/joueurs', { replace: true })
    } catch (err) {
      setError(err.status === 401 ? "Le nom d'utilisateur ou le mot de passe est incorrect." : err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <form className="card login-card" onSubmit={onSubmit}>
        <div className="login-brand">
          <img src="./favicon.svg" alt="" width="40" height="40" />
          <div>
            <h1>Sport Team Manager</h1>
            <p className="muted">Connectez-vous pour gérer votre équipe</p>
          </div>
        </div>

        <label className="field">
          <span>Nom d'utilisateur</span>
          <input value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required autoFocus />
        </label>
        <label className="field">
          <span>Mot de passe</span>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
        </label>

        <details className="api-settings">
          <summary>Paramètres de l'API</summary>
          <label className="field">
            <span>URL de l'API</span>
            <input value={apiUrl} onChange={(e) => setApiUrlField(e.target.value)} placeholder="http://localhost:8080" />
          </label>
        </details>

        {error && <div className="alert">{error}</div>}

        <button className="btn primary block" disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </form>
    </div>
  )
}
