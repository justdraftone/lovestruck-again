import { Link } from 'react-router-dom';
import { useQuizStore } from '../store/quizStore';
import BlurImage from '../components/BlurImage';
import { useSeo } from '../hooks/useSeo';

export default function Home() {
  useSeo({
    title: 'Love Struck Again \u2014 Find Your Dating Persona',
    description: 'Swipe through 14 dating scenarios and get your official dating diagnosis. Find out which dating persona you are. Free, no signup, takes 2 minutes.',
    canonical: 'https://mylovestruck.com/',
  });

  const reset = useQuizStore((state) => state.reset);

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
      <BlurImage src="/assets/illos/heart-gold.svg" alt="" className="heart heart--7 heart--animate heart--animate-delay-1" />


      <div className="content">
        <img
          src="/assets/illos/d1-x-loveorlies.svg"
          alt="Draft One x Love or Lies"
          className="content__collab-logo"
          width="246"
          height="85"
        />

        {/* Logo clouds that move apart when logo appears */}
        <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="logo-cloud logo-cloud--left" />
        <BlurImage src="/assets/illos/cloud-small.webp" alt="" className="logo-cloud logo-cloud--right flip-h" />

        <h1 className="lovestruck-title">
          <BlurImage
            className="lovestruck-title-img"
            src="/assets/illos/love-struck-again-title.webp"
            alt="Love Struck Again"
            loading="eager"
            fetchPriority="high"
            width={978}
            height={606}
          />
        </h1>

        <div className="subtitle">
          <p>Are you the problem, or is everyone just unserious?</p>
          <p>Find out what kind of lover you are and get your official dating diagnosis.</p>
        </div>

        <div className="btn-group">
          <Link to="/solo" onClick={reset} className="btn btn--primary btn-homepage">
            Play Solo Quiz
          </Link>
          <Link to="/couples" onClick={reset} className="btn btn--primary btn-homepage">
            Play Couples' Quiz
          </Link>
        </div>

        <p className='home-credits'>
          Made with ❤️ by <a href="https://justdraftone.xyz/" target="_blank" rel="noopener noreferrer">DraftOne</a>
          {' · '}<Link to="/letters">Valentine's cards</Link>
          {' · '}<Link to="/privacy">Privacy</Link>
        </p>
      </div>

    </div>
  );
}
