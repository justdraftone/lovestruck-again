import { useState } from 'react';

interface BlurImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export default function BlurImage({ src, className, style, onLoad, ...props }: BlurImageProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <img
      {...props}
      src={src}
      className={className}
      style={{
        ...style,
        filter: loaded ? 'blur(0px)' : 'blur(20px)',
        transition: 'filter 0.5s ease-out',
      }}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
    />
  );
}
