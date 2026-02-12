import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { nigeriaQuestions, globalQuestions, Question } from '../data/questions';
import { useSwipe } from '../hooks/useSwipe';
import { trackEvent } from '../lib/analytics';
import Loader from '../components/Loader';

// Helper function to select random questions
function selectRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export default function SoloQuiz() {
  const navigate = useNavigate();
  const {
    currentQuestion,
    addAnswer,
    nextQuestion,
    setMode,
    questionSet,
    setQuestionSet,
    selectedQuestionIds,
    setSelectedQuestions
  } = useQuizStore();
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | null>(null);
  const [showExplainer, setShowExplainer] = useState(true);
  const [isExplainerExiting, setIsExplainerExiting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Select questions based on question set
  const questions = useMemo(() => {
    const sourceQuestions = questionSet === 'nigeria' ? nigeriaQuestions : globalQuestions;

    // If we already have selected question IDs, use those
    if (selectedQuestionIds.length > 0) {
      return sourceQuestions.filter(q => selectedQuestionIds.includes(q.id));
    }

    // Otherwise, select 14 random questions
    const selected = selectRandomQuestions(sourceQuestions, 14);
    setSelectedQuestions(selected.map(q => q.id));
    return selected;
  }, [questionSet, selectedQuestionIds, setSelectedQuestions]);

  useEffect(() => {
    setMode('solo');
    trackEvent('quiz_start', { metadata: { mode: 'solo' } });
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

    // Add both classes immediately like the original
    setIsSwiping(direction);
    setSwipeDirection(direction);

    // Wait for transition to complete (400ms transform + some buffer)
    setTimeout(() => {
      addAnswer(currentQuestion, direction);
      setIsSwiping(null);

      if (currentQuestion + 1 >= questions.length) {
        // Show loader for 3 seconds before showing results
        setIsCalculating(true);
        setTimeout(() => {
          navigate('/results/solo');
        }, 3000);
      } else {
        nextQuestion();
        setSwipeDirection(null);
      }
    }, 450);
  };

  const handleSwipeLeft = () => processSwipe('left');
  const handleSwipeRight = () => processSwipe('right');

  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Pre-render upcoming cards for deck effect
  const upcomingCards = [0, 1, 2].map(offset => {
    const questionIndex = currentQuestion + offset;
    if (questionIndex >= questions.length) return null;
    return {
      question: questions[questionIndex],
      variant: (questionIndex % 4) + 1,
      isTop: offset === 0
    };
  }).filter(Boolean);

  const handleToggleQuestionSet = () => {
    const newSet = questionSet === 'nigeria' ? 'global' : 'nigeria';
    setQuestionSet(newSet);
    setSelectedQuestions([]); // Clear selected questions to force new selection
    navigate('/'); // Go back to home to restart quiz with new questions
  };

  return (
    <div className="page gradient-love">
      <div className="header header__quiz" style={{ display: isCalculating ? 'none' : 'flex' }}>
        <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        <div className="question-set-toggle">
          <button
            onClick={handleToggleQuestionSet}
            className="btn btn--toggle"
            aria-label="Toggle question set"
          >
            {questionSet === 'nigeria' ? '🇳🇬 Nigeria' : '🌍 Global'}
          </button>
        </div>
      </div>

      <div id="swipe-area" className="swipe-area swipe-area__solo">
        <button onClick={handleSwipeLeft} className="fab fab--left" aria-label="Dealbreaker" style={{ display: isCalculating ? 'none' : 'flex' }}>
          <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="card-stack">
          {upcomingCards.map((card, index) => {
            if (!card) return null;

            return (
              <div
                key={`question-${currentQuestion + index}`}
                className={`quiz-card quiz-card--variant-${card.variant} ${
                  index === 0 && swipeDirection === 'left' ? 'quiz-card--swipe-left' :
                  index === 0 && swipeDirection === 'right' ? 'quiz-card--swipe-right' :
                  index === 0 && isSwiping === 'left' ? 'quiz-card--swiping-left' :
                  index === 0 && isSwiping === 'right' ? 'quiz-card--swiping-right' : ''
                }`}
              >
                <div className='card-content'>
                <div className="emoji-icon">{card.question.emoji}</div>
                <h2 className="question-text">{card.question.text}</h2>

                {index === 0 && (
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
                )}

                <div className="card-brand">
                  <img src="/assets/illos/d1-x-loveorlies-card.svg" alt="" />
                </div>
              </div>
              </div>
            );
          })}
        </div>

        <button onClick={handleSwipeRight} className="fab fab--right" aria-label="Cool with it" style={{ display: isCalculating ? 'none' : 'flex' }}>
          <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </button>
      </div>

      <div className="progress" style={{ display: isCalculating ? 'none' : 'block' }}>
        <div className="progress__track">
          <div className="progress__fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className='highlight-glow'></div>

      {isCalculating && (
        <div className="calculating-overlay">
          <Loader />
        </div>
      )}

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
              <p>Tap X if it's a dealbreaker for you</p>
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
              <p>Tap green if you're cool with it</p>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
