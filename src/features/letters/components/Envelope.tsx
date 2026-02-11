import { useState, useRef } from 'react';

interface PositionedAsset {
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
}

interface EnvelopeProps {
  recipientName?: string;
  content: string;
  senderName?: string;
  imageData?: PositionedAsset;
  stickers?: PositionedAsset[];
  onAnimationComplete?: () => void;
}

type AnimationStage = 'closed' | 'flap-open' | 'slide-out';

// Animation timing constants
const LETTER_SLIDE_TIME = 1000; // 1.0s

export default function Envelope({
  recipientName,
  content,
  senderName,
  imageData,
  stickers,
  onAnimationComplete
}: EnvelopeProps) {
  const [stage, setStage] = useState<AnimationStage>('closed');
  const letterRef = useRef<HTMLDivElement>(null);

  const open = () => {
    if (stage !== 'closed') return;

    // 1. FLAP OPEN (0ms)
    setStage('flap-open');

    // 2. LETTER SLIDE OUT (Start after flap transition: 200ms buffer)
    setTimeout(() => {
      setStage('slide-out');

      if (onAnimationComplete) {
        // Call after slide animation completes
        setTimeout(onAnimationComplete, LETTER_SLIDE_TIME);
      }
    }, 200);
  };

  const handleToggle = () => {
    if (stage === 'closed') {
      open();
    }
  };

  // Determine CSS classes
  const envelopeClass = stage === 'closed' ? 'close' : 'open';

  // Letter classes
  let letterClasses = 'letter-single';

  if (stage === 'slide-out') {
    letterClasses += ' slide-out';
  }

  return (
    <div className="envelope-wrapper">
      {/* Envelope Container */}
      <div id="envelope" className={envelopeClass} onClick={handleToggle}>
        <div className="flap-top-shadow-wrapper">
          <div className="front flap"></div>
        </div>
        <div className="flap-bottom-shadow-wrapper">
          <div className="front pocket"></div>
        </div>
        <div
          className={letterClasses}
          ref={letterRef}
          style={{ cursor: 'default' }}
        >
          {/* Single Letter Sheet */}
          <div className="letter-paper letter-paper--open">
            <h2 className="letter-paper__greeting">
              Dear {recipientName || '____'},
            </h2>
            <p className="letter-paper__content">{content}</p>
            <p className="letter-paper__signature">
              Love, {senderName || '____'}
            </p>
            {imageData && (
              <div
                className="letter-paper__image"
                style={{
                  position: 'absolute',
                  left: `${imageData.position.x}px`,
                  top: `${imageData.position.y}px`,
                  width: `${imageData.size.width}px`,
                  height: `${imageData.size.height}px`,
                  transform: `rotate(${imageData.rotation}deg)`
                }}
              >
                <img src={imageData.src} alt="Attached" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            )}
            {stickers?.map((sd, i) => (
              <div
                key={i}
                className="letter-paper__sticker"
                style={{
                  position: 'absolute',
                  left: `${sd.position.x}px`,
                  top: `${sd.position.y}px`,
                  width: `${sd.size.width}px`,
                  height: `${sd.size.height}px`,
                  transform: `rotate(${sd.rotation}deg)`,
                  pointerEvents: 'none'
                }}
              >
                <img src={sd.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      {stage === 'closed' && (
        <p className="envelope__hint">Click to Open</p>
      )}
    </div>
  );
}
