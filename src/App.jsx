import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Commentaires from './pages/Commentaires.jsx'
import JoueurForm from './pages/JoueurForm.jsx'
import Joueurs from './pages/Joueurs.jsx'
import Login from './pages/Login.jsx'

function RequireAuth({ children }) {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return children
}

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route index element={<p>Tableau de bord</p>} />
            <Route path="joueurs" element={<Joueurs />} />
            <Route path="joueurs/nouveau" element={<JoueurForm />} />
            <Route path="joueurs/:id/modifier" element={<JoueurForm />} />
            <Route path="joueurs/:id/commentaires" element={<Commentaires />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
