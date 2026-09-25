/**
 * LaunchDarkly is used for exactly one thing in this app: a single
 * `track('source')` event. No feature flags are read anywhere (grep for
 * `useFlags` — there are none), so there is no reason to block the first paint
 * on the SDK's bootstrap round-trip, or to carry the React SDK in the entry
 * chunk. This loads the client after the page goes idle and fires the event.
 */
export function trackSourceWhenIdle(): () => void {
  const clientSideID = import.meta.env.VITE_LD_CLIENT_ID as string | undefined
  if (!clientSideID) return () => {}

  let cancelled = false

  const boot = async () => {
    try {
      const { initialize } = await import('launchdarkly-js-client-sdk')
      if (cancelled) return
      const client = initialize(clientSideID, { kind: 'user', key: 'anonymous' })
      await client.waitForInitialization(3)
      if (cancelled) return
      client.track('source', { source: 'cursor' })
    } catch {
      // Analytics only — never let this surface to the user.
    }
  }

  // Yield to the browser so the SDK never competes with LCP.
  const idle = typeof requestIdleCallback === 'function'
  const id = idle
    ? requestIdleCallback(boot, { timeout: 4000 })
    : window.setTimeout(boot, 2000)

  return () => {
    cancelled = true
    if (idle && typeof cancelIdleCallback === 'function') cancelIdleCallback(id as number)
    else clearTimeout(id as number)
  }
}
