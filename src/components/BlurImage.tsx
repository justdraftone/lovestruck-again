import { useState } from 'react';

interface BlurImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'alt'> {
  src: string;
  /** Required. Pass "" for purely decorative images so the omission is deliberate. */
  alt: string;
}

export default function BlurImage({ src, className, style, onLoad, ...props }: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      src={src}
      decoding="async"
      className={className}
      style={{
        ...style,
        // Fades in on `opacity`, which the compositor handles on its own.
        // This used to transition `filter: blur(20px) -> blur(0px)`, which
        // re-rasterized the full-resolution image on every frame for 500ms —
        // across 17 images on the homepage, several of them very large.
        opacity: loaded ? 1 : 0,
        transition: 'opacity 0.4s ease-out',
      }}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
