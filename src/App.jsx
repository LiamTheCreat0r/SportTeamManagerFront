import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Commentaires from './pages/Commentaires.jsx'
import Evaluations from './pages/Evaluations.jsx'
import FeuilleDeMatch from './pages/FeuilleDeMatch.jsx'
import JoueurForm from './pages/JoueurForm.jsx'
import Joueurs from './pages/Joueurs.jsx'
import Login from './pages/Login.jsx'
import RencontreForm from './pages/RencontreForm.jsx'
import Rencontres from './pages/Rencontres.jsx'
import TableauDeBord from './pages/TableauDeBord.jsx'

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
            <Route index element={<TableauDeBord />} />
            <Route path="joueurs" element={<Joueurs />} />
            <Route path="joueurs/nouveau" element={<JoueurForm />} />
            <Route path="joueurs/:id/modifier" element={<JoueurForm />} />
            <Route path="joueurs/:id/commentaires" element={<Commentaires />} />
            <Route path="rencontres" element={<Rencontres />} />
            <Route path="rencontres/nouvelle" element={<RencontreForm />} />
            <Route path="rencontres/:id/modifier" element={<RencontreForm />} />
            <Route path="rencontres/:id/feuille-de-match" element={<FeuilleDeMatch />} />
            <Route path="rencontres/:id/evaluations" element={<Evaluations />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}
