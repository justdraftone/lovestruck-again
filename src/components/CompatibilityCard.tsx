import { useState, useEffect } from 'react';
import { CompatibilityReport } from '../lib/resultsEngine';

interface CompatibilityCardProps {
  compatibility: CompatibilityReport;
  partner1Name?: string;
  partner2Name?: string;
  shareable?: boolean;
}

// Function to get compatibility text based on score
function getCompatibilityText(percentage: number): string {
  if (percentage >= 90) return 'Soul Mates';
  if (percentage >= 80) return 'Power Couple';
  if (percentage >= 70) return 'Dream Team';
  if (percentage >= 60) return 'Perfect Pair';
  if (percentage >= 50) return 'Great Match';
  if (percentage >= 40) return 'Love Birds';
  return 'Worth a Shot';
}

export default function CompatibilityCard({
  compatibility,
  partner1Name,
  partner2Name,
  shareable = false,
}: CompatibilityCardProps) {
  const showNames = shareable && partner1Name && partner2Name;
  const [displayPercentage, setDisplayPercentage] = useState(0);

  useEffect(() => {
    const duration = 1500; // 1.5 seconds
    const steps = 60;
    const increment = compatibility.overallPercentage / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= compatibility.overallPercentage) {
        setDisplayPercentage(compatibility.overallPercentage);
        clearInterval(timer);
      } else {
        setDisplayPercentage(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [compatibility.overallPercentage]);

  return (
    <div className={`compatibility-card${shareable ? ' compatibility-card--shareable' : ''}`}>
      <div className="compatibility-card__badge">Your Compatibility Report</div>

      <div className="compatibility-card__percentage">
        {displayPercentage}%
      </div>

      <div className="compatibility-card__level">
        {getCompatibilityText(compatibility.overallPercentage)}
      </div>

      {showNames && (
        <div className="compatibility-card__names">
          {partner1Name} & {partner2Name}
        </div>
      )}

      <p className={showNames? "compatibility-card__description compatibility-card__description-result" : "compatibility-card__description"}>{compatibility.description}</p>

      <img className="compatibility-card__cloud" src="/assets/illos/results-card-cloud.svg" alt="" />

      {shareable && (
        <div className="share-modal__logo" style={{ bottom: '34px' }}>
          <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
        </div>
      )}
    </div>
  );
}
