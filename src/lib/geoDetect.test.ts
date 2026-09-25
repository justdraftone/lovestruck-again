import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'

// `getGeo` memoises the lookup in module scope (and now in localStorage) so a
// visitor's country is fetched once, not on every page view. These tests must
// therefore start from a clean module registry and clean storage, otherwise
// the first case's result leaks into all the others.
beforeEach(() => {
  vi.resetModules()
  localStorage.clear()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

async function detect() {
  const { detectQuestionSet } = await import('./geoDetect')
  return detectQuestionSet()
}

describe('detectQuestionSet', () => {
  it('returns "nigeria" when country code is NG', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country_code: 'NG' }),
    }))
    expect(await detect()).toBe('nigeria')
  })

  it('returns "global" when country code is not NG', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country_code: 'US' }),
    }))
    expect(await detect()).toBe('global')
  })

  it('returns "global" when fetch response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await detect()).toBe('global')
  })

  it('returns "global" when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    expect(await detect()).toBe('global')
  })

  it('reuses the cached country instead of re-fetching', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country_code: 'NG' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { detectQuestionSet } = await import('./geoDetect')
    expect(await detectQuestionSet()).toBe('nigeria')
    expect(await detectQuestionSet()).toBe('nigeria')
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
