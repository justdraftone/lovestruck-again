import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

export function useVisitTracking() {
  const location = useLocation()

  // Deferred to idle: this fires a geo lookup and a Supabase insert, neither of
  // which should compete with the first paint.
  useEffect(() => {
    const path = location.pathname
    const send = () => trackEvent('page_visit', { path })
    const idle = typeof requestIdleCallback === 'function'
    const id = idle ? requestIdleCallback(send, { timeout: 4000 }) : window.setTimeout(send, 1500)
    return () => {
      if (idle && typeof cancelIdleCallback === 'function') cancelIdleCallback(id as number)
      else clearTimeout(id as number)
    }
  }, [location.pathname])
}
