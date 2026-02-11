import { describe, it, expect, vi, afterEach } from 'vitest'
import { detectQuestionSet } from './geoDetect'

afterEach(() => {
  vi.restoreAllMocks()
})

describe('detectQuestionSet', () => {
  it('returns "nigeria" when country code is NG', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country_code: 'NG' }),
    }))
    expect(await detectQuestionSet()).toBe('nigeria')
  })

  it('returns "global" when country code is not NG', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ country_code: 'US' }),
    }))
    expect(await detectQuestionSet()).toBe('global')
  })

  it('returns "global" when fetch response is not ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await detectQuestionSet()).toBe('global')
  })

  it('returns "global" when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')))
    expect(await detectQuestionSet()).toBe('global')
  })
})
