import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import BlurImage from '../components/BlurImage';

export default function Home() {
  const navigate = useNavigate();
  const reset = useQuizStore((state) => state.reset);

  const handlePlaySolo = () => {
    reset();
    navigate('/solo');
  };

  const handlePlayTogether = () => {
    reset();
    navigate('/couples');
  };

  return (
    <div className="page page--centered gradient-love page--main-homepage">
      <BlurImage src="/assets/illos/cloud-large.png" alt="" className="cloud cloud--large cloud--animate" />
      <BlurImage src="/assets/illos/cloud-large.png" alt="" className="cloud cloud--large-twin flip-h cloud--animate cloud--animate-delay" />
      <BlurImage src="/assets/illos/cloud-small.png" alt="" className="cloud cloud--small cloud--small--1 cloud--animate" />
      <BlurImage src="/assets/illos/cloud-small.png" alt="" className="cloud cloud--small cloud--small--2 cloud--animate cloud--animate-delay" />
      <BlurImage src="/assets/illos/cloud-small.png" alt="" className="cloud cloud--small cloud--small--3 cloud--animate" />
      <BlurImage src="/assets/illos/cloud-small.png" alt="" className="cloud cloud--small cloud--small--4 cloud--animate cloud--animate-delay" />
      <BlurImage src="/assets/illos/cloud-small.png" alt="" className="cloud cloud--small cloud--small--5 cloud--animate" />
      <BlurImage src="/assets/illos/cloud-small.png" alt="" className="cloud cloud--small cloud--small--6 cloud--animate cloud--animate-delay" />

      <BlurImage src="/assets/illos/heart-red.svg" alt="" className="heart heart--1 heart--animate" />
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--2 heart--animate heart--animate-delay-1" />
      <BlurImage src="/assets/illos/heart-red.svg" alt="" className="heart heart--3 heart--animate heart--animate-delay-2" />
      <BlurImage src="/assets/illos/heart-red.svg" alt="" className="heart heart--4 flip-h heart--animate heart--animate-delay-1" />
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--5 flip-h heart--animate heart--animate-delay-2" />
      <a href="/letters" className="heart heart--6 heart--animate letter-cta-floating">
        <div className="cta-card cta-card--floating">
          <img src="/assets/results/heart-ball-1.png" alt="" className="cta-card__heart" />
          <h2 className="cta-card__heading">Create a<br/>Valentine's Card!</h2>
          <p className="cta-card__desc">Create beautiful letters for your<br/>friends and loved ones!</p>
          <span className="cta-card__btn">Create a Letter</span>
        </div>
      </a>
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--7 heart--animate heart--animate-delay-1" />


      <div className="content">
        <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" className="content__collab-logo" />

        {/* Logo clouds that move apart when logo appears */}
        <BlurImage src="/assets/illos/cloud-small.png" alt="" className="logo-cloud logo-cloud--left" />
        <BlurImage src="/assets/illos/cloud-small.png" alt="" className="logo-cloud logo-cloud--right flip-h" />

        <BlurImage className="lovestruck-title-img" src="../../public/assets/illos/love-struck-again-title.png" alt="" loading="lazy" style={{ marginTop: '-70px' }} />
        <p className="subtitle">
          Ever wondered what type of lover you are? Do you have bad character or are you just too elite for the dating pool?
          <br/><br/>Swipe through to discover your true dating fate.
        </p>

        <div className="btn-group">
          <button onClick={handlePlaySolo} className="btn btn--primary btn-homepage">
            Play Solo Quiz
          </button>
          <button onClick={handlePlayTogether} className="btn btn--primary btn-homepage">
            Play Couples' Quiz
          </button>
        </div>

        <p className='home-credits'>Made with ❤️ by DraftOne</p>
      </div>

    </div>
  );
}
