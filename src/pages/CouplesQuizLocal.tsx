import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { nigeriaQuestions, globalQuestions } from '../data/questions';
import { useSwipe } from '../hooks/useSwipe';
import { trackEvent } from '../lib/analytics';
import Loader from '../components/Loader';
// TODO: Uncomment for production
// import { selectQuestionPairs } from '../lib/questionPairing';

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
    setMode,
    questionSet,
    setQuestionSet,
    selectedQuestionIds,
    setSelectedQuestions,
    setQuestionPairing
  } = useQuizStore();

  const [namesSet, setNamesSet] = useState(false);
  const [tempPartner1, setTempPartner1] = useState('');
  const [tempPartner2, setTempPartner2] = useState('');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const [isExplainerExiting, setIsExplainerExiting] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);

  // Select question pairs for compatibility calculation
  const questionPairs = useMemo(() => {
    const sourceQuestions = questionSet === 'nigeria' ? nigeriaQuestions : globalQuestions;

    // TESTING: Use 8 pairs (16 questions total)
    // TODO: Change back to 14 for production
    const PAIR_COUNT = 8; // Change back to 14

    // TESTING: Both partners answer SAME questions for easy testing
    // TODO: Uncomment the line below for production (different questions same type)
    // const { pairs, questionPairing } = selectQuestionPairs(sourceQuestions, PAIR_COUNT);

    // Select random questions
    const shuffled = [...sourceQuestions].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, PAIR_COUNT);

    // Create two different random orderings for each partner
    const partner1Questions = [...selected].sort(() => Math.random() - 0.5);
    const partner2Questions = [...selected].sort(() => Math.random() - 0.5);

    // Create pairs by combining the shuffled orders
    const pairs = partner1Questions.map((q1, index) => ({
      partner1Question: q1,
      partner2Question: partner2Questions[index], // Different order for partner 2
      type: 'same'
    }));

    // Create pairing map (each question maps to itself for compatibility)
    const questionPairing: Record<number, number> = {};
    selected.forEach(q => {
      questionPairing[q.id] = q.id; // Maps to itself
    });

    // Store the question IDs and pairing for results calculation
    const allQuestionIds = pairs.flatMap(p => [p.partner1Question.id, p.partner2Question.id]);
    setSelectedQuestions(allQuestionIds);
    setQuestionPairing(questionPairing);

    console.log('📝 Question pairing setup:', {
      pairCount: pairs.length,
      totalQuestions: allQuestionIds.length,
      pairingMapSize: Object.keys(questionPairing).length,
      samplePairing: Object.entries(questionPairing).slice(0, 4),
      testMode: 'SAME questions for both partners'
    });

    return pairs;
  }, [questionSet, setSelectedQuestions, setQuestionPairing]);

  // Flatten pairs into a continuous stack of questions
  const questions = useMemo(() => {
    return questionPairs.flatMap(pair => [
      pair.partner1Question,
      pair.partner2Question
    ]);
  }, [questionPairs]);

  useEffect(() => {
    setMode('couples-local');
    trackEvent('quiz_start', { metadata: { mode: 'couples-local' } });
  }, [setMode]);

  const handleSetNames = () => {
    if (tempPartner1.trim() && tempPartner2.trim()) {
      setPartnerNames(tempPartner1.trim(), tempPartner2.trim());
      setNamesSet(true);
      setShowExplainer(true); // Show instructions when game starts
    }
  };

  const processSwipe = (direction: 'left' | 'right') => {
    if (swipeDirection || questions.length === 0) return;

    setIsSwiping(direction);
    setSwipeDirection(direction);

    setTimeout(() => {
      // Record answer for current question
      addAnswer(questions[currentQuestion].id, direction);
      setIsSwiping(null);

      if (currentQuestion + 1 >= questions.length) {
        // Show loader before showing results
        setIsCalculating(true);
        setTimeout(() => {
          navigate('/results/couples-local');
        }, 3000);
      } else {
        // Move to next card in the stack
        nextQuestion();
        switchPartner(); // Alternate partners
        setTimeout(() => setSwipeDirection(null), 0);
      }
    }, 450);
  };

  const handleSwipeLeft = () => processSwipe('left');
  const handleSwipeRight = () => processSwipe('right');

  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  const currentPartnerName = currentPartner === 1 ? partner1Name : partner2Name;
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Pre-render upcoming cards for deck effect
  const upcomingCards = useMemo(() => {
    return [0, 1, 2].map(offset => {
      const questionIndex = currentQuestion + offset;
      if (questionIndex >= questions.length) return null;

      return {
        question: questions[questionIndex],
        variant: (questionIndex % 4) + 1,
        isTop: offset === 0
      };
    }).filter(Boolean);
  }, [currentQuestion, questions]);

  if (!namesSet) {
    return (
      <div className="page page--centered gradient-love">

      <div className="header header__couples-quiz header__couples-solo-lobby">
        <button onClick={() => navigate('/couples')} className="back-btn">
          Back
        </button>
        <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
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
      <div className='highlight-glow highlight-glow--results'></div>

      </div>
    );
  }

  const dismissExplainer = () => {
    setIsExplainerExiting(true);
    setTimeout(() => {
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

  const handleToggleQuestionSet = () => {
    const newSet = questionSet === 'nigeria' ? 'global' : 'nigeria';
    setQuestionSet(newSet);
    setSelectedQuestions([]); // Clear selected questions to force new selection
    navigate('/'); // Go back to home to restart quiz with new questions
  };

  return (
    <div className="page gradient-love">
      <div className="header header__couples-quiz-w-toggle" style={{ display: isCalculating ? 'none' : 'flex' }}>
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
        <p className="header__turn">{currentPartnerName}'{currentPartnerName.charAt(currentPartnerName.length-1) == 's'? '': 's'} Turn!</p>
      </div>

    {/* <div className='couples-quiz-container'> */}

        <div id="swipe-area" className="swipe-area">
          <button onClick={handleSwipeLeftSafe} className="fab fab--left" aria-label="Dealbreaker" style={{ display: isCalculating ? 'none' : 'flex' }}>
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
                  <div className="card-content">
                    <div className="emoji-icon">{card.question.emoji}</div>
                    <h2 className="question-text">{card.question.text}</h2>

                    {index === 0 && (
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
                    )}

                    <div className="card-brand">
                      <img src="/assets/illos/d1-x-loveorlies-card.svg" alt="" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <button onClick={handleSwipeRightSafe} className="fab fab--right" aria-label="Cool with it" style={{ display: isCalculating ? 'none' : 'flex' }}>
            <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </button>
        </div>

        <div className="progress card-stack__progress-couples" style={{ display: isCalculating ? 'none' : 'block' }}>
          <div className="progress__track">
            <div className="progress__fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

    {/* </div> */}
      <div className='highlight-glow'></div>

      {isCalculating && (
        <div className="calculating-overlay">
          <Loader />
        </div>
      )}

      {showExplainer && (
        <div className={`explainer ${isExplainerExiting ? 'explainer--exiting' : ''}`}>
          <div className="explainer__backdrop" onClick={dismissExplainer} />
          <div className="explainer__content" style={{ flexDirection: 'column' }}>

            <div className="explainer__turn-block" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <div style={{
                fontSize: '1rem',
                fontWeight: 'bold',
                padding: '8px 16px',
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '20px',
                color: '#333'
              }}>
                {partner1Name || 'Partner 1'}'s Turn
              </div>
              <p style={{ color: 'white', fontSize: '1rem', textAlign: 'center', lineHeight: '1.2', margin: 0, display: 'block', width: '100%', fontWeight: 500, letterSpacing: '-0.02em' }}>
                Take turns answering each question
              </p>
            </div>

            <div className="explainer__controls-row" style={{ display: 'flex', flexDirection: 'row', width: '100%', justifyContent: 'center', alignItems: 'center' }}>
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
        </div>
      )}

    </div>

  );
}
