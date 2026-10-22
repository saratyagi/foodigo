import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

export function useRouteLoading(minMs = 600) {
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), minMs)
    return () => clearTimeout(t)
  }, [location.pathname, minMs])
  return loading
}
