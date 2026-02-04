import { CompatibilityReport } from '../lib/resultsEngine';

interface CompatibilityCardProps {
  compatibility: CompatibilityReport;
  partner1Name?: string;
  partner2Name?: string;
  shareable?: boolean;
}

export default function CompatibilityCard({
  compatibility,
  partner1Name,
  partner2Name,
  shareable = false,
}: CompatibilityCardProps) {
  const showNames = shareable && partner1Name && partner2Name;

  return (
    <div className={`compatibility-card${shareable ? ' compatibility-card--shareable' : ''}`}>
      <div className="compatibility-card__badge">Your Compatibility Report</div>

      <div className="compatibility-card__percentage">
        {compatibility.overallPercentage}%
      </div>

      <div className="compatibility-card__level">
        {compatibility.compatibilityLevel}
      </div>

      {showNames && (
        <div className="compatibility-card__names">
          {partner1Name} & {partner2Name}
        </div>
      )}

      <p className={showNames? "compatibility-card__description compatibility-card__description-result" : "compatibility-card__description"}>{compatibility.description}</p>

      <img className="compatibility-card__cloud" src="/assets/illos/results-card-cloud.svg" alt="" />
    </div>
  );
}
