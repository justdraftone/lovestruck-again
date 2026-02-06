import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';

export default function SendLetter() {
  const navigate = useNavigate();
  const { letterId } = useParams<{ letterId: string }>();
  const { getLetter } = useLetterStore();
  const [letter, setLetter] = useState<ReturnType<typeof getLetter>>(null);
  const letterLink = letterId ? `${window.location.origin}/letters/view/${letterId}` : '';

  useEffect(() => {
    if (!letterId) {
      navigate('/letters');
      return;
    }
    const foundLetter = getLetter(letterId);
    if (!foundLetter) {
      navigate('/letters');
    } else {
      setLetter(foundLetter);
    }
  }, [letterId, getLetter, navigate]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(letterLink);
    alert('Link copied to clipboard!');
  };

  const handleCopyCode = () => {
    if (letterId) {
      navigator.clipboard.writeText(letterId);
      alert('Letter code copied to clipboard!');
    }
  };

  if (!letter) {
    return null;
  }

  return (
    <div className="page page--centered gradient-love">
      <div className="letter-sent">
        <div className="letter-send__header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" />
        </div>

        <div className="letter-sent__card">
          <div className="letter-sent__icon">
            <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="letter-sent__title">Letter Created!</h2>
          <p className="letter-sent__subtitle">Share this with your loved one</p>

          <div className="letter-sent__code-section">
            <p className="letter-sent__code-label">Letter Code:</p>
            <div className="letter-sent__code-box">
              <span className="letter-sent__code">{letterId}</span>
              <button onClick={handleCopyCode} className="letter-sent__copy-btn" aria-label="Copy code">
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          <p className="letter-sent__or">OR</p>

          <div className="letter-sent__link-box">
            <input
              type="text"
              value={letterLink}
              readOnly
              className="input letter-sent__link-input"
            />
          </div>

          <div className="letter-sent__actions">
            <button onClick={handleCopyLink} className="btn btn--primary btn-homepage">
              Copy Link
            </button>
            <button
              onClick={() => navigate('/letters')}
              className="btn btn--primary btn-homepage"
            >
              Create Another Letter
            </button>
          </div>
        </div>
      </div>
      <div className="highlight-glow"></div>
    </div>
  );
}
