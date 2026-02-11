import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

type Period = 'today' | '7d' | '30d' | '90d' | 'all'

interface Visit {
  id: string
  path: string
  event_type: string
  metadata: Record<string, unknown>
  referrer: string | null
  user_agent: string
  created_at: string
}

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '90d' },
  { label: 'All Time', value: 'all' },
]

const S = {
  page: { minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui, -apple-system, sans-serif' },
  container: { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
  card: { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem' },
  label: { fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9ca3af', marginBottom: '0.4rem' },
  bigNum: { fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, color: '#111827', letterSpacing: '-0.02em' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '1rem' },
  row: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  muted: { color: '#6b7280', fontSize: '0.8rem' },
  track: { height: '3px', background: '#f3f4f6', borderRadius: '99px', marginTop: '4px' },
} as const

function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (period === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  return null
}

function eventBadge(type: string): { bg: string; color: string } {
  const map: Record<string, { bg: string; color: string }> = {
    page_visit:     { bg: '#eff6ff', color: '#2563eb' },
    quiz_start:     { bg: '#fff7ed', color: '#c2410c' },
    quiz_complete:  { bg: '#f0fdf4', color: '#16a34a' },
    letter_create:  { bg: '#fdf4ff', color: '#9333ea' },
    letter_send:    { bg: '#f0f0ff', color: '#4f46e5' },
    letter_open:    { bg: '#ecfdf5', color: '#059669' },
    share_click:    { bg: '#fef2f2', color: '#dc2626' },
    download_click: { bg: '#fefce8', color: '#d97706' },
  }
  return map[type] ?? { bg: '#f9fafb', color: '#6b7280' }
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ ...S.card, borderTop: accent ? `2px solid ${accent}` : '1px solid #e5e7eb' }}>
      <div style={S.label}>{label}</div>
      <div style={{ ...S.bigNum, color: accent ?? '#111827' }}>{value}</div>
    </div>
  )
}

function BarRow({ label, count, total, fill }: { label: string; count: number; total: number; fill: string }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div style={{ marginBottom: '0.6rem' }}>
      <div style={S.row}>
        <span style={{ fontSize: '0.8rem', color: '#374151', fontFamily: 'monospace' }}>{label}</span>
        <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{count} <span style={{ color: '#d1d5db' }}>({pct}%)</span></span>
      </div>
      <div style={S.track}>
        <div style={{ height: '100%', width: `${pct}%`, background: fill, borderRadius: '99px', transition: 'width 0.4s ease' }} />
      </div>
    </div>
  )
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [allVisits, setAllVisits] = useState<Visit[]>([])
  const [period, setPeriod] = useState<Period>('7d')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'untttld') {
      setIsAuthenticated(true)
      fetchVisits()
    } else {
      alert('Incorrect password')
    }
  }

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('visits')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5000)
      if (error) throw error
      setAllVisits(data || [])
    } catch (err) {
      console.error('Failed to fetch visits:', err)
      alert('Failed to fetch visit data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchVisits, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const filteredVisits = useMemo(() => {
    const start = getPeriodStart(period)
    if (!start) return allVisits
    return allVisits.filter(v => new Date(v.created_at) >= start)
  }, [allVisits, period])

  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const byPath: Record<string, number> = {}
    const byEventType: Record<string, number> = {}
    const byReferrer: Record<string, number> = {}
    let todayCount = 0, weekCount = 0
    let gamesCompleted = 0, soloCompleted = 0, couplesCompleted = 0
    let soloShared = 0, couplesShared = 0

    filteredVisits.forEach((visit) => {
      const visitDate = new Date(visit.created_at)
      byPath[visit.path] = (byPath[visit.path] || 0) + 1
      const et = visit.event_type || 'page_visit'
      byEventType[et] = (byEventType[et] || 0) + 1
      if (visitDate >= todayStart) todayCount++
      if (visitDate >= weekStart) weekCount++

      if (et === 'quiz_complete') {
        gamesCompleted++
        const mode = (visit.metadata?.mode as string) || ''
        if (mode === 'solo') soloCompleted++
        else if (mode.startsWith('couples')) couplesCompleted++
      }
      if (et === 'share_click') {
        const type = (visit.metadata?.type as string) || ''
        if (type === 'solo_result') soloShared++
        else if (type === 'couples_result') couplesShared++
      }

      let source = '(direct)'
      if (visit.referrer) {
        try { source = new URL(visit.referrer).hostname.replace(/^www\./, '') }
        catch { source = visit.referrer }
      }
      byReferrer[source] = (byReferrer[source] || 0) + 1
    })

    return {
      total: filteredVisits.length, today: todayCount, thisWeek: weekCount,
      byPath, byEventType, byReferrer,
      gamesCompleted, soloCompleted, couplesCompleted, soloShared, couplesShared,
    }
  }, [filteredVisits])

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...S.card, width: '100%', maxWidth: '380px', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Admin</div>
            <div style={{ ...S.muted, marginTop: '2px' }}>Sign in to view analytics</div>
          </div>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoFocus
              style={{ display: 'block', width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.75rem', outline: 'none', boxSizing: 'border-box' }}
            />
            <button
              type="submit"
              style={{ width: '100%', padding: '0.625rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            style={{ display: 'block', width: '100%', marginTop: '0.75rem', padding: '0.625rem', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}
          >
            ← Back to site
          </button>
        </div>
      </div>
    )
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <div style={S.container}>

        {/* Header */}
        <div style={{ ...S.row, marginBottom: '1.75rem' }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Analytics</div>
            <div style={{ ...S.muted, marginTop: '2px' }}>lovestruck-again</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchVisits}
              disabled={loading}
              style={{ padding: '0.5rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            >
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '0.5rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}
            >
              ← Site
            </button>
          </div>
        </div>

        {/* Period tabs */}
        <div style={{ display: 'flex', gap: '0', marginBottom: '1.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '5px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: period === value ? 600 : 400,
                background: period === value ? '#111827' : 'transparent',
                color: period === value ? '#fff' : '#6b7280',
                transition: 'all 0.12s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary stats — 4 cols */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <StatCard label="Total Events" value={stats.total} />
          <StatCard label="Today" value={stats.today} />
          <StatCard label="This Week" value={stats.thisWeek} />
          <StatCard label="Unique Pages" value={Object.keys(stats.byPath).length} />
        </div>

        {/* Game stats — 5 cols with colour accents */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard label="Games Completed" value={stats.gamesCompleted} accent="#16a34a" />
          <StatCard label="Solo Completed"   value={stats.soloCompleted}   accent="#2563eb" />
          <StatCard label="Couples Completed" value={stats.couplesCompleted} accent="#9333ea" />
          <StatCard label="Solo Shares"      value={stats.soloShared}      accent="#dc2626" />
          <StatCard label="Couples Shares"   value={stats.couplesShared}   accent="#d97706" />
        </div>

        {/* Three breakdown panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>

          <div style={S.card}>
            <div style={S.sectionTitle}>Events by Type</div>
            {Object.entries(stats.byEventType).length === 0
              ? <div style={S.muted}>No events in this period</div>
              : Object.entries(stats.byEventType).sort((a, b) => b[1] - a[1]).map(([et, count]) => (
                  <BarRow key={et} label={et} count={count} total={stats.total} fill="#111827" />
                ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Visits by Page</div>
            {Object.entries(stats.byPath).length === 0
              ? <div style={S.muted}>No visits in this period</div>
              : Object.entries(stats.byPath).sort((a, b) => b[1] - a[1]).map(([path, count]) => (
                  <BarRow key={path} label={path} count={count} total={stats.total} fill="#2563eb" />
                ))}
          </div>

          <div style={S.card}>
            <div style={S.sectionTitle}>Traffic Sources</div>
            {Object.entries(stats.byReferrer).length === 0
              ? <div style={S.muted}>No data in this period</div>
              : Object.entries(stats.byReferrer).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
                  <BarRow key={src} label={src} count={count} total={stats.total} fill="#16a34a" />
                ))}
          </div>
        </div>

        {/* Recent events table */}
        <div style={S.card}>
          <div style={{ ...S.row, marginBottom: '1rem' }}>
            <div style={S.sectionTitle}>Recent Events</div>
            <div style={S.muted}>{filteredVisits.length} in period</div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                  {['Time', 'Event', 'Path', 'Metadata', 'Referrer'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', ...S.label, paddingBottom: '0.625rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVisits.slice(0, 200).map((visit, i) => (
                  <tr
                    key={visit.id}
                    style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '2px 7px', borderRadius: '4px',
                        fontSize: '0.72rem', fontWeight: 600,
                        background: eventBadge(visit.event_type).bg,
                        color: eventBadge(visit.event_type).color,
                        whiteSpace: 'nowrap',
                      }}>
                        {visit.event_type || 'page_visit'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: '#374151' }}>
                      {visit.path}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.metadata && Object.keys(visit.metadata).length > 0
                        ? Object.entries(visit.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
                        : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#9ca3af', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.referrer || <span style={{ color: '#d1d5db' }}>(direct)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisits.length > 200 && (
              <div style={{ textAlign: 'center', padding: '1rem', ...S.muted }}>
                Showing 200 of {filteredVisits.length} events
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
