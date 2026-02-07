import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ValentinesCardCtaProps {
  variant?: 'floating' | 'fixed';
  animated?: boolean;
  hideOnScroll?: boolean;
}

export default function ValentinesCardCta({
  variant = 'fixed',
  animated = false,
  hideOnScroll = false,
}: ValentinesCardCtaProps) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!hideOnScroll) return;

    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const docHeight = document.documentElement.scrollHeight;
      setHidden(docHeight - scrollBottom < 150);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hideOnScroll]);

  const wrapperClasses = variant === 'floating'
    ? `heart heart--6 ${animated ? 'heart--animate' : ''} letter-cta-floating`
    : `cta-card-link ${hideOnScroll && hidden ? 'cta-card-link--hidden' : ''}`;

  const content = (
    <div className="cta-card cta-card--floating">
      <img
        src="/assets/results/heart-ball-1.png"
        alt=""
        className="cta-card__heart"
      />
      <h2 className="cta-card__heading">
        Create a<br/>Valentine's Card!
      </h2>
      <p className="cta-card__desc">
        Create beautiful letters for your<br/>friends and loved ones!
      </p>
      <span className="cta-card__btn">Create a Letter</span>
    </div>
  );

  // Use regular anchor tag for floating variant to match homepage
  if (variant === 'floating') {
    return (
      <a href="/letters" className={wrapperClasses}>
        {content}
      </a>
    );
  }

  // Use React Router Link for fixed variant
  return (
    <Link to="/letters" className={wrapperClasses}>
      {content}
    </Link>
  );
}
