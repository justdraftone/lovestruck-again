import { Link } from 'react-router-dom'
import { useSeo } from '../hooks/useSeo'

/**
 * Catch-all route. A CSR SPA behind a rewrite can't return a real 404 status,
 * so every mistyped URL used to render nothing with an HTTP 200 — which Google
 * classifies as a soft 404. Rendering a real page with `noindex` gets those
 * URLs dropped from the index cleanly.
 */
export default function NotFound() {
  useSeo({
    title: 'Page Not Found — Love Struck Again',
    description: 'That page does not exist. Head back to Love Struck Again and find your dating persona.',
    noindex: true,
  })

  return (
    <div className="page page--centered gradient-love" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '460px', width: '100%', background: 'rgba(255,255,255,0.92)', borderRadius: '16px', padding: '2.5rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: '#1a1a1a' }}>Page not found</h1>
        <p style={{ color: '#333', lineHeight: 1.7, marginBottom: '2rem' }}>
          We couldn't find that page. It may have moved, or the link might be incomplete.
        </p>
        <Link to="/" className="btn btn--primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', width: 'auto', padding: '14px 28px' }}>
          Back to the quiz
        </Link>
      </div>
      <div className="highlight-glow" />
    </div>
  )
}
