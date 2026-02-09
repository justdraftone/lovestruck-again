import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';
import Envelope from '../components/Envelope';

export default function ViewLetter() {
  const navigate = useNavigate();
  const { letterId } = useParams<{ letterId: string }>();
  const { getLetter, setCurrentLetter } = useLetterStore();
  const [showActions, setShowActions] = useState(false);
  const [letter, setLetter] = useState<ReturnType<typeof getLetter>>(null);

  useEffect(() => {
    if (!letterId) {
      navigate('/letters');
      return;
    }
    const foundLetter = getLetter(letterId);
    if (!foundLetter) {
      navigate('/letters/open');
      return;
    }
    setLetter(foundLetter);
    setCurrentLetter(foundLetter);
  }, [letterId, getLetter, navigate, setCurrentLetter]);

  const handleAnimationComplete = () => {
    setShowActions(true);
  };

  if (!letter) {
    return null;
  }

  return (
    <div className="page page--centered gradient-love">
      <div className="letter-view__header">
        <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
      </div>

      <div className="letter-view">
        <div className="letter-view__content">
          <Envelope
            recipientName={letter.recipientName}
            content={letter.content}
            senderName={letter.senderName}
            imageData={letter.image}
            onAnimationComplete={handleAnimationComplete}
          />
        </div>

        {showActions && (
          <div className="letter-view__actions">
            <button
              onClick={() => navigate('/letters/create')}
              className="btn btn--primary btn-homepage"
            >
              Write a letter
            </button>
          </div>
        )}
      </div>

      <div className="highlight-glow"></div>
    </div>
  );
}
