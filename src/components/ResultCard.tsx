import { Result } from '../data/results';

interface ResultCardProps {
  result: Result;
  variant?: 'default' | 'large';
  partnerName?: string;
  partnerLabelColor?: 'purple' | 'pink';
  pairsWellWith?: string;
  showShareable?: boolean;
  hidePairings?: boolean;
  onShareClick?: () => void;
}

// 10 gradient backgrounds for each result type
const resultGradients: Record<string, string> = {
  fire: 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 30%, #C0392B 100%)',
  calculator: 'linear-gradient(135deg, #74B9FF 0%, #0984E3 50%, #2C3E50 100%)',
  dice: 'linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 30%, #F39C12 100%)',
  dreamy: 'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 40%, #9B59B6 100%)',
  flower: 'linear-gradient(135deg, #98D8AA 0%, #55EFC4 40%, #00B894 100%)',
  ghost: 'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 50%, #2D3436 100%)',
  magnifying: 'linear-gradient(135deg, #81ECEC 0%, #00CEC9 50%, #00838F 100%)',
  mask: 'linear-gradient(135deg, #FFB8B8 0%, #FF7675 40%, #E84393 100%)',
  patch: 'linear-gradient(135deg, #FFECD2 0%, #FCB69F 50%, #E17055 100%)',
  pizza: 'linear-gradient(135deg, #FFA07A 0%, #FF6347 40%, #CD5C5C 100%)',
};

// Compatibility pairings
const compatibilityPairs: Record<string, string> = {
  fire: 'The Healing Presence',
  calculator: 'The Dreamy Idealist',
  dice: 'The Blooming Connection',
  dreamy: 'The Logical Lover',
  flower: 'The Lucky Romantic',
  ghost: 'The Curious Explorer',
  magnifying: 'The Mysterious Soul',
  mask: 'The Shared Feast',
  patch: 'The Passionate Flame',
  pizza: 'The Playful Heart',
};

export default function ResultCard({
  result,
  variant = 'default',
  partnerName,
  partnerLabelColor,
  pairsWellWith,
  showShareable = false,
  hidePairings = false,
}: ResultCardProps) {
  const isLarge = variant === 'large';
  const gradient = resultGradients[result.id] || resultGradients.fire;
  const compatibleType = pairsWellWith || compatibilityPairs[result.id];

  return (
    <div
      className={`result-card ${isLarge ? 'result-card--large' : ''} ${showShareable ? 'result-card--shareable' : ''}`}
      style={{ background: gradient }}
    >
      {partnerName && (
        <p className={`result-card__partner-label result-card__partner-label--${partnerLabelColor}`}>
          {partnerName}
        </p>
      )}

      <h3 className={`result-card__name ${isLarge ? 'result-card__name--large' : ''}`}>
        {result.name}
      </h3>

      <img
        src={result.image}
        className={`result-card__image ${isLarge ? 'result-card__image--large' : ''}`}
        alt={result.name}
        loading="lazy"
      />

      <p className={`result-card__desc ${isLarge ? 'result-card__desc--large' : ''}`}>
        {result.description}
      </p>

      {!hidePairings && (
        <div className="result-card__compatibility">
          <span className="result-card__compatibility-label">You pair well with</span>
          <span className="result-card__compatibility-type">{compatibleType}</span>
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
