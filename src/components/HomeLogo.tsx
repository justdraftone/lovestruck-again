interface HomeLogoProps {
  onActivate: () => void;
  className?: string;
}

/**
 * The collab wordmark used as a "back to home" affordance in page headers.
 *
 * Renders a bare <img> on purpose: several header rules in index.scss select
 * `.header > img` directly, so wrapping it in an anchor would break their
 * layout. Instead it carries the button semantics and keyboard handling that
 * a plain clickable <img> was missing.
 */
export default function HomeLogo({ onActivate, className }: HomeLogoProps) {
  return (
    <img
      src="/assets/illos/d1-x-loveorlies.svg"
      alt="Draft One x Love or Lies — back to home"
      className={className}
      width={246}
      height={85}
      role="button"
      tabIndex={0}
      onClick={onActivate}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onActivate();
        }
      }}
      style={{ cursor: 'pointer' }}
    />
  );
}
