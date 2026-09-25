// Persistent anonymous user identity + geo, shared by analytics and geoDetect

interface GeoData {
  country_code: string
  country_name: string
}

let geoCache: GeoData | null = null
let geoPromise: Promise<GeoData | null> | null = null

const GEO_KEY = 'ls_geo'
const GEO_TTL = 1000 * 60 * 60 * 24 * 30 // 30 days

export function getUserId(): string {
  const key = 'ls_uid'
  let id = localStorage.getItem(key)
  if (!id) {
    id = crypto.randomUUID()
    localStorage.setItem(key, id)
  }
  return id
}

export async function getGeo(): Promise<GeoData | null> {
  if (geoCache) return geoCache
  if (geoPromise) return geoPromise

  // A visitor's country does not change between sessions, so a cold TLS
  // handshake to a fourth-party origin on every page load is wasted. It also
  // keeps us well clear of ipapi.co's free-tier daily cap, past which every
  // user would silently fall back to the global question set.
  try {
    const raw = localStorage.getItem(GEO_KEY)
    if (raw) {
      const { at, data } = JSON.parse(raw)
      if (Date.now() - at < GEO_TTL && data?.country_code) {
        geoCache = data
        return geoCache
      }
    }
  } catch {
    // malformed or unavailable storage — fall through to the network
  }

  geoPromise = (async () => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
      if (!res.ok) return null
      const data = await res.json()
      geoCache = { country_code: data.country_code ?? '', country_name: data.country_name ?? '' }
      try {
        localStorage.setItem(GEO_KEY, JSON.stringify({ at: Date.now(), data: geoCache }))
      } catch {
        // storage full or blocked — the in-memory cache still applies
      }
      return geoCache
    } catch {
      return null
    }
  })()

  return geoPromise
}
