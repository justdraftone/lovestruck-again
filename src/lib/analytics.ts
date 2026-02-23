import ReactGA from 'react-ga4'
import { supabase } from './supabase'
import { getUserId, getGeo } from './identity'

type EventType =
  | 'page_visit'
  | 'quiz_start'
  | 'quiz_complete'
  | 'letter_create'
  | 'letter_send'
  | 'letter_open'
  | 'share_click'
  | 'download_click'

interface TrackEventOptions {
  path?: string
  metadata?: Record<string, any>
}

// Initialize Google Analytics
let isGAInitialized = false

export function initializeGA() {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID

  if (measurementId && measurementId !== 'G-XXXXXXXXXX' && !isGAInitialized) {
    ReactGA.initialize(measurementId, {
      gaOptions: {
        send_page_view: false, // We'll send page views manually
      },
    })
    isGAInitialized = true
    console.debug('Google Analytics initialized')
  }
}

// Track page view in Google Analytics
export function trackPageView(path: string) {
  if (isGAInitialized) {
    ReactGA.send({ hitType: 'pageview', page: path })
  }
}

// Track event in Google Analytics
function trackGAEvent(eventName: string, params?: Record<string, any>) {
  if (isGAInitialized) {
    ReactGA.event(eventName, params)
  }
}

export async function trackEvent(
  eventType: EventType,
  options: TrackEventOptions = {}
): Promise<void> {
  try {
    const currentPath = options.path || window.location.pathname

    // Track in Google Analytics
    if (eventType === 'page_visit') {
      trackPageView(currentPath)
    } else {
      trackGAEvent(eventType, {
        ...options.metadata,
        path: currentPath,
      })
    }

    // Track in Supabase (existing functionality)
    const [geo] = await Promise.all([getGeo()])
    await supabase.from('visits').insert({
      path: currentPath,
      event_type: eventType,
      metadata: options.metadata || {},
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      user_id: getUserId(),
      country: geo?.country_name ?? null,
      country_code: geo?.country_code ?? null,
    })
  } catch (error) {
    console.debug('Event tracking skipped:', error)
  }
}
