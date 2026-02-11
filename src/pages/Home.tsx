import { useNavigate } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import BlurImage from '../components/BlurImage';
import ValentinesCardCta from '../components/ValentinesCardCta';

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

  const handleCreateLetter = () => {
    navigate('/letters');
  };

  return (
    <div className="page page--centered gradient-love page--main-homepage">
      <BlurImage src="/assets/illos/cloud-large.webp" alt="" className="cloud cloud--large cloud--animate" />
      <BlurImage src="/assets/illos/cloud-large.webp" alt="" className="cloud cloud--large-twin flip-h cloud--animate cloud--animate-delay" />
      <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="cloud cloud--small cloud--small--1 cloud--animate" />
      <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="cloud cloud--small cloud--small--2 cloud--animate cloud--animate-delay" />
      <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="cloud cloud--small cloud--small--3 cloud--animate" />
      <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="cloud cloud--small cloud--small--4 cloud--animate cloud--animate-delay" />
      <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="cloud cloud--small cloud--small--5 cloud--animate" />
      <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="cloud cloud--small cloud--small--6 cloud--animate cloud--animate-delay" />

      <BlurImage src="/assets/illos/heart-red.svg" alt="" className="heart heart--1 heart--animate" />
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--2 heart--animate heart--animate-delay-1" />
      <BlurImage src="/assets/illos/heart-red.svg" alt="" className="heart heart--3 heart--animate heart--animate-delay-2" />
      <BlurImage src="/assets/illos/heart-red.svg" alt="" className="heart heart--4 flip-h heart--animate heart--animate-delay-1" />
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--5 flip-h heart--animate heart--animate-delay-2" />
      <ValentinesCardCta variant="floating" animated />
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--7 heart--animate heart--animate-delay-1" />


      <div className="content">
        <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" className="content__collab-logo" />

        {/* Logo clouds that move apart when logo appears */}
        <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="logo-cloud logo-cloud--left" />
        <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="logo-cloud logo-cloud--right flip-h" />

        <BlurImage className="lovestruck-title-img" src="/assets/illos/love-struck-again-title.webp" alt="" loading="lazy" style={{ marginTop: '-70px' }} />
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
          <button onClick={handleCreateLetter} className="btn btn--primary btn-homepage btn-homepage--letter">
            <img src="/assets/results/heart-ball-1.webp" alt="" className="btn-homepage__heart" />
            Create a Letter
          </button>
        </div>

        <p className='home-credits'>Made with ❤️ by <a href="https://justdraftone.xyz/" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>DraftOne</a></p>
      </div>

    </div>
  );
}
