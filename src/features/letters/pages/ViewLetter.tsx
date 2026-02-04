import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';

type ViewState = 'front' | 'back' | 'opening' | 'open';

export default function ViewLetter() {
  const navigate = useNavigate();
  const { letterId } = useParams<{ letterId: string }>();
  const { getLetter, setCurrentLetter } = useLetterStore();
  const [viewState, setViewState] = useState<ViewState>('front');
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

  const handleFlip = () => {
    if (viewState === 'front') {
      setViewState('back');
    }
  };

  const handleOpen = () => {
    if (viewState === 'back') {
      setViewState('opening');
      setTimeout(() => {
        setViewState('open');
      }, 600);
    }
  };

  if (!letter) {
    return null;
  }

  return (
    <div className="page page--centered gradient-love">

        <div className="letter-view__header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" />
          <button
            onClick={() => navigate('/letters/create')}
            className="btn btn--primary btn-homepage"
          >
            Write a letter
          </button>
        </div>
      <div className="letter-view">


        <div className="letter-view__content">
          {viewState === 'front' && (
            <div className="envelope envelope--front" onClick={handleFlip}>
              <div className="envelope__label">
                <span className="envelope__to">To:</span>
                <span className="envelope__name">{letter.recipientName}</span>
              </div>
              <p className="envelope__hint">Click to Flip</p>
            </div>
          )}

          {viewState === 'back' && (
            <div className="envelope envelope--back" onClick={handleOpen}>
              <div className="envelope__flap"></div>
              <p className="envelope__hint">Click to Open</p>
            </div>
          )}

          {viewState === 'opening' && (
            <div className="envelope envelope--opening">
              <div className="envelope__flap envelope__flap--opening"></div>
              <div className="letter-paper letter-paper--emerging"></div>
            </div>
          )}

          {viewState === 'open' && (
            <div className="letter-content">
              <div className="letter-paper letter-paper--open">
                <h2 className="letter-paper__greeting">Dear {letter.recipientName},</h2>
                <p className="letter-paper__content">{letter.content}</p>
                {letter.image && (
                  <div className="letter-paper__image">
                    <img src={letter.image} alt="Attached" />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {viewState === 'open' && (
          <div className="letter-view__actions">
            {/* <button
              onClick={() => navigate('/letters/create')}
              className="btn btn--primary btn-homepage"
            >
              Write a Reply
            </button> */}
          </div>
        )}

        <div className="letter-view__decoration letter-view__decoration--left">
          <img src="/assets/illos/polaroid.svg" alt="" />
        </div>
        <div className="letter-view__decoration letter-view__decoration--right">
          <img src="/assets/illos/letters-floating-img.svg" alt="" />
        </div>
      </div>
      <div className="highlight-glow"></div>
    </div>
  );
}
