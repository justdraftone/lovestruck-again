import { useNavigate } from 'react-router-dom';

export default function CouplesModeSelect() {
  const navigate = useNavigate();

  return (
    <div className="page page--centered gradient-love">
      <div className="container container--couples-mode-select">

        <div className="header header__couples-quiz">
          <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <button onClick={() => navigate('/')} className="back-btn">
            Back
          </button>
        </div>

        <div className="btn-group btn-group--couples-mode-select">
          <button onClick={() => navigate('/couples/together')} className="mode-card">
            <div className="mode-card__inner">
              <img src="/assets/illos/play-together.svg" alt="Play Together" className="mode-card__icon" />
              <div>
                <h3 className="mode-card__title">Play Together</h3>
                <p className="mode-card__desc">Share one device, take turns answering</p>
              </div>
            </div>
          </button>

          <div onClick={() => navigate('/couples/remote')} className="mode-card mode-card--remotely">
            <div className="mode-card__inner">
              <img src="/assets/illos/play-remotely.svg" alt="Play Remotely" className="mode-card__icon" />
              <div>
                <h3 className="mode-card__title">Play Remotely</h3>
                <p className="mode-card__desc">Share a link, play from separate devices</p>
                {/* <p className="mode-card__badge">Coming soon!</p> */}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <div className='highlight-glow highlight-glow--results'></div>

    </div>
  );
}
