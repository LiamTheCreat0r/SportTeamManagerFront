import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api, session, UNAUTHORIZED_EVENT } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => (session.getToken() ? session.getUsername() || 'admin' : null))

  const login = useCallback(async (username, password) => {
    const { token, username: name } = await api.login(username, password)
    session.save(token, name)
    setUser(name)
  }, [])

  const logout = useCallback(() => {
    session.clear()
    setUser(null)
  }, [])

  useEffect(() => {
    const onUnauthorized = () => setUser(null)
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized)
  }, [])

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
