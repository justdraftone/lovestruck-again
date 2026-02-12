import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CtaCard() {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setHidden(docHeight - scrollBottom < 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link to="/letters" className={`cta-card-link ${hidden ? 'cta-card-link--hidden' : ''}`}>
      <div className="cta-card">
        <img className="cta-card__emoji" src="/assets/illos/heart-ball.svg" alt="" />
        <h3 className="cta-card__title">Create a Valentine's Card!</h3>
        <p className="cta-card__desc">Create beautiful letters for your friends and loved ones!</p>
        <span className="cta-card__btn">Create a Letter</span>
      </div>
    </Link>
  );
}
