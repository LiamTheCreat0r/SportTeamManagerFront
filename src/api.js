// Small fetch wrapper around the Spring backend.

const DEFAULT_API_URL =
  import.meta.env.VITE_API_URL || (import.meta.env.DEV ? '/api' : 'http://localhost:8080')

const TOKEN_KEY = 'token'
const USER_KEY = 'username'
const API_URL_KEY = 'apiUrl'

function storageGet(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function storageSet(key, value) {
  try {
    if (value === null || value === undefined || value === '') localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  } catch {
    /* storage unavailable */
  }
}

export const session = {
  getToken: () => storageGet(TOKEN_KEY),
  getUsername: () => storageGet(USER_KEY),
  save(token, username) {
    storageSet(TOKEN_KEY, token)
    storageSet(USER_KEY, username)
  },
  clear() {
    storageSet(TOKEN_KEY, null)
    storageSet(USER_KEY, null)
  },
}

export function getApiUrl() {
  return (storageGet(API_URL_KEY) || DEFAULT_API_URL).replace(/\/+$/, '')
}

export function setApiUrl(url) {
  storageSet(API_URL_KEY, url && url.trim() !== DEFAULT_API_URL ? url.trim() : null)
}

export class ApiError extends Error {
  constructor(status, message) {
    super(message)
    this.status = status
  }
}

// Fired when the API rejects our token, so the app can send the user back to /login.
export const UNAUTHORIZED_EVENT = 'api:unauthorized'

export async function request(method, path, body) {
  const headers = { Accept: 'application/json' }
  const token = session.getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response
  try {
    response = await fetch(getApiUrl() + path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch {
    throw new ApiError(0, `Impossible de joindre l'API (${getApiUrl()}).`)
  }

  const text = await response.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!response.ok) {
    if (response.status === 401 && path !== '/auth/login') {
      session.clear()
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
    }
    const message = (data && typeof data === 'object' && data.message) || `Erreur ${response.status}`
    throw new ApiError(response.status, message)
  }
  return data
}

export const api = {
  login: (username, password) => request('POST', '/auth/login', { username, password }),

  joueurs: {
    list: () => request('GET', '/joueurs'),
    get: (id) => request('GET', `/joueurs/${id}`),
    create: (joueur) => request('POST', '/joueurs', joueur),
    update: (id, joueur) => request('PUT', `/joueurs/${id}`, joueur),
    remove: (id) => request('DELETE', `/joueurs/${id}`),
  },

  commentaires: {
    byJoueur: (joueurId) => request('GET', `/commentaires/joueur/${joueurId}`),
    create: (joueurId, contenu) => request('POST', '/commentaires', { joueurId, contenu }),
    remove: (id) => request('DELETE', `/commentaires/${id}`),
  },

  rencontres: {
    list: () => request('GET', '/rencontres'),
    get: (id) => request('GET', `/rencontres/${id}`),
    create: (rencontre) => request('POST', '/rencontres', rencontre),
    update: (id, rencontre) => request('PUT', `/rencontres/${id}`, rencontre),
    patch: (id, partial) => request('PATCH', `/rencontres/${id}`, partial),
    remove: (id) => request('DELETE', `/rencontres/${id}`),
  },

  participations: {
    list: () => request('GET', '/participations'),
    byRencontre: (rencontreId) => request('GET', `/participations/rencontre/${rencontreId}`),
    create: (participation) => request('POST', '/participations', participation),
    patch: (id, partial) => request('PATCH', `/participations/${id}`, partial),
    remove: (id) => request('DELETE', `/participations/${id}`),
    removePerformance: (id) => request('DELETE', `/participations/${id}/performance`),
  },
}
