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

export async function trackEvent(
  eventType: EventType,
  options: TrackEventOptions = {}
): Promise<void> {
  try {
    const [geo] = await Promise.all([getGeo()])
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
