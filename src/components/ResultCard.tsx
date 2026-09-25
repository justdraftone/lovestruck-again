import { PersonaResult } from '../lib/resultsEngine';
import { personaVisuals } from '../data/results';
import { PersonaName, personas } from '../data/personas';
import { useQuizStore } from '../store/quizStore';

interface ResultCardProps {
  result: PersonaResult;
  variant?: 'default' | 'large' | 'shareable';
  partnerName?: string;
  partnerLabelColor?: 'purple' | 'pink';
  pairsWellWith?: PersonaName;
  showShareable?: boolean;
  hidePairings?: boolean;
  samePersona?: boolean;
  onShareClick?: () => void;
  onPairingClick?: (personaName: PersonaName) => void;
}

export default function ResultCard({
  result,
  variant = 'default',
  partnerName,
  partnerLabelColor,
  pairsWellWith,
  showShareable = false,
  hidePairings = false,
  samePersona = false,
  onPairingClick,
}: ResultCardProps) {
  const questionSet = useQuizStore((s) => s.questionSet);
  const isLarge = variant === 'large' || variant === 'shareable';
  const isShareable = variant === 'shareable' || showShareable;
  const visuals = personaVisuals[result.name];
  const gradient = visuals?.gradient || personaVisuals["The Vibe Checker"].gradient;
  const image = visuals?.image || personaVisuals["The Vibe Checker"].image;
  const nameColor = visuals?.nameColor;
  const compatibleType = pairsWellWith || visuals?.pairsWellWith || "The Vibe Checker";

  // Get the pairing gradient for the compatible persona type
  const compatibleVisuals = personaVisuals[compatibleType];
  const compatibleGradient = compatibleVisuals?.pairingGradient || personaVisuals["The Vibe Checker"].pairingGradient;

  const handlePairingClick = () => {
    if (onPairingClick) {
      onPairingClick(compatibleType);
    }
  };

  return (
    <div
      className={`result-card ${isLarge ? 'result-card--large' : ''} ${isShareable ? 'result-card--shareable' : ''}`}
      style={{ background: gradient }}
    >
      {partnerName && (
        <p className={`result-card__partner-label result-card__partner-label--${partnerLabelColor}`}>
          {partnerName}
        </p>
      )}

      <h3
        className={`result-card__name ${isLarge ? 'result-card__name--large' : ''}`}
        style={nameColor ? { color: nameColor } : undefined}
      >
        {result.name}
      </h3>

      <img
        src={image}
        className={`result-card__image ${isLarge ? 'result-card__image--large' : ''}`}
        alt={result.name}
        loading="lazy"
      />

      <p className={`result-card__desc ${isLarge ? 'result-card__desc--large' : ''}`}>
        {samePersona
          ? (questionSet === 'nigeria'
              ? (personas[result.name]?.nigeriaCoupleDescription || personas[result.name]?.coupleDescription || result.description)
              : (personas[result.name]?.coupleDescription || result.description))
          : result.description}
      </p>

      {!hidePairings && (
        <div className="result-card__compatibility">
          <span className="result-card__compatibility-label">You pair well with</span>
          <span
            className="result-card__compatibility-type"
            style={{ background: compatibleGradient, cursor: onPairingClick ? 'pointer' : 'default' }}
            onClick={handlePairingClick}
          >
            {compatibleType}
          </span>
        </div>
      )}

        <img
          className="result-card__cloud"
          src="/assets/illos/results-card-cloud.svg"
          alt=""
          loading='lazy'
        />

    </div>
  );
}
