import Lottie from 'lottie-react';
import loaderAnimation from '/loader-animation.json';

export default function Loader() {
  return (
    <div className="loader">
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        autoplay={true}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
