import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { questions } from '../data/questions';
import { useSwipe } from '../hooks/useSwipe';

export default function SoloQuiz() {
  const navigate = useNavigate();
  const { currentQuestion, addAnswer, nextQuestion, setMode } = useQuizStore();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [showExplainer, setShowExplainer] = useState(() => {
    const hasSeenExplainer = localStorage.getItem('hasSeenExplainer');
    return !hasSeenExplainer;
  });
  const [isExplainerExiting, setIsExplainerExiting] = useState(false);

  useEffect(() => {
    setMode('solo');
  }, [setMode]);

  const dismissExplainer = () => {
    setIsExplainerExiting(true);
    setTimeout(() => {
      setShowExplainer(false);
      setIsExplainerExiting(false);
    }, 200);
  };

  const processSwipe = (direction: 'left' | 'right') => {
    if (showExplainer || swipeDirection) return;
    setIsSwiping(direction);
    setTimeout(() => {
      setSwipeDirection(direction);
      setIsSwiping(null);
    }, 150);
    // Wait for card to fully disappear (150ms delay + 350ms CSS transition)
    setTimeout(() => {
      addAnswer(currentQuestion, direction);
      if (currentQuestion + 1 >= questions.length) {
        navigate('/results/solo');
      } else {
        nextQuestion();
        setSwipeDirection(null);
        setIsEntering(true);
        setTimeout(() => setIsEntering(false), 250);
      }
    }, 500);
  };

  const handleSwipeLeft = () => processSwipe('left');
  const handleSwipeRight = () => processSwipe('right');

  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const cardVariant = (currentQuestion % 4) + 1;

  return (
    <div className="page gradient-love">
      <div className="header">
        <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" />
      </div>

      <div id="swipe-area" className="swipe-area swipe-area__solo">
        <button onClick={handleSwipeLeft} className="fab fab--left" aria-label="Dealbreaker">
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

            <div className='card-content'>
              <div className="emoji-icon">🎵</div>
              <h2 className="question-text">{question.text}</h2>

              <div className="answer-group answer-group--yn">
                <button onClick={handleSwipeLeft} className="answer-btn answer-btn--icon" aria-label="No">
                  <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button onClick={handleSwipeRight} className="answer-btn answer-btn--icon" aria-label="Yes">
                  <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <div className="card-brand">
                <img src="../../public/assets/illos/d1-x-loveorlies-card.svg" alt="" /> 
              </div>
            </div>

           {/* <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" />  */}
          </div>
        </div>

        <button onClick={handleSwipeRight} className="fab fab--right" aria-label="Cool with it">
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

      <div className='highlight-glow'></div>

      {showExplainer && (
        <div className={`explainer ${isExplainerExiting ? 'explainer--exiting' : ''}`}>
          <div className="explainer__backdrop" onClick={dismissExplainer} />
            <div className="explainer__content">

            <div className='explainer__swipe'>
              <button className="answer-btn answer-btn--icon">
                <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <img src="/assets/icons/swipe-right.svg" alt="swipe right" />
              <p>Swipe/Tap red for No.</p>
            </div>

            <button onClick={dismissExplainer} className="explainer__btn btn btn--primary">
              Let's goooo
            </button>

            <div className='explainer__swipe'>
              <button className="answer-btn answer-btn--icon">
                <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </button>

              <img src="/assets/icons/swipe-left.svg" alt="swipe left" />
              <p>Swipe/Tap green for Yes.</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
