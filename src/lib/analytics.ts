import { supabase } from './supabase'

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
    await supabase.from('visits').insert({
      path: options.path || window.location.pathname,
      event_type: eventType,
      metadata: options.metadata || {},
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
    })
  } catch (error) {
    console.debug('Event tracking skipped:', error)
  }
}
