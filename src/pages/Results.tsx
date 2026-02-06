import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { calculateResult, calculateCompatibility } from '../lib/resultsEngine';
import { nigeriaQuestions, globalQuestions } from '../data/questions';
import ResultCard from '../components/ResultCard';
import ShareModal from '../components/ShareModal';
import CouplesResults from '../components/CouplesResults';
import { supabase } from '../lib/supabase';
import { PersonaName, personas } from '../data/personas';
import { personaVisuals } from '../data/results';

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

        <div className="header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
        </div>

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

          <a href="/letters" className="cta-card-link">
            <div className="cta-card">
              <img src="/assets/illos/heart-envelope.svg" alt="" className="cta-card__emoji" />
              <p className="cta-card__title">Create a Valentine's Card</p>
              <p className="cta-card__desc">Send a love letter to your special someone</p>
              <span className="cta-card__btn">Create Now →</span>
            </div>
          </a>
        </div>

        <div className='highlight-glow highlight-glow--results'></div>

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          result={soloResult}
        />

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
                      description: pairDescription,
                      score: 0
                    }}
                    variant="large"
                    showShareable
                    hidePairings
                  />
                  <div className="share-modal__logo">
                    <img src="/assets/collab-logo.png" alt="Draft One x Love or Lies" />
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
