import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

interface Visit {
  id: string
  path: string
  event_type: string
  metadata: Record<string, any>
  referrer: string | null
  user_agent: string
  created_at: string
}

interface VisitStats {
  total: number
  today: number
  thisWeek: number
  byPath: Record<string, number>
  byEventType: Record<string, number>
}

export default function Admin() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [visits, setVisits] = useState<Visit[]>([])
  const [stats, setStats] = useState<VisitStats>({
    total: 0,
    today: 0,
    thisWeek: 0,
    byPath: {},
    byEventType: {},
  })
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
        .limit(100)

      if (error) throw error

      setVisits(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Failed to fetch visits:', error)
      alert('Failed to fetch visit data')
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (visitData: Visit[]) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

    const byPath: Record<string, number> = {}
    const byEventType: Record<string, number> = {}
    let todayCount = 0
    let weekCount = 0

    visitData.forEach((visit) => {
      const visitDate = new Date(visit.created_at)

      // Count by path
      byPath[visit.path] = (byPath[visit.path] || 0) + 1

      // Count by event type
      const eventType = visit.event_type || 'page_visit'
      byEventType[eventType] = (byEventType[eventType] || 0) + 1

      // Count today
      if (visitDate >= today) todayCount++

      // Count this week
      if (visitDate >= weekAgo) weekCount++
    })

    setStats({
      total: visitData.length,
      today: todayCount,
      thisWeek: weekCount,
      byPath,
      byEventType,
    })
  }

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchVisits, 30000) // Refresh every 30s
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

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
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '1rem',
              }}
              autoFocus
            />
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Login
            </button>
          </form>
          <button
            onClick={() => navigate('/')}
            style={{
              width: '100%',
              padding: '0.75rem',
              marginTop: '1rem',
              background: 'transparent',
              color: '#666',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: 'white', fontSize: '2rem' }}>Admin Dashboard</h1>
          <div>
            <button
              onClick={fetchVisits}
              disabled={loading}
              style={{
                padding: '0.5rem 1rem',
                marginRight: '1rem',
                background: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '0.5rem 1rem',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: '1px solid white',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              Home
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Total Visits</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{stats.total}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>Today</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{stats.today}</div>
          </div>
          <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '0.875rem', color: '#666', marginBottom: '0.5rem' }}>This Week</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#333' }}>{stats.thisWeek}</div>
          </div>
        </div>

        {/* Events by Type */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#333' }}>Events by Type</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {Object.entries(stats.byEventType)
              .sort((a, b) => b[1] - a[1])
              .map(([eventType, count]) => (
                <div key={eventType} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px' }}>
                  <span style={{ color: '#333', fontFamily: 'monospace' }}>{eventType}</span>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Visits by Path */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#333' }}>Visits by Page</h2>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            {Object.entries(stats.byPath)
              .sort((a, b) => b[1] - a[1])
              .map(([path, count]) => (
                <div key={path} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', background: '#f9f9f9', borderRadius: '4px' }}>
                  <span style={{ color: '#333', fontFamily: 'monospace' }}>{path}</span>
                  <span style={{ fontWeight: 'bold', color: '#666' }}>{count}</span>
                </div>
              ))}
          </div>
        </div>

        {/* Recent Visits */}
        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1.25rem', color: '#333' }}>Recent Events (Last 100)</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Time</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Event Type</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Path</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left', color: '#666' }}>Referrer</th>
                </tr>
              </thead>
              <tbody>
                {visits.map((visit) => (
                  <tr key={visit.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '0.75rem', color: '#333' }}>
                      {new Date(visit.created_at).toLocaleString()}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#333', fontFamily: 'monospace' }}>
                      {visit.event_type || 'page_visit'}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#333', fontFamily: 'monospace' }}>
                      {visit.path}
                    </td>
                    <td style={{ padding: '0.75rem', color: '#666', fontSize: '0.8rem', maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {visit.referrer || '(direct)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
