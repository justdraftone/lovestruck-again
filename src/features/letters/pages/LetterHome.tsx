import { useNavigate } from 'react-router-dom';

export default function LetterHome() {
  const navigate = useNavigate();

  return (
    <div className="page page--centered gradient-love">
      <div className="letter-home">
      <div className="header">
        <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" />
      </div>

        <div className="letter-home__content">
          <h1 className="letter-home__title">Create a Valentine's Card!</h1>
          <p className="letter-home__subtitle">
            Create beautiful letters for your friends and loved ones!
          </p>

          <div className="letter-home__buttons">
            <button
              onClick={() => navigate('/letters/create')}
              className="btn btn--primary btn-homepage"
            >
              Create a Letter
            </button>
            <button
              onClick={() => navigate('/letters/open')}
              className="btn btn--primary btn-homepage"
            >
              Open a Letter
            </button>
          </div>

          <p className="letter-home__credits">
            Made with ❤️ by draftone
          </p>
        </div>

      </div>

      <div className="letter-home__decoration letter-home__decoration--left letter-home-illo">
        <img src="/assets/illos/letters-envelope.svg" alt="" />
      </div>
      <div className="letter-home__decoration letter-home__decoration--right letter-home-illo">
        <img src="/assets/illos/letters-envelope.svg" alt="" />
      </div>

      <div className="highlight-glow"></div>
    </div>
  );
}
