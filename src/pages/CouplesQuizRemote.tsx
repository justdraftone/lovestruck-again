import { useEffect, useState, useMemo, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { nigeriaQuestions, globalQuestions, Question } from '../data/questions';
import { useSwipe } from '../hooks/useSwipe';
import { useQuizStore } from '../store/quizStore';
import {
  createRoom,
  joinRoom,
  subscribeToRoom,
  submitAnswer,
  unsubscribeFromRoom
} from '../lib/roomService';
import { Room } from '../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

// Helper function to select random questions
function selectRandomQuestions(questions: Question[], count: number): Question[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

type GamePhase = 'waiting' | 'playing' | 'waiting-partner';

export default function CouplesQuizRemote() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const {
    setMode,
    addAnswer,
    nextQuestion,
    questionSet,
    selectedQuestionIds,
    setSelectedQuestions
  } = useQuizStore();

  const joinCode = searchParams.get('join');
  const isHost = !joinCode;

  // Supabase state
  const [room, setRoom] = useState<Room | null>(null);
  const [, setPlayerId] = useState<string>('');
  const [partnerNum, setPartnerNum] = useState<1 | 2>(1);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [error, setError] = useState<string>('');

  // UI state
  const [phase, setPhase] = useState<GamePhase>(joinCode ? 'playing' : 'waiting');
  const phaseRef = useRef<GamePhase>(phase);
  const partnerNumRef = useRef<1 | 2>(partnerNum);
  const [displayQuestion, setDisplayQuestion] = useState(0);

  // Keep refs in sync with state
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    partnerNumRef.current = partnerNum;
  }, [partnerNum]);

  const [playerName] = useState('Player');
  const [partnerName, setPartnerName] = useState('');
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState<'left' | 'right' | null>(null);
  const [copied, setCopied] = useState(false);
  const [showExplainer, setShowExplainer] = useState(() => {
    const hasSeenExplainer = localStorage.getItem('hasSeenExplainer');
    return !hasSeenExplainer;
  });
  const [isExplainerExiting, setIsExplainerExiting] = useState(false);

  // Derived state from room
  const isMyTurn = room?.current_turn === partnerNum;
  const partnerJoined = room?.status === 'playing' || room?.status === 'finished';
  const roomCode = room?.code || '';

  // Debug logging
  useEffect(() => {
    console.log('[CouplesRemote] State:', {
      partnerNum,
      currentTurn: room?.current_turn,
      isMyTurn,
      phase,
      isHost
    });
  }, [partnerNum, room?.current_turn, isMyTurn, phase, isHost]);

  // Select questions based on question set
  const questions = useMemo(() => {
    const sourceQuestions = questionSet === 'nigeria' ? nigeriaQuestions : globalQuestions;

    // If we already have selected question IDs, use those
    if (selectedQuestionIds.length > 0) {
      return sourceQuestions.filter(q => selectedQuestionIds.includes(q.id));
    }

    // Otherwise, select 14 random questions (7 for each partner)
    const selected = selectRandomQuestions(sourceQuestions, 14);
    setSelectedQuestions(selected.map(q => q.id));
    return selected;
  }, [questionSet, selectedQuestionIds, setSelectedQuestions]);

  useEffect(() => {
    setMode('couples-remote');
  }, [setMode]);

  // Initialize room (create or join)
  useEffect(() => {
    const initRoom = async () => {
      if (isHost) {
        // Host creates a new room
        const result = await createRoom(playerName);
        if (result) {
          setRoom(result.room);
          setPlayerId(result.playerId);
          setPartnerNum(1);
          setDisplayQuestion(result.room.current_question);
          // Store room ID for potential reconnection
          localStorage.setItem('currentRoomId', result.room.id);
          localStorage.setItem('currentPlayerId', result.playerId);
        } else {
          setError('Failed to create room. Please check your Supabase configuration.');
        }
      } else if (joinCode) {
        // Joiner joins existing room
        const result = await joinRoom(joinCode, playerName);
        if (result) {
          setRoom(result.room);
          setPlayerId(result.playerId);
          setPartnerNum(result.partnerNum);
          setPartnerName(result.room.partner1_name);
          setDisplayQuestion(result.room.current_question);
          // Set phase based on whether it's the guest's turn
          if (result.room.current_turn === result.partnerNum) {
            setPhase('playing');
          } else {
            setPhase('waiting-partner');
          }
          // Store room ID for potential reconnection
          localStorage.setItem('currentRoomId', result.room.id);
          localStorage.setItem('currentPlayerId', result.playerId);
        } else {
          setError('Failed to join room. Please check the room code.');
        }
      }
    };

    initRoom();
  }, [isHost, joinCode, playerName]);

  // Subscribe to room updates
  useEffect(() => {
    if (!room?.id) return;

    console.log('[Realtime] Subscribing to room:', room.id);

    const subscription = subscribeToRoom(room.id, (updatedRoom) => {
      console.log('[Realtime] Room updated:', updatedRoom);
      setRoom(updatedRoom);

      // Update partner name when they join (for host)
      if (updatedRoom.partner2_name) {
        console.log('[Realtime] Partner joined:', updatedRoom.partner2_name);
        setPartnerName(updatedRoom.partner2_name);
        // Transition from waiting to playing when partner joins
        if (phaseRef.current === 'waiting') {
          console.log('[Realtime] Transitioning to playing phase');
          setPhase('playing');
        }
      }

      // When it's my turn again after partner answered, update display and phase
      if (updatedRoom.current_turn === partnerNumRef.current && phaseRef.current === 'waiting-partner') {
        setDisplayQuestion(updatedRoom.current_question);
        nextQuestion();
        setSwipeDirection(null);
        setIsSwiping(null);
        setPhase('playing');
      }

      // Navigate to results when game is finished
      if (updatedRoom.status === 'finished') {
        // Small delay to show the last question
        setTimeout(() => {
          navigate('/results/couples-remote');
        }, 1000);
      }
    });

    setChannel(subscription);

    // Cleanup subscription on unmount
    return () => {
      console.log('[Realtime] Cleaning up subscription');
      if (subscription) {
        unsubscribeFromRoom(subscription);
      }
    };
  }, [room?.id]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (channel) {
        unsubscribeFromRoom(channel);
      }
    };
  }, [channel]);

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
  };

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
    if (!isMyTurn || swipeDirection || showExplainer || phase === 'waiting-partner') return;

    // Add both classes immediately
    setIsSwiping(direction);
    setSwipeDirection(direction);

    // Wait for transition to complete, then show waiting overlay
    setTimeout(() => {
      setIsSwiping(null);
      setPhase('waiting-partner');
      processAnswer(direction);
    }, 500);
  };

  const handleSwipeLeft = () => processSwipe('left');
  const handleSwipeRight = () => processSwipe('right');

  const processAnswer = async (direction: 'left' | 'right') => {
    if (!room?.id) return;

    // Submit answer to Supabase (use displayQuestion which is what the player is seeing)
    const success = await submitAnswer(
      room.id,
      partnerNum,
      displayQuestion,
      direction,
      questions.length
    );

    if (success) {
      // Add to local store for records
      addAnswer(displayQuestion, direction);

      // DON'T call nextQuestion() here - let the real-time update handle it
      // This prevents the card from resetting

      // Stay in waiting-partner phase until real-time update arrives
      // Don't reset swipeDirection - keep card hidden until turn changes
    } else {
      setError('Failed to submit answer. Please try again.');
      setSwipeDirection(null);
      setPhase('playing');
    }
  };

  useSwipe({ onSwipeLeft: handleSwipeLeft, onSwipeRight: handleSwipeRight });

  const lobbyLink = roomCode ? `${window.location.origin}/couples/remote?join=${roomCode}` : '';

  // Show error if room creation/joining failed
  if (error) {
    return (
      <div className="page page--centered gradient-love">
        <div className="header header__couples-quiz-remote">
          <button className="back-btn" onClick={() => navigate('/couples')}>
            Back
          </button>
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>

        <div className="remote-invite">
          <div className="remote-invite__card">
            <h2 className="remote-invite__title">Error</h2>
            <p className="remote-invite__subtitle" style={{ color: '#ff4444' }}>{error}</p>
            <button
              onClick={() => navigate('/couples')}
              className="btn btn--primary btn-homepage"
              style={{ marginTop: '24px' }}
            >
              Go Back
            </button>
          </div>
        </div>
        <div className="highlight-glow"></div>
      </div>
    );
  }

  // Show loading while initializing room or waiting for partner number
  if (!room || (!isHost && partnerNum === 1)) {
    return (
      <div className="page page--centered gradient-love">
        <div className="results-loader">
          <div className="results-loader__spinner"></div>
          <p className="results-loader__text">
            {isHost ? 'Creating room...' : 'Joining room...'}
          </p>
        </div>
      </div>
    );
  }

  // Waiting for Partner Phase
  if (phase === 'waiting') {
    return (
      <div className="page page--centered gradient-love">
        <div className="header header__couples-quiz-remote">
          <button onClick={() => navigate('/')} className="back-btn">
            Back
          </button>
          <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>
        {/* <div className="header header">
          <button className="back-btn" onClick={() => navigate('/couples')}>
            Back
          </button>
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div> */}

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
  const progress = ((displayQuestion + 1) / questions.length) * 100;

  // Pre-render upcoming cards for deck effect (use displayQuestion for rendering)
  const upcomingCards = [0, 1, 2].map(offset => {
    const questionIndex = displayQuestion + offset;
    if (questionIndex >= questions.length) return null;
    return {
      question: questions[questionIndex],
      variant: (questionIndex % 4) + 1,
      isTop: offset === 0
    };
  }).filter(Boolean);

  // Check if we should hide card content (when waiting or swiping)
  const hideCardContent = phase === 'waiting-partner' || isSwiping || swipeDirection;

  return (
    <div className="page gradient-love">
      <div
        className="header header__couples-quiz-w-toggle"
        style={{
          ...((!isMyTurn && !showExplainer) ? { width: '100%' } : {}),
          position: 'relative',
          zIndex: 200
        }}
      >
        <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        {isMyTurn && (
          <div className="turn-indicator turn-indicator--active">
            <p>Your turn!</p>
          </div>
        )}
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
          {upcomingCards.map((card, index) => {
            if (!card) return null;

            return (
              <div
                key={`question-${displayQuestion + index}`}
                className={`quiz-card quiz-card--variant-${card.variant} ${
                  index === 0 && swipeDirection === 'left' ? 'quiz-card--swipe-left' :
                  index === 0 && swipeDirection === 'right' ? 'quiz-card--swipe-right' :
                  index === 0 && isSwiping === 'left' ? 'quiz-card--swiping-left' :
                  index === 0 && isSwiping === 'right' ? 'quiz-card--swiping-right' : ''
                } ${index === 0 && !isMyTurn ? 'quiz-card--dimmed' : ''} ${partnerNum === 2 ? 'flip-h' : ''}`}
              >
                <div className="card-content">
                  {!hideCardContent && (
                    <>
                      <div className="emoji-icon">{card.question.emoji}</div>
                      <h2 className="question-text">{card.question.text}</h2>
                    </>
                  )}

                  {index === 0 && !hideCardContent && (
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
                  )}

                  {!hideCardContent && (
                    <div className="card-brand">
                      <img src="../../public/assets/illos/d1-x-loveorlies-card.svg" alt="" />
                    </div>
                  )}
                </div>

              </div>
            );
          })}
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

      <div className="progress progress__couples-quiz-remote">
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

      {!isMyTurn && (
        <div className="waiting-screen">
          <div className="waiting-screen__backdrop" />
          <div className="waiting-screen__content">
            <p className="waiting-screen__text">
              Waiting for your partner
              <span className="loading-dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
