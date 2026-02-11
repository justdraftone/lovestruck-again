import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { trackEvent } from '../lib/analytics'

export function useVisitTracking() {
  const location = useLocation()

  useEffect(() => {
    trackEvent('page_visit', { path: location.pathname })
  }, [location.pathname])
}
