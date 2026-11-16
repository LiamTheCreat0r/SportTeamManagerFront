import { useCallback, useEffect, useState } from 'react'

// Loads data from an async function and exposes { data, error, loading, reload }.
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: null, error: null, loading: true })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const load = useCallback(fn, deps)

  const reload = useCallback(async () => {
    try {
      const data = await load()
      setState({ data, error: null, loading: false })
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }))
    }
  }, [load])

  useEffect(() => {
    setState((s) => ({ ...s, loading: true }))
    reload()
  }, [reload])

  return { ...state, reload }
}

// Runs an action, tracking which one is in progress and any error message.
export function useAction() {
  const [pending, setPending] = useState(null)
  const [error, setError] = useState(null)

  const run = useCallback(async (key, fn, messages = {}) => {
    setPending(key)
    setError(null)
    try {
      await fn()
      return true
    } catch (err) {
      setError(messages[err.status] || err.message)
      return false
    } finally {
      setPending(null)
    }
  }, [])

  return { pending, error, setError, run }
}
