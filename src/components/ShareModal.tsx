import { useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PersonaResult } from '../lib/resultsEngine';
import ResultCard from './ResultCard';
import { getPersonaCardVars } from '../data/cardSettings';
import { PersonaName } from '../data/personas';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PersonaResult;
}

export default function ShareModal({ isOpen, onClose, result }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();


  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    try {
      // Wait for fonts to load
      await document.fonts.ready;

      // Wait for all images to load
      const images = cardRef.current.querySelectorAll('img');
      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => resolve(null);
            img.onerror = () => resolve(null);
          });
        })
      );

      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 200));

      // Temporarily add padding to the card (not wrapper) to capture overflow content
      const resultCard = cardRef.current.querySelector('.result-card') as HTMLElement;
      const originalPadding = resultCard ? resultCard.style.paddingBottom : '';
      if (resultCard) {
        resultCard.style.paddingBottom = '120px';
      }

      // Dynamic import for html-to-image
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: null,
        cacheBust: true,
      });

      // Restore original padding
      if (resultCard) {
        resultCard.style.paddingBottom = originalPadding;
      }

      const link = document.createElement('a');
      link.download = `lovestruck-${result.name.replace(/\s+/g, '-').toLowerCase()}.png`;
      link.href = dataUrl;
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

  const isMobile = window.innerWidth < 768;
  const cardVars = getPersonaCardVars(result.name as PersonaName, isMobile);

  return (
    <div className="share-modal" onClick={onClose}>
      <div className="share-modal__overlay" />

      <div className="share-modal__content" onClick={(e) => e.stopPropagation()}>
        <div
          ref={cardRef}
          className="share-modal__card-wrapper"
          style={cardVars as React.CSSProperties}
        >
          <ResultCard result={result} variant="large" showShareable hidePairings />
          <div className="share-modal__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
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
