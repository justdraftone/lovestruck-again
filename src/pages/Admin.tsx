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
  user_id: string | null
  country: string | null
  country_code: string | null
  created_at: string
}

interface TimePoint { label: string; events: number; users: Set<string> }

const PERIODS: { label: string; value: Period }[] = [
  { label: 'Today', value: 'today' },
  { label: '7 Days', value: '7d' },
  { label: '30 Days', value: '30d' },
  { label: '3 Months', value: '90d' },
  { label: 'All Time', value: 'all' },
]

const CHART_COLORS = {
  events:     'rgb(37,99,235)',
  users:      'rgb(22,163,74)',
  eventType:  'rgb(37,99,235)',
  page:       'rgb(124,58,237)',
  source:     'rgb(22,163,74)',
  country:    'rgb(234,88,12)',
}

const S = {
  page:         { minHeight: '100vh', background: '#f4f5f7', fontFamily: 'system-ui,-apple-system,sans-serif' },
  container:    { maxWidth: '1200px', margin: '0 auto', padding: '2rem 1.5rem' },
  card:         { background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1.25rem' },
  label:        { fontSize: '0.7rem', fontWeight: 700 as const, letterSpacing: '0.08em', textTransform: 'uppercase' as const, color: '#9ca3af', marginBottom: '0.4rem' },
  sectionTitle: { fontSize: '0.9rem', fontWeight: 600 as const, color: '#374151' },
  row:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  muted:        { color: '#6b7280', fontSize: '0.8rem' },
} as const

// ── Catmull-Rom → cubic bezier ───────────────────────────────────────────────
function catmullRomPath(pts: { x: number; y: number }[], tension = 0.3): string {
  if (pts.length < 2) return ''
  const d: string[] = [`M ${pts[0].x} ${pts[0].y}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[Math.min(i + 2, pts.length - 1)]
    const cp1x = p1.x + (p2.x - p0.x) * tension
    const cp1y = p1.y + (p2.y - p0.y) * tension
    const cp2x = p2.x - (p3.x - p1.x) * tension
    const cp2y = p2.y - (p3.y - p1.y) * tension
    d.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`)
  }
  return d.join(' ')
}

// ── Area chart ───────────────────────────────────────────────────────────────
function AreaChart({ points, color }: { points: number[]; color: string }) {
  if (points.length < 2) return <div style={{ ...S.muted, padding: '1.5rem 0', textAlign: 'center' }}>Not enough data</div>
  const max = Math.max(...points, 1)
  const W = 100, H = 100, PAD = 12
  const step = (W - PAD * 2) / (points.length - 1)
  const pts = points.map((v, i) => ({ x: PAD + i * step, y: H - (v / max) * H * 0.88 - H * 0.06 }))
  const linePath = catmullRomPath(pts, 0.2)
  const last = pts[pts.length - 1]
  const first = pts[0]
  const areaPath = `${linePath} L ${last.x} ${H} L ${first.x} ${H} Z`
  const gradId = `g${color.replace(/[^a-z0-9]/gi, '')}`

  return (
    <div style={{ overflow: 'visible', padding: '0 4px' }}>
      <svg viewBox={`-8 -5 ${W + 16} ${H + 10}`} preserveAspectRatio="none" style={{ width: '100%', height: '200px', display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.30" />
            <stop offset="60%"  stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.00" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

// ── Horizontal bar chart ─────────────────────────────────────────────────────
function HorizChart({ entries, total, color }: { entries: [string, number][]; total: number; color: string }) {
  const max = entries[0]?.[1] ?? 1
  return (
    <div>
      {entries.slice(0, 10).map(([label, count]) => (
        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.6rem' }}>
          <span style={{ fontSize: '0.78rem', color: '#374151', fontFamily: 'monospace', width: '130px', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{label}</span>
          <div style={{ flex: 1, height: '18px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{ width: `${(count / max) * 100}%`, height: '100%', background: color, borderRadius: '3px', opacity: 0.85, transition: 'width 0.4s ease' }} />
          </div>
          <span style={{ fontSize: '0.75rem', color: '#6b7280', width: '58px', textAlign: 'right', flexShrink: 0, whiteSpace: 'nowrap' }}>
            {count} <span style={{ color: '#d1d5db' }}>({total > 0 ? Math.round((count / total) * 100) : 0}%)</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// ── List (bar rows) ──────────────────────────────────────────────────────────
function ListRows({ entries, total, color }: { entries: [string, number][]; total: number; color: string }) {
  return (
    <div>
      {entries.slice(0, 20).map(([label, count]) => {
        const pct = total > 0 ? Math.round((count / total) * 100) : 0
        return (
          <div key={label} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
              <span style={{ fontSize: '0.8rem', color: '#374151', fontFamily: 'monospace' }}>{label}</span>
              <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{count} <span style={{ color: '#d1d5db' }}>({pct}%)</span></span>
            </div>
            <div style={{ height: '3px', background: '#f3f4f6', borderRadius: '99px' }}>
              <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '99px', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Panel card with Chart / List tabs ────────────────────────────────────────
function PanelCard({ title, entries, total, color }: { title: string; entries: [string, number][]; total: number; color: string }) {
  const [view, setView] = useState<'chart' | 'list'>('chart')
  return (
    <div style={S.card}>
      <div style={{ ...S.row, marginBottom: '1rem' }}>
        <div style={S.sectionTitle}>{title}</div>
        <TabToggle value={view} onChange={setView} options={[{ label: 'Chart', value: 'chart' }, { label: 'List', value: 'list' }]} />
      </div>
      {entries.length === 0
        ? <div style={{ ...S.muted, padding: '1rem 0', textAlign: 'center' }}>No data in this period</div>
        : view === 'chart'
          ? <HorizChart entries={entries} total={total} color={color} />
          : <ListRows entries={entries} total={total} color={color} />}
    </div>
  )
}

// ── Reusable pill toggle ─────────────────────────────────────────────────────
function TabToggle<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { label: string; value: T }[] }) {
  return (
    <div style={{ display: 'flex', background: '#f3f4f6', borderRadius: '6px', padding: '2px', gap: '1px' }}>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          style={{ padding: '3px 10px', border: 'none', borderRadius: '5px', fontSize: '0.72rem', cursor: 'pointer', fontWeight: value === o.value ? 600 : 400, background: value === o.value ? '#fff' : 'transparent', color: value === o.value ? '#111827' : '#6b7280', boxShadow: value === o.value ? '0 1px 2px rgba(0,0,0,0.08)' : 'none', transition: 'all 0.1s' }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ── Event badge ───────────────────────────────────────────────────────────────
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

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ ...S.card, borderTop: `2px solid ${accent ?? '#e5e7eb'}` }}>
      <div style={S.label}>{label}</div>
      <div style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, color: accent ?? '#111827', letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  )
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === '7d')  return new Date(now.getTime() - 7  * 86400000)
  if (period === '30d') return new Date(now.getTime() - 30 * 86400000)
  if (period === '90d') return new Date(now.getTime() - 90 * 86400000)
  return null
}

function bucketKey(date: Date, period: Period): string {
  if (period === 'today') {
    return `${String(date.getHours()).padStart(2, '0')}:00`
  }
  if (period === '90d' || period === 'all') {
    // ISO week: Monday-based
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // floor to Monday
    return d.toISOString().split('T')[0]
  }
  return date.toISOString().split('T')[0]
}

function buildTimeSeries(visits: Visit[], period: Period): { label: string; events: number; users: number }[] {
  const map = new Map<string, TimePoint>()

  // Pre-fill buckets so gaps show as zero
  const start = getPeriodStart(period)
  const now = new Date()
  if (start) {
    if (period === 'today') {
      for (let h = 0; h <= now.getHours(); h++) {
        const key = `${String(h).padStart(2, '0')}:00`
        map.set(key, { label: key, events: 0, users: new Set() })
      }
    } else {
      const cursor = new Date(period === '90d' || period === 'all' ? start : start)
      while (cursor <= now) {
        const key = bucketKey(cursor, period)
        if (!map.has(key)) map.set(key, { label: key, events: 0, users: new Set() })
        cursor.setDate(cursor.getDate() + (period === '90d' || period === 'all' ? 7 : 1))
      }
    }
  }

  visits.forEach(v => {
    const d = new Date(v.created_at)
    const key = bucketKey(d, period)
    if (!map.has(key)) map.set(key, { label: key, events: 0, users: new Set() })
    const bucket = map.get(key)!
    bucket.events++
    if (v.user_id) bucket.users.add(v.user_id)
  })

  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => ({ label: v.label, events: v.events, users: v.users.size }))
}

// ════════════════════════════════════════════════════════════════════════════
export default function Admin() {
  const [password, setPassword]       = useState('')
  const [isAuthenticated, setIsAuth]  = useState(false)
  const [allVisits, setAllVisits]     = useState<Visit[]>([])
  const [period, setPeriod]           = useState<Period>('7d')
  const [chartMetric, setChartMetric] = useState<'events' | 'users'>('events')
  const [loading, setLoading]         = useState(false)
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'untttld') { setIsAuth(true); fetchVisits() }
    else alert('Incorrect password')
  }

  const fetchVisits = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase.from('visits').select('*').order('created_at', { ascending: false }).limit(5000)
      if (error) throw error
      setAllVisits(data || [])
    } catch (err) {
      console.error(err)
      alert('Failed to fetch visit data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      const t = setInterval(fetchVisits, 30000)
      return () => clearInterval(t)
    }
  }, [isAuthenticated])

  const filteredVisits = useMemo(() => {
    const start = getPeriodStart(period)
    if (!start) return allVisits
    return allVisits.filter(v => new Date(v.created_at) >= start)
  }, [allVisits, period])

  const timeSeries = useMemo(() => buildTimeSeries(filteredVisits, period), [filteredVisits, period])

  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart  = new Date(now.getTime() - 7 * 86400000)

    const byPath: Record<string, number>     = {}
    const byEventType: Record<string, number> = {}
    const byReferrer: Record<string, number>  = {}
    const byCountry: Record<string, number>   = {}
    let todayCount = 0, weekCount = 0
    let gamesCompleted = 0, soloCompleted = 0, couplesCompleted = 0, soloShared = 0, couplesShared = 0
    let lettersSent = 0

    filteredVisits.forEach(v => {
      const d = new Date(v.created_at)
      byPath[v.path] = (byPath[v.path] || 0) + 1
      const et = v.event_type || 'page_visit'
      byEventType[et] = (byEventType[et] || 0) + 1
      if (d >= todayStart) todayCount++
      if (d >= weekStart)  weekCount++

      if (et === 'quiz_complete') {
        gamesCompleted++
        const mode = (v.metadata?.mode as string) || ''
        if (mode === 'solo') soloCompleted++
        else if (mode.startsWith('couples')) couplesCompleted++
      }
      if (et === 'letter_send') lettersSent++

      if (et === 'share_click') {
        const t = (v.metadata?.type as string) || ''
        if (t === 'solo_result') soloShared++
        else if (t === 'couples_result') couplesShared++
      }

      let src = '(direct)'
      if (v.referrer) { try { src = new URL(v.referrer).hostname.replace(/^www\./, '') } catch { src = v.referrer } }
      byReferrer[src] = (byReferrer[src] || 0) + 1

      const c = v.country || '(unknown)'
      byCountry[c] = (byCountry[c] || 0) + 1
    })

    const uniqueUsers = new Set(filteredVisits.map(v => v.user_id).filter(Boolean)).size

    return { total: filteredVisits.length, today: todayCount, thisWeek: weekCount, uniqueUsers,
             byPath, byEventType, byReferrer, byCountry,
             gamesCompleted, soloCompleted, couplesCompleted, soloShared, couplesShared, lettersSent }
  }, [filteredVisits])

  const sorted = {
    eventType: Object.entries(stats.byEventType).sort((a, b) => b[1] - a[1]),
    path:      Object.entries(stats.byPath).sort((a, b) => b[1] - a[1]),
    referrer:  Object.entries(stats.byReferrer).sort((a, b) => b[1] - a[1]),
    country:   Object.entries(stats.byCountry).sort((a, b) => b[1] - a[1]),
  }

  // ── Login ──
  if (!isAuthenticated) {
    return (
      <div style={{ ...S.page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...S.card, width: '100%', maxWidth: '380px', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>Admin</div>
            <div style={{ ...S.muted, marginTop: '2px' }}>Sign in to view analytics</div>
          </div>
          <form onSubmit={handleLogin}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" autoFocus
              style={{ display: 'block', width: '100%', padding: '0.625rem 0.75rem', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '0.9rem', marginBottom: '0.75rem', outline: 'none', boxSizing: 'border-box' }} />
            <button type="submit" style={{ width: '100%', padding: '0.625rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer' }}>
              Sign in
            </button>
          </form>
          <button onClick={() => navigate('/')} style={{ display: 'block', width: '100%', marginTop: '0.75rem', padding: '0.625rem', background: 'transparent', color: '#6b7280', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
            ← Back to site
          </button>
        </div>
      </div>
    )
  }

  // ── Dashboard ──
  const chartPoints = timeSeries.map(p => chartMetric === 'events' ? p.events : p.users)
  const chartColor  = CHART_COLORS[chartMetric]

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
            <button onClick={fetchVisits} disabled={loading} style={{ padding: '0.5rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              {loading ? 'Loading…' : 'Refresh'}
            </button>
            <button onClick={() => navigate('/')} style={{ padding: '0.5rem 0.875rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 500, color: '#374151', cursor: 'pointer' }}>
              ← Site
            </button>
          </div>
        </div>

        {/* Period selector */}
        <div style={{ display: 'flex', gap: 0, marginBottom: '1.75rem', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '4px', width: 'fit-content' }}>
          {PERIODS.map(({ label, value }) => (
            <button key={value} onClick={() => setPeriod(value)} style={{ padding: '0.375rem 0.875rem', borderRadius: '5px', border: 'none', cursor: 'pointer', fontSize: '0.8rem', fontWeight: period === value ? 600 : 400, background: period === value ? '#111827' : 'transparent', color: period === value ? '#fff' : '#6b7280', transition: 'all 0.12s' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Summary stat cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
          <StatCard label="Total Events"  value={stats.total} />
          <StatCard label="Unique Users"  value={stats.uniqueUsers} />
          <StatCard label="Today"         value={stats.today} />
          <StatCard label="This Week"     value={stats.thisWeek} />
          <StatCard label="Unique Pages"  value={Object.keys(stats.byPath).length} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <StatCard label="Games Completed"   value={stats.gamesCompleted}   accent="#16a34a" />
          <StatCard label="Solo Completed"    value={stats.soloCompleted}    accent="#2563eb" />
          <StatCard label="Couples Completed" value={stats.couplesCompleted} accent="#9333ea" />
          <StatCard label="Solo Shares"       value={stats.soloShared}       accent="#dc2626" />
          <StatCard label="Couples Shares"    value={stats.couplesShared}    accent="#d97706" />
          <StatCard label="Letters Sent"      value={stats.lettersSent}      accent="#c026d3" />
        </div>

        {/* Area chart — full width */}
        <div style={{ ...S.card, marginBottom: '1.5rem' }}>
          <div style={{ ...S.row, marginBottom: '0.25rem' }}>
            <div>
              <div style={S.sectionTitle}>
                {chartMetric === 'events' ? 'Total Events' : 'Unique Users'} over time
              </div>
              <div style={{ ...S.muted, marginTop: '2px' }}>
                {timeSeries.reduce((s, p) => s + (chartMetric === 'events' ? p.events : p.users), 0)} total in period
              </div>
            </div>
            <TabToggle
              value={chartMetric}
              onChange={setChartMetric}
              options={[{ label: 'Events', value: 'events' }, { label: 'Users', value: 'users' }]}
            />
          </div>
          <AreaChart points={chartPoints} color={chartColor} />
          {/* X-axis labels */}
          {timeSeries.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', padding: '0 2px' }}>
              {[timeSeries[0], timeSeries[Math.floor(timeSeries.length / 2)], timeSeries[timeSeries.length - 1]].map((p, i) => (
                <span key={i} style={{ fontSize: '0.68rem', color: '#9ca3af' }}>{p.label}</span>
              ))}
            </div>
          )}
        </div>

        {/* Breakdown panels */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <PanelCard title="Events by Type"  entries={sorted.eventType} total={stats.total} color={CHART_COLORS.eventType} />
          <PanelCard title="Visits by Page"  entries={sorted.path}      total={stats.total} color={CHART_COLORS.page} />
          <PanelCard title="Traffic Sources" entries={sorted.referrer}  total={stats.total} color={CHART_COLORS.source} />
          <PanelCard title="Countries"       entries={sorted.country}   total={stats.total} color={CHART_COLORS.country} />
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
                  {['Time', 'Event', 'Path', 'Country', 'Metadata', 'Referrer'].map(h => (
                    <th key={h} style={{ padding: '0.5rem 0.75rem', textAlign: 'left', ...S.label, paddingBottom: '0.625rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredVisits.slice(0, 200).map((visit, i) => (
                  <tr key={visit.id} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#9ca3af', whiteSpace: 'nowrap' }}>{new Date(visit.created_at).toLocaleString()}</td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      <span style={{ display: 'inline-block', padding: '2px 7px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, background: eventBadge(visit.event_type).bg, color: eventBadge(visit.event_type).color, whiteSpace: 'nowrap' }}>
                        {visit.event_type || 'page_visit'}
                      </span>
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', fontFamily: 'monospace', color: '#374151' }}>{visit.path}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280', whiteSpace: 'nowrap' }}>{visit.country || <span style={{ color: '#d1d5db' }}>—</span>}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#6b7280', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.metadata && Object.keys(visit.metadata).length > 0 ? Object.entries(visit.metadata).map(([k, v]) => `${k}: ${v}`).join(', ') : <span style={{ color: '#d1d5db' }}>—</span>}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#9ca3af', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.referrer || <span style={{ color: '#d1d5db' }}>(direct)</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisits.length > 200 && (
              <div style={{ textAlign: 'center', padding: '1rem', ...S.muted }}>Showing 200 of {filteredVisits.length} events</div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
