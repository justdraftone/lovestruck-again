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

function getPeriodStart(period: Period): Date | null {
  const now = new Date()
  if (period === 'today') return new Date(now.getFullYear(), now.getMonth(), now.getDate())
  if (period === '7d') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  if (period === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  if (period === '90d') return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
  return null
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
    } catch (error) {
      console.error('Failed to fetch visits:', error)
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

  // Filter visits by selected period
  const filteredVisits = useMemo(() => {
    const start = getPeriodStart(period)
    if (!start) return allVisits
    return allVisits.filter(v => new Date(v.created_at) >= start)
  }, [allVisits, period])

  // Compute stats from filtered visits
  const stats = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const byPath: Record<string, number> = {}
    const byEventType: Record<string, number> = {}
    let todayCount = 0
    let weekCount = 0
    let gamesCompleted = 0
    let soloCompleted = 0
    let couplesCompleted = 0
    let soloShared = 0
    let couplesShared = 0

    filteredVisits.forEach((visit) => {
      const visitDate = new Date(visit.created_at)
      byPath[visit.path] = (byPath[visit.path] || 0) + 1
      const eventType = visit.event_type || 'page_visit'
      byEventType[eventType] = (byEventType[eventType] || 0) + 1
      if (visitDate >= todayStart) todayCount++
      if (visitDate >= weekStart) weekCount++

      if (eventType === 'quiz_complete') {
        gamesCompleted++
        const mode = (visit.metadata?.mode as string) || ''
        if (mode === 'solo') soloCompleted++
        else if (mode.startsWith('couples')) couplesCompleted++
      }
      if (eventType === 'share_click') {
        const type = (visit.metadata?.type as string) || ''
        if (type === 'solo_result') soloShared++
        else if (type === 'couples_result') couplesShared++
      }
    })

    // Traffic sources: group by referrer domain
    const byReferrer: Record<string, number> = {}
    filteredVisits.forEach((visit) => {
      let source = '(direct)'
      if (visit.referrer) {
        try {
          const url = new URL(visit.referrer)
          source = url.hostname.replace(/^www\./, '')
        } catch {
          source = visit.referrer
        }
      }
      byReferrer[source] = (byReferrer[source] || 0) + 1
    })

    return { total: filteredVisits.length, today: todayCount, thisWeek: weekCount, byPath, byEventType, byReferrer, gamesCompleted, soloCompleted, couplesCompleted, soloShared, couplesShared }
  }, [filteredVisits])

  if (!isAuthenticated) {
    return (
      <div className="page page--centered gradient-love" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxWidth: '400px', width: '100%' }}>
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', color: '#333' }}>Admin Dashboard</h1>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              style={{ width: '100%', padding: '0.75rem', marginBottom: '1rem', border: '2px solid #e0e0e0', borderRadius: '8px', fontSize: '1rem' }}
              autoFocus
            />
            <button
              type="submit"
              style={{ width: '100%', padding: '0.75rem', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Login
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            style={{ width: '100%', padding: '0.75rem', marginTop: '1rem', background: 'transparent', color: '#666', border: '1px solid #e0e0e0', borderRadius: '8px', fontSize: '0.9rem', cursor: 'pointer' }}
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page gradient-love" style={{ minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h1 style={{ color: 'white', fontSize: '2rem' }}>Admin Dashboard</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={fetchVisits}
              disabled={loading}
              style={{ padding: '0.5rem 1rem', background: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid white', borderRadius: '8px', cursor: 'pointer' }}
            >
              Home
            </button>
          </div>
        </div>

        {/* Period Selector */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {PERIODS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setPeriod(value)}
              style={{
                padding: '0.5rem 1.25rem',
                borderRadius: '20px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: period === value ? 'bold' : 'normal',
                background: period === value ? 'white' : 'rgba(255,255,255,0.3)',
                color: period === value ? '#333' : 'white',
                fontSize: '0.9rem',
                transition: 'all 0.15s',
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Summary Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          {[
            { label: 'Total Events', value: stats.total },
            { label: 'Today', value: stats.today },
            { label: 'This Week', value: stats.thisWeek },
            { label: 'Unique Pages', value: Object.keys(stats.byPath).length },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Game Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Games Completed', value: stats.gamesCompleted, color: '#27ae60' },
            { label: 'Solo Completed', value: stats.soloCompleted, color: '#3498db' },
            { label: 'Couples Completed', value: stats.couplesCompleted, color: '#9b59b6' },
            { label: 'Solo Shares', value: stats.soloShared, color: '#e74c3c' },
            { label: 'Couples Shares', value: stats.couplesShared, color: '#e67e22' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderTop: `3px solid ${color}` }}>
              <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Events by Type + Visits by Page + Traffic Sources */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Events by Type</h2>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {Object.entries(stats.byEventType).length === 0
                ? <p style={{ color: '#999', fontSize: '0.875rem' }}>No events in this period</p>
                : Object.entries(stats.byEventType)
                    .sort((a, b) => b[1] - a[1])
                    .map(([eventType, count]) => {
                      const pct = Math.round((count / stats.total) * 100)
                      return (
                        <div key={eventType}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#333', fontFamily: 'monospace', fontSize: '0.85rem' }}>{eventType}</span>
                            <span style={{ fontWeight: 'bold', color: '#666', fontSize: '0.85rem' }}>{count} <span style={{ color: '#aaa', fontWeight: 'normal' }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '2px' }} />
                          </div>
                        </div>
                      )
                    })}
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Visits by Page</h2>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {Object.entries(stats.byPath).length === 0
                ? <p style={{ color: '#999', fontSize: '0.875rem' }}>No visits in this period</p>
                : Object.entries(stats.byPath)
                    .sort((a, b) => b[1] - a[1])
                    .map(([path, count]) => {
                      const pct = Math.round((count / stats.total) * 100)
                      return (
                        <div key={path}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#333', fontFamily: 'monospace', fontSize: '0.85rem' }}>{path}</span>
                            <span style={{ fontWeight: 'bold', color: '#666', fontSize: '0.85rem' }}>{count} <span style={{ color: '#aaa', fontWeight: 'normal' }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #f093fb, #f5576c)', borderRadius: '2px' }} />
                          </div>
                        </div>
                      )
                    })}
            </div>
          </div>

          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>Traffic Sources</h2>
            <div style={{ display: 'grid', gap: '0.4rem' }}>
              {Object.entries(stats.byReferrer).length === 0
                ? <p style={{ color: '#999', fontSize: '0.875rem' }}>No data in this period</p>
                : Object.entries(stats.byReferrer)
                    .sort((a, b) => b[1] - a[1])
                    .map(([source, count]) => {
                      const pct = Math.round((count / stats.total) * 100)
                      return (
                        <div key={source}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                            <span style={{ color: '#333', fontSize: '0.85rem' }}>{source}</span>
                            <span style={{ fontWeight: 'bold', color: '#666', fontSize: '0.85rem' }}>{count} <span style={{ color: '#aaa', fontWeight: 'normal' }}>({pct}%)</span></span>
                          </div>
                          <div style={{ height: '4px', background: '#f0f0f0', borderRadius: '2px' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #43e97b, #38f9d7)', borderRadius: '2px' }} />
                          </div>
                        </div>
                      )
                    })}
            </div>
          </div>
        </div>

        {/* Recent Events Table */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: '#333' }}>
            Recent Events <span style={{ color: '#aaa', fontWeight: 'normal', fontSize: '0.9rem' }}>({filteredVisits.length} in period)</span>
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#666', whiteSpace: 'nowrap' }}>Time</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#666', whiteSpace: 'nowrap' }}>Event</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#666', whiteSpace: 'nowrap' }}>Path</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#666', whiteSpace: 'nowrap' }}>Metadata</th>
                  <th style={{ padding: '0.6rem 0.75rem', textAlign: 'left', color: '#666', whiteSpace: 'nowrap' }}>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {filteredVisits.slice(0, 200).map((visit) => (
                  <tr key={visit.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#666', whiteSpace: 'nowrap', fontSize: '0.8rem' }}>
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        background: eventTypeColor(visit.event_type).bg,
                        color: eventTypeColor(visit.event_type).text,
                        whiteSpace: 'nowrap',
                      }}>
                        {visit.event_type || 'page_visit'}
                      </span>
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#333', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {visit.path}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#666', fontSize: '0.78rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.metadata && Object.keys(visit.metadata).length > 0
                        ? Object.entries(visit.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')
                        : '—'}
                    </td>
                    <td style={{ padding: '0.6rem 0.75rem', color: '#999', fontSize: '0.78rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.referrer || '(direct)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredVisits.length > 200 && (
              <p style={{ textAlign: 'center', color: '#aaa', marginTop: '1rem', fontSize: '0.875rem' }}>
                Showing 200 of {filteredVisits.length} events
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function eventTypeColor(type: string): { bg: string; text: string } {
  const map: Record<string, { bg: string; text: string }> = {
    page_visit:    { bg: '#e8f4fd', text: '#1a73e8' },
    quiz_start:    { bg: '#fef3e2', text: '#e67e22' },
    quiz_complete: { bg: '#e8f8f0', text: '#27ae60' },
    letter_create: { bg: '#fdf0f8', text: '#9b59b6' },
    letter_send:   { bg: '#f0f0fd', text: '#5856d6' },
    letter_open:   { bg: '#e8fdf5', text: '#1abc9c' },
    share_click:   { bg: '#fdecea', text: '#e74c3c' },
    download_click:{ bg: '#fef9e7', text: '#f39c12' },
  }
  return map[type] ?? { bg: '#f0f0f0', text: '#666' }
}
