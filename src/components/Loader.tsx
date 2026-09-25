import { useEffect, useState } from 'react';
import type { ComponentType } from 'react';

type LottieProps = {
  animationData: unknown;
  loop?: boolean;
  autoplay?: boolean;
  style?: React.CSSProperties;
};

let cached: { Lottie: ComponentType<LottieProps>; data: unknown } | null = null;

/**
 * The branded Lottie animation is ~400KB (lottie-web plus the animation JSON).
 * Statically importing it here put all of that into every chunk that renders a
 * loading state. Loading it on demand keeps it off the critical path; a CSS
 * pulse covers the few frames before it arrives.
 */
export default function Loader() {
  const [lottie, setLottie] = useState(cached);

  useEffect(() => {
    if (cached) return;
    let cancelled = false;
    Promise.all([import('lottie-react'), import('../loader-animation.json')])
      .then(([mod, anim]) => {
        cached = { Lottie: mod.default as ComponentType<LottieProps>, data: anim.default };
        if (!cancelled) setLottie(cached);
      })
      .catch(() => {
        /* keep the CSS fallback */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const Lottie = lottie?.Lottie;

  return (
    <div className="loader" role="status" aria-label="Loading">
      {Lottie && lottie ? (
        <Lottie
          animationData={lottie.data}
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      ) : (
        <div className="loader__pulse" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      )}
    </div>
  );
}
