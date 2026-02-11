import { useNavigate } from 'react-router-dom'

export default function Privacy() {
  const navigate = useNavigate()

  return (
    <div className="page page--centered gradient-love" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1.5rem' }}>
      <div style={{ maxWidth: '560px', width: '100%', background: 'rgba(255,255,255,0.92)', borderRadius: '16px', padding: '2.5rem', position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#1a1a1a' }}>Privacy</h1>
        <p style={{ color: '#555', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Last updated: February 2026</p>

        <p style={{ color: '#333', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          Letters created on Lovestruck are stored locally on your device. No one — including us — can read your letters. Only the person you share the letter code or link with can open it.
        </p>
        <p style={{ color: '#333', lineHeight: 1.7, marginBottom: '1.25rem' }}>
          We do not collect, store, or share any letter content. We do not require an account, email address, or any personal information to use this feature.
        </p>
        <p style={{ color: '#333', lineHeight: 1.7, marginBottom: '2rem' }}>
          Anonymous analytics (page views, quiz completions) are collected to help us improve the experience. This data contains no personally identifiable information.
        </p>

        <button
          onClick={() => navigate(-1)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', fontSize: '0.875rem', textDecoration: 'underline', padding: 0 }}
        >
          ← Go back
        </button>
      </div>
      <div className="highlight-glow" />
    </div>
  )
}
