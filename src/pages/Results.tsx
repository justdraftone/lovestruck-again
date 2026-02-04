import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import { calculateResult, calculateCompatibility } from '../lib/resultsEngine';
import ResultCard from '../components/ResultCard';
import ShareModal from '../components/ShareModal';
import CouplesResults from '../components/CouplesResults';

export default function Results() {
  const navigate = useNavigate();
  const params = useParams<{ mode: string }>();
  const { answers, partner1Answers, partner2Answers, partner1Name, partner2Name, reset } =
    useQuizStore();
  const [showShareModal, setShowShareModal] = useState(false);

  const isSolo = params.mode === 'solo';
  const isCouplesLocal = params.mode === 'couples-local';
  const isCouplesRemote = params.mode === 'couples-remote';

  const remoteData = isCouplesRemote
    ? JSON.parse(sessionStorage.getItem('remoteResults') || '{}')
    : null;

  const remoteName1 = remoteData?.partner1Name || 'Partner 1';
  const remoteName2 = remoteData?.partner2Name || 'Partner 2';
  const remoteAnswers1 = remoteData?.partner1Answers || {};
  const remoteAnswers2 = remoteData?.partner2Answers || {};

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

  const compatibility = useMemo(() => {
    if (!isCouplesLocal && !isCouplesRemote) return null;
    const ans1 = isCouplesLocal ? partner1Answers : remoteAnswers1;
    const ans2 = isCouplesLocal ? partner2Answers : remoteAnswers2;
    return calculateCompatibility(ans1, ans2, displayName1, displayName2);
  }, [isCouplesLocal, isCouplesRemote, partner1Answers, partner2Answers, remoteAnswers1, remoteAnswers2, displayName1, displayName2]);

  const handlePlayAgain = () => {
    reset();
    navigate('/');
  };

  if (isSolo && soloResult) {
    return (
      <div className="page page--centered gradient-love" style={{ padding: '48px 24px' }}>

        <div className="header header__results">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="" />
        </div>

        <div className="container container--results">
          <ResultCard result={soloResult} variant="large" />
        </div>

        <div className="btn-group container--results-btn">
            <button onClick={() => setShowShareModal(true)} className="btn btn-homepage">
              Share your Results!
            </button>
            <button onClick={handlePlayAgain} className="btn btn-homepage">
              Play Again
            </button>
          </div>

        <div className='highlight-glow highlight-glow--results'></div>

        <ShareModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          result={soloResult}
        />
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
