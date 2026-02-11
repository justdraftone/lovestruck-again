import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';
import { trackEvent } from '../../../lib/analytics';

export default function OpenLetter() {
  const navigate = useNavigate();
  const { getLetter } = useLetterStore();
  const [letterIdOrLink, setLetterIdOrLink] = useState('');
  const [error, setError] = useState('');

  const extractLetterId = (input: string): string => {
    // Try to extract ID from a link
    const linkMatch = input.match(/\/letters\/view\/([A-Z0-9]{6})/i);
    if (linkMatch) {
      return linkMatch[1].toUpperCase();
    }
    // Otherwise treat as direct ID
    return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const handleOpenNow = () => {
    const letterId = extractLetterId(letterIdOrLink);
    if (letterId.length !== 6) {
      setError('Please enter a valid 6-character letter ID');
      return;
    }

    const letter = getLetter(letterId);
    if (!letter) {
      setError('Letter not found. Please check the ID and try again.');
      return;
    }

    trackEvent('letter_open', { metadata: { letterId } });
    navigate(`/letters/view/${letterId}`);
  };

  return (
    <div className="page page--centered gradient-love">
      <div className="letter-open">
        <div className="letter-send__header" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" />
        </div>

        <div className="letter-open__card">
          <div className="letter-open__content">
            <h2 className="letter-open__title">Enter the Letter ID or<br />Paste the link</h2>

            <input
              type="text"
              className="input letter-open__input"
              placeholder="Letter ID or Link"
              value={letterIdOrLink}
              onChange={(e) => {
                setLetterIdOrLink(e.target.value);
                setError('');
              }}
              autoFocus
            />

            {error && <p className="letter-open__error">{error}</p>}

            <button
              onClick={handleOpenNow}
              className="btn btn--primary btn-homepage letter-open__btn"
              disabled={!letterIdOrLink.trim()}
            >
              Open Now
            </button>
          </div>
        </div>
      </div>
      <div className="highlight-glow"></div>
    </div>
  );
}
