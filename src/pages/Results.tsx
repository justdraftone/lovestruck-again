import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { calculateResult, calculateCompatibility } from '../lib/resultsEngine';
import { nigeriaQuestions, globalQuestions } from '../data/questions';
import ResultCard from '../components/ResultCard';
import ShareModal from '../components/ShareModal';
import CouplesResults from '../components/CouplesResults';
import ValentinesCardCta from '../components/ValentinesCardCta';
import { supabase } from '../lib/supabase';
import { PersonaName, personas } from '../data/personas';

export default function Results() {
  const navigate = useNavigate();
  const params = useParams<{ mode: string }>();
  const {
    answers,
    partner1Answers,
    partner2Answers,
    partner1Name,
    partner2Name,
    questionSet,
    selectedQuestionIds,
    reset
  } = useQuizStore();
  const [showShareModal, setShowShareModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [remoteRoomData, setRemoteRoomData] = useState<any>(null);
  const [selectedPairing, setSelectedPairing] = useState<PersonaName | null>(null);

  // Debug controls
  const [showDebug, setShowDebug] = useState(false);
  const [containerMarginTop, setContainerMarginTop] = useState(65);
  const [containerPadding, setContainerPadding] = useState(0);
  const [imageSize, setImageSize] = useState(260);
  const [descMarginTop, setDescMarginTop] = useState(-30);
  const [pillFontSize, setPillFontSize] = useState(0.85);
  const [pillPaddingV, setPillPaddingV] = useState(8);
  const [pillPaddingH, setPillPaddingH] = useState(18);
  const [compatibilityMarginTop, setCompatibilityMarginTop] = useState(0);
  const [labelFontSize, setLabelFontSize] = useState(0.6);
  const [cloudWidth, setCloudWidth] = useState(320);
  const [cloudBottom, setCloudBottom] = useState(-35);
  const [cloudLeft, setCloudLeft] = useState(-20);
  const [cloudTranslateX, setCloudTranslateX] = useState(-50);
  const [headerFontSize, setHeaderFontSize] = useState(2.3);
  const [cardPaddingTop, setCardPaddingTop] = useState(24);
  const [resultsButtonsMarginTop, setResultsButtonsMarginTop] = useState(-40);

  // Shareable card (pairing) controls
  const [shareableCardPaddingTop, setShareableCardPaddingTop] = useState(20);
  const [shareableCardMaxWidth, setShareableCardMaxWidth] = useState(590);
  const [shareModalContentMaxWidth, setShareModalContentMaxWidth] = useState(120);
  const [shareModalCardWrapperMaxWidth, setShareModalCardWrapperMaxWidth] = useState(111);
  const [shareModalContentPadding, setShareModalContentPadding] = useState(0);
  const [shareableHeaderFontSize, setShareableHeaderFontSize] = useState(2);
  const [shareableImageSize, setShareableImageSize] = useState(250);
  const [shareableDescMarginTop, setShareableDescMarginTop] = useState(-34);
  const [shareableCloudWidth, setShareableCloudWidth] = useState(270);
  const [shareableCloudBottom, setShareableCloudBottom] = useState(-30);
  const [shareableCloudLeft, setShareableCloudLeft] = useState(-10);

  // Determine mode from params
  const isSolo = params.mode === 'solo';
  const isCouplesLocal = params.mode === 'couples-local';
  const isCouplesRemote = params.mode === 'couples-remote';

  // Fetch remote room data from Supabase if in remote mode
  useEffect(() => {
    const fetchRemoteData = async () => {
      if (isCouplesRemote) {
        const roomId = localStorage.getItem('currentRoomId');
        if (roomId) {
          const { data, error } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', roomId)
            .single();

          if (data && !error) {
            setRemoteRoomData(data);
          }
        }
      }

      // Show loader for at least 1.5 seconds
      setTimeout(() => {
        setIsLoading(false);
      }, 1500);
    };

    fetchRemoteData();
  }, [isCouplesRemote]);

  // Get remote data from Supabase room instead of sessionStorage
  const remoteName1 = remoteRoomData?.partner1_name || 'Partner 1';
  const remoteName2 = remoteRoomData?.partner2_name || 'Partner 2';
  const remoteAnswers1 = remoteRoomData?.partner1_answers || {};
  const remoteAnswers2 = remoteRoomData?.partner2_answers || {};

  const soloResult = isSolo ? calculateResult(answers) : null;
  const partner1Result = isCouplesLocal
    ? calculateResult(partner1Answers)
    : isCouplesRemote
    ? calculateResult(remoteAnswers1)
    : null;
  const partner2Result = isCouplesLocal
    ? calculateResult(partner2Answers)
    : isCouplesRemote
    ? calculateResult(remoteAnswers2)
    : null;

  const displayName1 = isCouplesRemote ? remoteName1 : partner1Name;
  const displayName2 = isCouplesRemote ? remoteName2 : partner2Name;

  // Get the questions that were used in this quiz
  const usedQuestions = useMemo(() => {
    const sourceQuestions = questionSet === 'nigeria' ? nigeriaQuestions : globalQuestions;
    return sourceQuestions.filter(q => selectedQuestionIds.includes(q.id));
  }, [questionSet, selectedQuestionIds]);

  const compatibility = useMemo(() => {
    if (!isCouplesLocal && !isCouplesRemote) return null;
    const ans1 = isCouplesLocal ? partner1Answers : remoteAnswers1;
    const ans2 = isCouplesLocal ? partner2Answers : remoteAnswers2;
    return calculateCompatibility(ans1, ans2, displayName1, displayName2, usedQuestions);
  }, [isCouplesLocal, isCouplesRemote, partner1Answers, partner2Answers, remoteAnswers1, remoteAnswers2, displayName1, displayName2, usedQuestions]);

  const handlePlayAgain = () => {
    reset();
    navigate('/');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="page page--centered gradient-love">
        <div className="results-loader">
          <div className="results-loader__spinner"></div>
          <p className="results-loader__text">Calculating your results...</p>
        </div>
      </div>
    );
  }

  if (isSolo && soloResult) {
    return (
      <div className="page page--centered gradient-love" style={{ padding: '48px 24px' }}>

        <div className="header header__results">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>

        <style>{`
          @media (max-width: 768px) {
            .container--results {
              margin-top: ${containerMarginTop}px !important;
              padding: 0 ${containerPadding}px !important;
            }
            .result-card--large {
              padding-top: ${cardPaddingTop}px !important;
            }
            .result-card__name--large {
              font-size: ${headerFontSize}rem !important;
            }
            .result-card__image--large {
              width: ${imageSize}px !important;
              height: ${imageSize}px !important;
            }
            .result-card__desc--large {
              margin-top: ${descMarginTop}px !important;
            }
            .result-card__compatibility-type {
              font-size: ${pillFontSize}rem !important;
              padding: ${pillPaddingV}px ${pillPaddingH}px !important;
            }
            .result-card__compatibility {
              margin-top: ${compatibilityMarginTop}px !important;
            }
            .result-card__partner-label,
            .result-card__compatibility-label {
              font-size: ${labelFontSize}rem !important;
            }
            .result-card__cloud {
              width: ${cloudWidth}% !important;
              bottom: ${cloudBottom}% !important;
              left: ${cloudLeft}% !important;
              transform: translateX(${cloudTranslateX}%) !important;
            }

            .results-buttons {
              margin-top: ${resultsButtonsMarginTop}px !important;
            }

            /* Shareable/Pairing Card Styles */
            .share-modal__content {
              max-width: ${shareModalContentMaxWidth}% !important;
              padding: 32px ${shareModalContentPadding}px !important;
            }
            .share-modal__card-wrapper {
              max-width: ${shareModalCardWrapperMaxWidth}% !important;
            }
            .result-card--shareable {
              padding-top: ${shareableCardPaddingTop}px !important;
              max-width: ${shareableCardMaxWidth}px !important;
            }
            .result-card--shareable .result-card__name--large {
              font-size: ${shareableHeaderFontSize}rem !important;
            }
            .result-card--shareable .result-card__image--large {
              width: ${shareableImageSize}px !important;
              height: ${shareableImageSize}px !important;
            }
            .result-card--shareable .result-card__desc--large {
              margin-top: ${shareableDescMarginTop}px !important;
            }
            .result-card--shareable .result-card__cloud {
              width: ${shareableCloudWidth}% !important;
              bottom: ${shareableCloudBottom}% !important;
              left: ${shareableCloudLeft}% !important;
            }
          }
        `}</style>

        <div className="container container--results">
          <ResultCard
            result={soloResult}
            variant="large"
            onPairingClick={(personaName) => setSelectedPairing(personaName)}
          />
        </div>

        <div className="results-bottom">
          <div className="btn-group container--results-btn results-buttons">
              <button onClick={() => setShowShareModal(true)} className="btn btn-homepage">
                Share your Results!
              </button>
              <button onClick={handlePlayAgain} className="btn btn-homepage">
                Play Again
              </button>
            </div>

          <ValentinesCardCta hideOnScroll />
        </div>

        <div className='highlight-glow highlight-glow--results'></div>

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          result={soloResult}
        />

        {/* Debug Controls */}
        {showDebug && (
          <div
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              background: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              zIndex: 99999,
              maxWidth: '320px',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>Pairing Card Debug</h3>
              <button
                onClick={() => setShowDebug(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '0 5px',
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Card Padding Top: {shareableCardPaddingTop}px
              </label>
              <input
                type="range"
                min="16"
                max="48"
                step="2"
                value={shareableCardPaddingTop}
                onChange={(e) => setShareableCardPaddingTop(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Modal Content Max Width: {shareModalContentMaxWidth}%
              </label>
              <input
                type="range"
                min="70"
                max="120"
                step="1"
                value={shareModalContentMaxWidth}
                onChange={(e) => setShareModalContentMaxWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Modal Content Padding: {shareModalContentPadding}px
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={shareModalContentPadding}
                onChange={(e) => setShareModalContentPadding(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Card Wrapper Max Width: {shareModalCardWrapperMaxWidth}%
              </label>
              <input
                type="range"
                min="90"
                max="120"
                step="1"
                value={shareModalCardWrapperMaxWidth}
                onChange={(e) => setShareModalCardWrapperMaxWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Card Max Width: {shareableCardMaxWidth}px
              </label>
              <input
                type="range"
                min="300"
                max="800"
                step="10"
                value={shareableCardMaxWidth}
                onChange={(e) => setShareableCardMaxWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Header Font Size: {shareableHeaderFontSize}rem
              </label>
              <input
                type="range"
                min="1.5"
                max="3"
                step="0.1"
                value={shareableHeaderFontSize}
                onChange={(e) => setShareableHeaderFontSize(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Image Size: {shareableImageSize}px
              </label>
              <input
                type="range"
                min="150"
                max="300"
                step="10"
                value={shareableImageSize}
                onChange={(e) => setShareableImageSize(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Desc Margin Top: {shareableDescMarginTop}px
              </label>
              <input
                type="range"
                min="-40"
                max="20"
                step="2"
                value={shareableDescMarginTop}
                onChange={(e) => setShareableDescMarginTop(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Cloud Width: {shareableCloudWidth}%
              </label>
              <input
                type="range"
                min="200"
                max="600"
                step="10"
                value={shareableCloudWidth}
                onChange={(e) => setShareableCloudWidth(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Cloud Bottom: {shareableCloudBottom}%
              </label>
              <input
                type="range"
                min="-100"
                max="0"
                step="5"
                value={shareableCloudBottom}
                onChange={(e) => setShareableCloudBottom(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '11px', marginBottom: '4px', fontWeight: 500 }}>
                Pairing Cloud Left: {shareableCloudLeft}%
              </label>
              <input
                type="range"
                min="-100"
                max="0"
                step="5"
                value={shareableCloudLeft}
                onChange={(e) => setShareableCloudLeft(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <button
              onClick={() => {
                const css = `// Result Card Mobile
.container--results {
  margin-top: ${containerMarginTop}px;
  padding: 0 ${containerPadding}px;
}

.result-card--large {
  padding-top: ${cardPaddingTop}px;
}

.result-card__name--large {
  font-size: ${headerFontSize}rem;
}

.result-card__image--large {
  width: ${imageSize}px;
  height: ${imageSize}px;
}

.result-card__desc--large {
  margin-top: ${descMarginTop}px;
}

.result-card__compatibility-type {
  font-size: ${pillFontSize}rem;
  padding: ${pillPaddingV}px ${pillPaddingH}px;
}

.result-card__compatibility {
  margin-top: ${compatibilityMarginTop}px;
}

.result-card__partner-label,
.result-card__compatibility-label {
  font-size: ${labelFontSize}rem;
}

.result-card__cloud {
  width: ${cloudWidth}%;
  bottom: ${cloudBottom}%;
  left: ${cloudLeft}%;
  transform: translateX(${cloudTranslateX}%);
}

.results-buttons {
  margin-top: ${resultsButtonsMarginTop}px;
}

// Pairing Card (Shareable)
.share-modal__content {
  max-width: ${shareModalContentMaxWidth}%;
  padding: 32px ${shareModalContentPadding}px;
}

.share-modal__card-wrapper {
  max-width: ${shareModalCardWrapperMaxWidth}%;
}

.result-card--shareable {
  padding-top: ${shareableCardPaddingTop}px;
  max-width: ${shareableCardMaxWidth}px;
}

.result-card--shareable .result-card__name--large {
  font-size: ${shareableHeaderFontSize}rem;
}

.result-card--shareable .result-card__image--large {
  width: ${shareableImageSize}px;
  height: ${shareableImageSize}px;
}

.result-card--shareable .result-card__desc--large {
  margin-top: ${shareableDescMarginTop}px;
}

.result-card--shareable .result-card__cloud {
  width: ${shareableCloudWidth}%;
  bottom: ${shareableCloudBottom}%;
  left: ${shareableCloudLeft}%;
}`;
                navigator.clipboard.writeText(css);
                alert('CSS copied to clipboard!');
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              Copy CSS
            </button>
          </div>
        )}

        {!showDebug && (
          <button
            onClick={() => setShowDebug(true)}
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              background: 'white',
              padding: '12px 18px',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              border: 'none',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
              zIndex: 99999,
            }}
          >
            🃏 Debug
          </button>
        )}

        {/* Pairing Detail Modal */}
        {selectedPairing && (() => {
          const pairingData = personas[selectedPairing];
          const pairDescription = pairingData?.pairDescription || 'A perfect match for you!';

          return (
            <div className="share-modal" onClick={() => setSelectedPairing(null)}>
              <div className="share-modal__overlay" />
              <div className="share-modal__content" onClick={(e) => e.stopPropagation()}>
                <div className="share-modal__card-wrapper">
                  <ResultCard
                    result={{
                      name: selectedPairing,
                      emoji: pairingData?.emoji || '❤️',
                      description: pairDescription,
                      score: 0
                    }}
                    variant="large"
                    showShareable
                    hidePairings
                  />
                  <div className="share-modal__logo">
                    <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
                  </div>
                </div>
                <button onClick={() => setSelectedPairing(null)} className="share-modal__close" aria-label="Close">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })()}
      </div>
    );
  }

  if ((isCouplesLocal || isCouplesRemote) && partner1Result && partner2Result && compatibility) {
    return (
      <CouplesResults
        partner1Name={displayName1}
        partner2Name={displayName2}
        partner1Result={partner1Result}
        partner2Result={partner2Result}
        compatibility={compatibility}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  navigate('/');
  return null;
}
