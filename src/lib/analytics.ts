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

export async function trackEvent(
  eventType: EventType,
  options: TrackEventOptions = {}
): Promise<void> {
  try {
    // `./supabase` is imported dynamically on purpose. It constructs the
    // Supabase client at module scope, and this module is reached from
    // useVisitTracking on every page view — a static import would pull the
    // whole SDK (~163KB raw) into the entry chunk and run createClient during
    // boot for visitors who never touch a Supabase-backed feature.
    const [geo, { supabase }] = await Promise.all([getGeo(), import('./supabase')])
    await supabase.from('visits').insert({
      path: options.path || window.location.pathname,
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
