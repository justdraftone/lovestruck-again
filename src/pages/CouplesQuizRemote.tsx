import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { questions } from '../data/questions';
import { useSwipe } from '../hooks/useSwipe';
import { useQuizStore } from '../store/quizStore';

type GamePhase = 'waiting' | 'playing' | 'waiting-partner';

// Simulated partner responses (dummy data)
const simulatePartnerResponse = (questionIndex: number): 'left' | 'right' => {
  return questionIndex % 2 === 0 ? 'right' : 'left';
};

const generateRoomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export default function CouplesQuizRemote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setMode, addAnswer, nextQuestion } = useQuizStore();

  const joinCode = searchParams.get('join');
  const isHost = !joinCode;

  const roomCode = useMemo(() => joinCode || generateRoomCode(), [joinCode]);

  const [phase, setPhase] = useState<GamePhase>(joinCode ? 'playing' : 'waiting');
  const [playerName, setPlayerName] = useState('');
  const [partnerName, setPartnerName] = useState(joinCode ? 'Host' : '');
  const [partnerJoined, setPartnerJoined] = useState(!!joinCode);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | null>(null);
  const [isEntering, setIsEntering] = useState(false);
  const [isMyTurn, setIsMyTurn] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showExplainer, setShowExplainer] = useState(() => {
    const hasSeenExplainer = localStorage.getItem('hasSeenExplainer');
    return !hasSeenExplainer;
  });
  const [isExplainerExiting, setIsExplainerExiting] = useState(false);

  useEffect(() => {
    setMode('couples-remote');
  }, [setMode]);

  // Simulate partner joining after 2 seconds for host
  useEffect(() => {
    if (isHost && !partnerJoined) {
      const timer = setTimeout(() => {
        setPartnerName('Your Partner');
        setPartnerJoined(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isHost, partnerJoined]);

  const dismissExplainer = () => {
    setIsExplainerExiting(true);
    setTimeout(() => {
      localStorage.setItem('hasSeenExplainer', 'true');
      setShowExplainer(false);
      setIsExplainerExiting(false);
    }, 200);
  };

  const handleStartGame = () => {
    setPhase('playing');
    setIsMyTurn(true);
  };

  const lobbyLink = `${window.location.origin}/couples/remote?join=${roomCode}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(lobbyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareText = () => {
    const text = `Join my Love Struck Again quiz! ${lobbyLink}`;
    if (navigator.share) {
      navigator.share({ title: 'Love Struck Again', text, url: lobbyLink });
    } else {
      window.open(`sms:?body=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleShareWhatsApp = () => {
    const text = `Join my Love Struck Again quiz! ${lobbyLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleShareEmail = () => {
    const subject = encodeURIComponent('Join my Love Struck Again quiz!');
    const body = encodeURIComponent(`Hey! Take this couples quiz with me: ${lobbyLink}`);
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  const processSwipe = (direction: 'left' | 'right') => {
    if (!isMyTurn || swipeDirection || showExplainer) return;
    setIsSwiping(direction);
    setTimeout(() => {
      setSwipeDirection(direction);
      setIsSwiping(null);
    }, 150);
    // Wait for card to fully disappear (150ms delay + 350ms CSS transition)
    setTimeout(() => {
      addAnswer(currentQuestion, direction);
      processAnswer();
    }, 500);
  };

  const handleSwipeLeft = () => processSwipe('left');
  const handleSwipeRight = () => processSwipe('right');

  const processAnswer = () => {
    setIsMyTurn(false);
    setPhase('waiting-partner');

    // Simulate partner answering after 1.5 seconds
    setTimeout(() => {
      simulatePartnerResponse(currentQuestion);

      setTimeout(() => {
        if (currentQuestion + 1 >= questions.length) {
          // Store dummy results for display
          sessionStorage.setItem('remoteResults', JSON.stringify({
            partner1Name: isHost ? playerName : partnerName,
            partner2Name: isHost ? partnerName : playerName,
            partner1Answers: {},
            partner2Answers: {},
          }));
          navigate('/results/couples-remote');
        } else {
          setCurrentQuestion(prev => prev + 1);
          nextQuestion();
          setSwipeDirection(null);
          setPhase('playing');
          setIsMyTurn(true);
          setIsEntering(true);
          setTimeout(() => setIsEntering(false), 250);
        }
      }, 500);
    }, 1500);
  };

  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  // Waiting for Partner Phase
  if (phase === 'waiting') {
    return (
      <div className="page page--centered gradient-love">
        <button className="back-btn" onClick={() => navigate('/couples')}>
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="" />
        </div>

        <div className="remote-invite">
          <div className="remote-invite__card">
            <h2 className="remote-invite__title">Invite your Partner</h2>
            <p className="remote-invite__subtitle">Share this link with your partner</p>

            <div className="remote-invite__link-section">
              <label className="remote-invite__label">Your Lobby Link</label>
              <div className="remote-invite__link-box">
                <span className="remote-invite__link-text">{lobbyLink.replace(/^https?:\/\//, '')}</span>
                <button onClick={handleCopyLink} className="remote-invite__copy-btn" aria-label="Copy link">
                  {copied ? (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <p className="remote-invite__share-label">Or share directly via:</p>
            <div className="remote-invite__share-buttons">
              <button onClick={handleShareText} className="remote-invite__share-btn">
                Text Message
              </button>
              <button onClick={handleShareWhatsApp} className="remote-invite__share-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Whatsapp
              </button>
              <button onClick={handleShareEmail} className="remote-invite__share-btn">
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email
              </button>
            </div>

            <div className="remote-invite__waiting">
              {partnerJoined ? (
                <>
                  <p className="remote-invite__joined-text">{partnerName} has joined!</p>
                  <button
                    onClick={handleStartGame}
                    className="btn btn--primary btn-homepage"
                  >
                    Start Quiz
                  </button>
                </>
              ) : (
                <>
                  <p className="remote-invite__waiting-title">Waiting for partner...</p>
                  <p className="remote-invite__waiting-sub">We'll start the quiz once they join</p>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="highlight-glow"></div>
      </div>
    );
  }

  // Playing Phase - uses same visual as solo quiz
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const cardVariant = (currentQuestion % 4) + 1;

  return (
    <div className="page gradient-love">
      <div className="header">
        <img src="/assets/illos/d1-x-loveorlies.svg" alt="" />
        <div className={`turn-indicator ${isMyTurn ? 'turn-indicator--active' : 'turn-indicator--waiting'}`}>
          {phase === 'waiting-partner' ? (
            <p>Waiting for {partnerName}...</p>
          ) : (
            <p>Your turn!</p>
          )}
        </div>
      </div>

      <div id="swipe-area" className="swipe-area">
        <button
          onClick={handleSwipeLeft}
          className={`fab fab--left ${!isMyTurn ? 'fab--disabled' : ''}`}
          aria-label="No"
          disabled={!isMyTurn}
        >
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
            } ${isEntering ? 'quiz-card--entering' : ''} ${!isMyTurn ? 'quiz-card--dimmed' : ''}`}
            style={{ zIndex: 15 }}
          >
            <div className="card-content">
              <div className="emoji-icon">🎵</div>
              <h2 className="question-text">{question.text}</h2>

              <div className="answer-group answer-group--yn">
                <button
                  onClick={handleSwipeLeft}
                  className={`answer-btn answer-btn--icon ${!isMyTurn ? 'answer-btn--disabled' : ''}`}
                  disabled={!isMyTurn}
                  aria-label="No"
                >
                  <svg className="icon icon--red" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <button
                  onClick={handleSwipeRight}
                  className={`answer-btn answer-btn--icon ${!isMyTurn ? 'answer-btn--disabled' : ''}`}
                  disabled={!isMyTurn}
                  aria-label="Yes"
                >
                  <svg className="icon icon--green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>

              <div className="card-brand">
                <img src="../../public/assets/illos/d1-x-loveorlies-card.svg" alt="" />
              </div>
            </div>

            {!isMyTurn && (
              <div className="waiting-overlay">
                <div className="waiting-overlay__message">
                  <p>Waiting for {partnerName}...</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleSwipeRight}
          className={`fab fab--right ${!isMyTurn ? 'fab--disabled' : ''}`}
          aria-label="Yes"
          disabled={!isMyTurn}
        >
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
