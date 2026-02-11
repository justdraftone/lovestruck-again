// Persistent anonymous user identity + geo, shared by analytics and geoDetect

interface GeoData {
  country_code: string
  country_name: string
}

let geoCache: GeoData | null = null
let geoPromise: Promise<GeoData | null> | null = null

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

  geoPromise = (async () => {
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) })
      if (!res.ok) return null
      const data = await res.json()
      geoCache = { country_code: data.country_code ?? '', country_name: data.country_name ?? '' }
      return geoCache
    } catch {
      return null
    }
  })()

  return geoPromise
}
