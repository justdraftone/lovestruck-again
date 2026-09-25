import { Link, useNavigate } from 'react-router-dom';

import { useSeo } from '../hooks/useSeo';
import HomeLogo from '../components/HomeLogo';
export default function CouplesModeSelect() {
  useSeo({
    title: 'Couples Compatibility Quiz — Love Struck Again',
    description: 'Take the couples quiz together on one phone or from separate devices. Get both of your dating personas plus a compatibility score and breakdown.',
  });

  const navigate = useNavigate();

  return (
    <div className="page page--centered gradient-love">
      <h1 className="visually-hidden">Play the Couples Compatibility Quiz</h1>
      <div className="container container--couples-mode-select">

        <div className="header header__couples-quiz">
          <HomeLogo onActivate={() => navigate('/')} />
          <button onClick={() => navigate('/')} className="back-btn">
            Back
          </button>
        </div>

        <div className="btn-group btn-group--couples-mode-select">
          <Link to="/couples/together" className="mode-card">
            <div className="mode-card__inner">
              <img src="/assets/illos/play-together.svg" alt="Play Together" className="mode-card__icon" />
              <div>
                <h3 className="mode-card__title">Play Together</h3>
                <p className="mode-card__desc">Share one device, take turns answering</p>
              </div>
            </div>
          </Link>

          <Link to="/couples/remote" className="mode-card mode-card--remotely">
            <div className="mode-card__inner">
              <img src="/assets/illos/play-remotely.svg" alt="Play Remotely" className="mode-card__icon" />
              <div>
                <h3 className="mode-card__title">Play Remotely</h3>
                <p className="mode-card__desc">Share a link, play from separate devices</p>
                {/* <p className="mode-card__badge">Coming soon!</p> */}
              </div>
            </div>
          </Link>
          
        </div>
      </div>

      <div className='highlight-glow highlight-glow--results'></div>

    </div>
  );
}
