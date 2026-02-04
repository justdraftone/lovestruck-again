import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { questions } from '../data/questions';
import { useSwipe } from '../hooks/useSwipe';

export default function CouplesQuizLocal() {
  const navigate = useNavigate();
  const {
    currentQuestion,
    currentPartner,
    partner1Name,
    partner2Name,
    setPartnerNames,
    addAnswer,
    nextQuestion,
    switchPartner,
    setMode
  } = useQuizStore();

  const [namesSet, setNamesSet] = useState(false);
  const [tempPartner1, setTempPartner1] = useState('');
  const [tempPartner2, setTempPartner2] = useState('');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [showExplainer, setShowExplainer] = useState(() => {
    const hasSeenExplainer = localStorage.getItem('hasSeenExplainer');
    return !hasSeenExplainer;
  });
  const [isExplainerExiting, setIsExplainerExiting] = useState(false);

  useEffect(() => {
    setMode('couples-local');
  }, [setMode]);

  const handleSetNames = () => {
    if (tempPartner1.trim() && tempPartner2.trim()) {
      setPartnerNames(tempPartner1.trim(), tempPartner2.trim());
      setNamesSet(true);
    }
  };

  const processSwipe = (direction: 'left' | 'right') => {
    if (swipeDirection) return;
    setIsSwiping(direction);
    setTimeout(() => {
      setSwipeDirection(direction);
      setIsSwiping(null);
    }, 150);
    // Wait for card to fully disappear (150ms delay + 350ms CSS transition)
    setTimeout(() => {
      addAnswer(currentQuestion, direction);
      if (currentQuestion + 1 >= questions.length) {
        navigate('/results/couples-local');
      } else {
        nextQuestion();
        switchPartner();
        setSwipeDirection(null);
        setIsEntering(true);
        setTimeout(() => setIsEntering(false), 250);
      }
    }, 500);
  };

  const handleSwipeLeft = () => processSwipe('left');
  const handleSwipeRight = () => processSwipe('right');

  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  if (!namesSet) {
    return (
      <div className="page page--centered gradient-love">
      
      <div className="header__couples-form">
        <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" />
      </div>

        <div className="card mode-card mode-card__couples-names mode-card__couples-names-form">
          <h2 className="title title--md">Who's Playing?</h2>
          {/* <p className="text-center mb-6" style={{ color: '#4b5563' }}>
            You'll take turns answering each question
          </p> */}

          <div className="form-group">
            <label className="label">Partner A</label>
            <input
              type="text"
              value={tempPartner1}
              onChange={(e) => setTempPartner1(e.target.value)}
              className="input form-group--input"
              placeholder="Your Name"
            />
          </div>

          <div className="form-group">
            <label className="label">Partner B</label>
            <input
              type="text"
              value={tempPartner2}
              onChange={(e) => setTempPartner2(e.target.value)}
              className="input form-group--input"
              placeholder="Partner's Name"
            />
          </div>

          <button onClick={handleSetNames} className="btn btn--primary btn-homepage btn--couples-names">
            Start Quiz Together
          </button>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const currentPartnerName = currentPartner === 1 ? partner1Name : partner2Name;
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const cardVariant = (currentQuestion % 4) + 1;

  const dismissExplainer = () => {
    setIsExplainerExiting(true);
    setTimeout(() => {
      localStorage.setItem('hasSeenExplainer', 'true');
      setShowExplainer(false);
      setIsExplainerExiting(false);
    }, 200);
  };

  const handleSwipeLeftSafe = () => {
    if (showExplainer) return;
    handleSwipeLeft();
  };

  const handleSwipeRightSafe = () => {
    if (showExplainer) return;
    handleSwipeRight();
  };

  return (
    <div className="page gradient-love">
      <div className="header">
        <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" />
      </div>
      
    {/* <div className='couples-quiz-container'> */}
        <p className="header__turn">{currentPartnerName}'{currentPartnerName.charAt(currentPartnerName.length-1) == 's'? '': 's'} Turn!</p>

        <div id="swipe-area" className="swipe-area">
          <button onClick={handleSwipeLeftSafe} className="fab fab--left" aria-label="Dealbreaker">
            <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="card-stack">
            {[...Array(Math.min(3, questions.length - currentQuestion - 1))].map((_, i) => {
              const stackIndex = i + 1;
              return (
                <div
                  key={`stack-${stackIndex}`}
                  className="quiz-card quiz-card--stack"
                  style={{
                    transform: `translateY(${stackIndex * 8}px) scale(${1 - stackIndex * 0.03})`,
                    zIndex: 10 - stackIndex,
                    opacity: 1 - stackIndex * 0.15,
                  }}
                  />
                );
              })}


            <div
              className={`quiz-card quiz-card--variant-${cardVariant} ${
                swipeDirection === 'left' ? 'quiz-card--swipe-left' :
                swipeDirection === 'right' ? 'quiz-card--swipe-right' :
                isSwiping === 'left' ? 'quiz-card--swiping-left' :
                isSwiping === 'right' ? 'quiz-card--swiping-right' : ''
              } ${isEntering ? 'quiz-card--entering' : ''}`}
              style={{ zIndex: 15 }}
            >
              <div className="card-content">
              <div className="emoji-icon">🎵</div>
              <h2 className="question-text">{question.text}</h2>

              <div className="answer-group answer-group--yn">
                <button onClick={handleSwipeLeftSafe} className="answer-btn answer-btn--icon" aria-label="No">
                  <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button onClick={handleSwipeRightSafe} className="answer-btn answer-btn--icon" aria-label="Yes">
                  <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <div className="card-brand">
                <img src="../../public/assets/illos/d1-x-loveorlies-card.svg" alt="" /> 
              </div>
              </div>
            </div>
          </div>
          
          <div className='highlight-glow'></div>

          <button onClick={handleSwipeRightSafe} className="fab fab--right" aria-label="Cool with it">
            <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        <div className="progress">
          <div className="progress__track">
            <div className="progress__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
    {/* </div> */}


      {showExplainer && (
        <div className={`explainer ${isExplainerExiting ? 'explainer--exiting' : ''}`}>
          <div className="explainer__backdrop" onClick={dismissExplainer} />
          <div className="explainer__content">
            <div className="explainer__instruction explainer__instruction--left">
              <div className="explainer__icon-circle">
                <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <div className="explainer__arrow">
                <svg className="icon icon--left" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 3.5c0-1.1.9-2 2-2s2 .9 2 2v8.59l4.79-4.79a2 2 0 012.83 2.83l-7.09 7.08a3 3 0 01-4.24 0L4.5 12.12a2 2 0 012.83-2.83L9.5 11.46V3.5z"/>
                </svg>
              </div>
              <p className="explainer__text">Swipe/Tap red for No.</p>
            </div>

            <div className="explainer__card-preview">
              {[2, 1].map((i) => (
                <div
                  key={`explainer-stack-${i}`}
                  className="quiz-card quiz-card--stack"
                  style={{
                    transform: `translateY(${i * 8}px) scale(${1 - i * 0.03})`,
                    zIndex: 10 - i,
                    opacity: 0.6,
                  }}
                />
              ))}
              <div className="quiz-card" style={{ zIndex: 15, opacity: 0.9 }}>
                <div className="emoji-icon">🎵</div>
                <h2 className="question-text">{question.text}</h2>
                <div className="card-brand">
                  <span className="card-brand__logo">draftone</span>
                  <span className="card-brand__divider">|</span>
                  <span className="card-brand__tagline">Love or Lies</span>
                </div>
              </div>
            </div>

            <div className="explainer__instruction explainer__instruction--right">
              <div className="explainer__icon-circle">
                <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="explainer__arrow">
                <svg className="icon icon--right" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.5 3.5c0-1.1.9-2 2-2s2 .9 2 2v8.59l4.79-4.79a2 2 0 012.83 2.83l-7.09 7.08a3 3 0 01-4.24 0L4.5 12.12a2 2 0 012.83-2.83L9.5 11.46V3.5z"/>
                </svg>
              </div>
              <p className="explainer__text">Swipe/Tap green for Yes.</p>
            </div>

            <button onClick={dismissExplainer} className="explainer__btn btn btn--primary">
              Let's goooo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
