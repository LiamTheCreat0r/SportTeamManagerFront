import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth.jsx'

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <NavLink to="/" className="brand">
            <img src="./favicon.svg" alt="" width="26" height="26" />
            <span>Sport Team Manager</span>
          </NavLink>
          <nav className="nav">
            <NavLink to="/" end>Tableau de bord</NavLink>
            <NavLink to="/joueurs">Joueurs</NavLink>
            <NavLink to="/rencontres">Rencontres</NavLink>
          </nav>
          <div className="topbar-user">
            <span className="muted">{user}</span>
            <button className="btn ghost small" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  )
}
