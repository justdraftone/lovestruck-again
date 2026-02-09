import { useRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonaResult } from '../lib/resultsEngine';
import ResultCard from './ResultCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PersonaResult;
}

export default function ShareModal({ isOpen, onClose, result }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Debug controls (unused but kept for future debugging)
  // const [debugMode] = useState(true);
  const [descFontSize] = useState(0.8875);
  const [descLineHeight] = useState(1.5);
  const [descMarginTop] = useState(-55);
  const [descMarginBottom] = useState(16);
  const [logoBottom] = useState(34);
  const [logoOpacity] = useState(0.4);
  const [logoMaxWidth] = useState(115);
  const [logoGrayscale] = useState(0);
  const [cardPaddingTop] = useState(28);
  const [cardPaddingBottom] = useState(92);
  const [cardPaddingSide] = useState(60);
  const [imageSize] = useState(300);
  const [titleSize] = useState(3.4);

  // @ts-ignore - debug function used in commented code
  const copyCSS = () => {
    const css = `
// Share Card Styling
.result-card--shareable {
  padding: ${cardPaddingTop}px ${cardPaddingSide}px ${cardPaddingBottom}px;

  .result-card__desc--large {
    font-size: ${descFontSize}rem;
    line-height: ${descLineHeight};
    margin-top: ${descMarginTop}px;
    margin-bottom: ${descMarginBottom}px;
  }

  .result-card__image--large {
    width: ${imageSize}px;
    height: ${imageSize}px;
  }

  .result-card__name--large {
    font-size: ${titleSize}rem;
  }
}

.share-modal__logo {
  bottom: ${logoBottom}px;

  img {
    max-width: ${logoMaxWidth}px;
    opacity: ${logoOpacity};
    filter: grayscale(${logoGrayscale}%);
  }
}`;
    navigator.clipboard.writeText(css);
    alert('CSS copied to clipboard!');
  };

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // Dynamic import for html2canvas
      const html2canvas = (await import('html2canvas')).default;

      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `lovestruck-${result.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to download image. Please try again.');
    }
  }, [result.name]);

  const handleShare = useCallback(async () => {
    const shareText = `I'm "${result.name}"! Take the Love Struck Again quiz to find your romantic personality`;
    const shareUrl = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Love Struck Again',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled or share failed
        console.log('Share cancelled');
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + ' ' + shareUrl
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [result.name]);

  if (!isOpen) return null;

  return (
    <div className="share-modal" onClick={onClose}>
      <div className="share-modal__overlay" />

      <div className="share-modal__content" onClick={(e) => e.stopPropagation()}>
        <div
          ref={cardRef}
          className="share-modal__card-wrapper"
          style={{
            ['--desc-font-size' as any]: `${descFontSize}rem`,
            ['--desc-line-height' as any]: descLineHeight,
            ['--desc-margin-top' as any]: `${descMarginTop}px`,
            ['--desc-margin-bottom' as any]: `${descMarginBottom}px`,
            ['--logo-bottom' as any]: `${logoBottom}px`,
            ['--logo-opacity' as any]: logoOpacity,
            ['--logo-max-width' as any]: `${logoMaxWidth}px`,
            ['--logo-grayscale' as any]: `${logoGrayscale}%`,
            ['--card-padding-top' as any]: `${cardPaddingTop}px`,
            ['--card-padding-bottom' as any]: `${cardPaddingBottom}px`,
            ['--card-padding-side' as any]: `${cardPaddingSide}px`,
            ['--image-size' as any]: `${imageSize}px`,
            ['--title-size' as any]: `${titleSize}rem`,
          }}
        >
          <ResultCard result={result} variant="large" showShareable hidePairings />
          <div className="share-modal__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/assets/collab-logo.png" alt="Draft One x Love or Lies" />
          </div>
        </div>

        <div className="share-modal__actions">
          <button onClick={handleShare} className="btn btn--primary share-modal__btn">
            <svg className="share-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            Share
          </button>

          <button onClick={handleDownload} className="btn btn--secondary share-modal__btn">
            <svg className="share-modal__icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </button>
        </div>

        <button onClick={onClose} className="share-modal__close" aria-label="Close">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* {debugMode && (
          <div className="share-modal__debug" onClick={(e) => e.stopPropagation()}>
            <div className="share-modal__debug-header">
              <h3>Debug Controls</h3>
              <button onClick={copyCSS} className="btn btn--secondary" style={{width: 'auto', padding: '8px 16px'}}>
                Copy CSS
              </button>
            </div>

            <div className="share-modal__debug-section">
              <h4>Description Text</h4>
              <label>
                Font Size: {descFontSize}rem
                <input type="range" min="0.7" max="1.5" step="0.0625" value={descFontSize} onChange={(e) => setDescFontSize(parseFloat(e.target.value))} />
              </label>
              <label>
                Line Height: {descLineHeight}
                <input type="range" min="1.2" max="2" step="0.1" value={descLineHeight} onChange={(e) => setDescLineHeight(parseFloat(e.target.value))} />
              </label>
              <label>
                Margin Top: {descMarginTop}px
                <input type="range" min="-100" max="0" step="1" value={descMarginTop} onChange={(e) => setDescMarginTop(parseInt(e.target.value))} />
              </label>
              <label>
                Margin Bottom: {descMarginBottom}px
                <input type="range" min="0" max="100" step="1" value={descMarginBottom} onChange={(e) => setDescMarginBottom(parseInt(e.target.value))} />
              </label>
            </div>

            <div className="share-modal__debug-section">
              <h4>Logo</h4>
              <label>
                Bottom Position: {logoBottom}px
                <input type="range" min="0" max="100" step="1" value={logoBottom} onChange={(e) => setLogoBottom(parseInt(e.target.value))} />
              </label>
              <label>
                Opacity: {logoOpacity}
                <input type="range" min="0" max="1" step="0.05" value={logoOpacity} onChange={(e) => setLogoOpacity(parseFloat(e.target.value))} />
              </label>
              <label>
                Max Width: {logoMaxWidth}px
                <input type="range" min="60" max="200" step="5" value={logoMaxWidth} onChange={(e) => setLogoMaxWidth(parseInt(e.target.value))} />
              </label>
              <label>
                Grayscale: {logoGrayscale}%
                <input type="range" min="0" max="100" step="5" value={logoGrayscale} onChange={(e) => setLogoGrayscale(parseInt(e.target.value))} />
              </label>
            </div>

            <div className="share-modal__debug-section">
              <h4>Card Padding</h4>
              <label>
                Top: {cardPaddingTop}px
                <input type="range" min="16" max="80" step="4" value={cardPaddingTop} onChange={(e) => setCardPaddingTop(parseInt(e.target.value))} />
              </label>
              <label>
                Bottom: {cardPaddingBottom}px
                <input type="range" min="40" max="120" step="4" value={cardPaddingBottom} onChange={(e) => setCardPaddingBottom(parseInt(e.target.value))} />
              </label>
              <label>
                Side: {cardPaddingSide}px
                <input type="range" min="16" max="60" step="4" value={cardPaddingSide} onChange={(e) => setCardPaddingSide(parseInt(e.target.value))} />
              </label>
            </div>

            <div className="share-modal__debug-section">
              <h4>Other Elements</h4>
              <label>
                Image Size: {imageSize}px
                <input type="range" min="200" max="400" step="10" value={imageSize} onChange={(e) => setImageSize(parseInt(e.target.value))} />
              </label>
              <label>
                Title Size: {titleSize}rem
                <input type="range" min="2" max="5" step="0.1" value={titleSize} onChange={(e) => setTitleSize(parseFloat(e.target.value))} />
              </label>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
