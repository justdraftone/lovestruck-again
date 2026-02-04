import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';

export default function SendLetter() {
  const navigate = useNavigate();
  const { letterId } = useParams<{ letterId: string }>();
  const { getLetter, setRecipientName } = useLetterStore();
  const [recipientName, setRecipientNameLocal] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [letterLink, setLetterLink] = useState('');

  useEffect(() => {
    if (!letterId) {
      navigate('/letters');
      return;
    }
    const letter = getLetter(letterId);
    if (!letter) {
      navigate('/letters');
    }
  }, [letterId, getLetter, navigate]);

  const handleSend = () => {
    if (!recipientName.trim() || !letterId) return;
    setRecipientName(letterId, recipientName.trim());
    const link = `${window.location.origin}/letters/view/${letterId}`;
    setLetterLink(link);
    setIsSent(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(letterLink);
    alert('Link copied to clipboard!');
  };

  if (isSent) {
    return (
      <div className="page page--centered gradient-love">
        <div className="letter-sent">

          <div className="letter-send__header">
            <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" />
          </div>

          <div className="letter-sent__card">
            <div className="letter-sent__icon">
              <svg width="64" height="64" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="letter-sent__title">Letter Created!</h2>
            <p className="letter-sent__subtitle">Share this link with {recipientName}</p>

            <div className="letter-sent__link-box">
              <input
                type="text"
                value={letterLink}
                readOnly
                className="input letter-sent__link-input"
              />
            </div>

            <div className="letter-sent__actions">
              {/* <button onClick={_handleShare} className="btn btn--primary btn-homepage">
                Share Link
              </button> */}
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

  return (
    <div className="page page--centered gradient-love">
      <div className="letter-send">
        <div className="letter-send__header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" />
        </div>

        <div className="letter-send__card">
          <div className="letter-send__content">
            <label className="letter-send__label">To:</label>
            <input
              type="text"
              className="input letter-send__input"
              placeholder="Recipient Name"
              value={recipientName}
              onChange={(e) => setRecipientNameLocal(e.target.value)}
              autoFocus
            />
          </div>

        </div>
        
          <button
            onClick={handleSend}
            className="btn btn--primary btn-homepage letter-send__btn"
            disabled={!recipientName.trim()}
          >
            Send
          </button>
      </div>
      <div className="highlight-glow"></div>
    </div>
  );
}
