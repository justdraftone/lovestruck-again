import { useState, useRef, useCallback, useEffect } from 'react';
import { PersonaResult, CompatibilityReport } from '../lib/resultsEngine';
import ResultCard from './ResultCard';
import CompatibilityCard from './CompatibilityCard';
import ValentinesCardCta from './ValentinesCardCta';
import { getPersonaCardVars, couplesCardVars } from '../data/cardSettings';
import { PersonaName } from '../data/personas';
import { trackEvent } from '../lib/analytics';

interface CouplesResultsProps {
  partner1Name: string;
  partner2Name: string;
  partner1Result: PersonaResult;
  partner2Result: PersonaResult;
  compatibility: CompatibilityReport;
  onPlayAgain: () => void;
  currentPartnerNum?: 1 | 2;
}

export default function CouplesResults({
  partner1Name,
  partner2Name,
  partner1Result,
  partner2Result,
  compatibility,
  onPlayAgain,
  currentPartnerNum,
}: CouplesResultsProps) {
  // Start with the current user's card if in remote mode, otherwise partner 1
  const [activePartner, setActivePartner] = useState<1 | 2>(currentPartnerNum || 1);
  const [isFlipping, setIsFlipping] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareCardIndex, setShareCardIndex] = useState(0); // 0: compatibility, 1: partner1, 2: partner2
  const cardRef = useRef<HTMLDivElement>(null);
  const [chemistryDisplay, setChemistryDisplay] = useState(0);
  const [romanceDisplay, setRomanceDisplay] = useState(0);


  // Count up animation for chemistry
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = compatibility.chemistryPercentage / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= compatibility.chemistryPercentage) {
        setChemistryDisplay(compatibility.chemistryPercentage);
        clearInterval(timer);
      } else {
        setChemistryDisplay(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [compatibility.chemistryPercentage]);

  // Count up animation for romance
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = compatibility.romancePercentage / steps;
    const stepDuration = duration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= compatibility.romancePercentage) {
        setRomanceDisplay(compatibility.romancePercentage);
        clearInterval(timer);
      } else {
        setRomanceDisplay(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [compatibility.romancePercentage]);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;

    trackEvent('download_click', { metadata: { type: 'couples_result', cardIndex: shareCardIndex } });

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
      const resultCard = cardRef.current.querySelector('.result-card, .compatibility-card') as HTMLElement;
      const originalPadding = resultCard ? resultCard.style.paddingBottom : '';
      if (resultCard) {
        resultCard.style.paddingBottom = '120px';
      }

      // Dynamic import for html-to-image
      const { toPng } = await import('html-to-image');

      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 3,
        backgroundColor: undefined,
        cacheBust: true,
      });

      // Restore original padding
      if (resultCard) {
        resultCard.style.paddingBottom = originalPadding;
      }

      const link = document.createElement('a');
      link.download = `compatibility-${partner1Name}-${partner2Name}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to download image. Please try again.');
    }
  }, [partner1Name, partner2Name, shareCardIndex]);

  const handleShare = useCallback(async () => {
    const hasNativeShare = 'share' in navigator;
    trackEvent('share_click', { metadata: { type: 'couples_result', method: hasNativeShare ? 'native' : 'whatsapp' } });

    const shareText = `${partner1Name} & ${partner2Name} are ${compatibility.overallPercentage}% compatible! Take the Love Struck Again quiz`;
    const shareUrl = window.location.origin;

    if (hasNativeShare) {
      try {
        await navigator.share({
          title: 'Love Struck Again - Compatibility',
          text: shareText,
          url: shareUrl,
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        shareText + ' ' + shareUrl
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  }, [partner1Name, partner2Name, compatibility.overallPercentage]);

  const handleFlip = () => {
    if (isFlipping) return;
    setIsFlipping(true);

    setTimeout(() => {
      setActivePartner(activePartner === 1 ? 2 : 1);
    }, 150);

    setTimeout(() => {
      setIsFlipping(false);
    }, 300);
  };

  const handleShareCardSwipe = (direction: 'left' | 'right') => {
    console.log('🔄 Swipe called:', direction, 'Current:', shareCardIndex, 'Modal open:', showShareModal);
    if (direction === 'left' && shareCardIndex < 2) {
      const newIdx = shareCardIndex + 1;
      console.log('➡️ Moving to index:', newIdx);
      setShareCardIndex(newIdx);
    } else if (direction === 'right' && shareCardIndex > 0) {
      const newIdx = shareCardIndex - 1;
      console.log('⬅️ Moving to index:', newIdx);
      setShareCardIndex(newIdx);
    }
  };


  const currentPartnerName = activePartner === 1 ? partner1Name : partner2Name;
  const currentResult = activePartner === 1 ? partner1Result : partner2Result;
  const samePersona = partner1Result.name === partner2Result.name;

  return (
    <div className="page page--centered gradient-love" style={{ padding: '32px 24px' }}>
      <div className="header header__quiz header__quiz-couples-results">
        <img src="/assets/illos/d1-x-loveorlies.svg" alt="" onClick={onPlayAgain} style={{ cursor: 'pointer' }} />
      </div>
      
      <div className="couples-results">
        {/* Compatibility Report Card */}
        <CompatibilityCard compatibility={compatibility} />

      {/* Stats Cards */}
      <div className="compatibility-stats">
        <div className="stat-card stat-card--chemistry">
          <div className="stat-card__header">
            <svg className="stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span>Chemistry</span>
          </div>
          <div className="stat-card__percentage">{chemistryDisplay}%</div>
          <p className="stat-card__description">{compatibility.chemistryDescription}</p>
        </div>

        <div className="stat-card stat-card--romance">
          <div className="stat-card__header">
            <svg className="stat-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
            <span>Romance</span>
          </div>
          <div className="stat-card__percentage">{romanceDisplay}%</div>
          <p className="stat-card__description">{compatibility.romanceDescription}</p>
        </div>
      </div>

      {/* Flippable Partner Card */}
      <div className="partner-flip-section">
        <div className="partner-flip-header">
          <h3 className="partner-flip-name">{currentPartnerName}</h3>
          <p className="partner-flip-hint">( tap card to flip )</p>
        </div>

        <div
          className={`partner-flip-container ${isFlipping ? 'partner-flip-container--flipping' : ''}`}
          onClick={handleFlip}
        >
          <ResultCard
            result={currentResult}
            variant="large"
            hidePairings
            samePersona={samePersona}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="couples-results__actions">
        <button onClick={() => { setShowShareModal(true); setShareCardIndex(0); }} className="btn btn--primary btn-homepage couples-results__btn">
          <svg className="couples-results__btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share your results!
        </button>
        <button onClick={onPlayAgain} className="btn btn--primary btn-homepage couples-results__btn">
          Play Again
        </button>
      </div>

      {/* Valentine's Card CTA */}
      <ValentinesCardCta hideOnScroll />
      </div>
      <div className="highlight-glow highlight-glow__couples"></div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="share-modal" onClick={() => { console.log('❌ Modal overlay clicked - closing'); setShowShareModal(false); }}>
          <div className="share-modal__overlay" />

          <div className="share-modal__content" onClick={(e) => e.stopPropagation()}>
            <div
              ref={cardRef}
              className="share-modal__card-wrapper"
              style={(() => {
                const isMobile = window.innerWidth < 768;
                if (shareCardIndex === 0) return couplesCardVars[isMobile ? 'mobile' : 'desktop'] as React.CSSProperties;
                const personaName = (shareCardIndex === 1 ? partner1Result.name : partner2Result.name) as PersonaName;
                return getPersonaCardVars(personaName, isMobile) as React.CSSProperties;
              })()}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                const startX = touch.clientX;

                const handleTouchMove = (moveEvent: TouchEvent) => {
                  const currentX = moveEvent.touches[0].clientX;
                  const diff = startX - currentX;

                  if (Math.abs(diff) > 50) {
                    if (diff > 0) handleShareCardSwipe('left');
                    else handleShareCardSwipe('right');
                    document.removeEventListener('touchmove', handleTouchMove);
                  }
                };

                document.addEventListener('touchmove', handleTouchMove, { once: true });
              }}
            >
              {(() => {
                console.log('📋 Rendering card at index:', shareCardIndex);
                if (shareCardIndex === 0) {
                  console.log('🎯 Rendering CompatibilityCard');
                  return (
                    <CompatibilityCard
                      key="compatibility"
                      compatibility={compatibility}
                      partner1Name={partner1Name}
                      partner2Name={partner2Name}
                      shareable
                    />
                  );
                } else if (shareCardIndex === 1) {
                  console.log('👤 Rendering Partner1 ResultCard:', partner1Result.name);
                  return (
                    <>
                      <ResultCard
                        key="partner1"
                        result={partner1Result}
                        variant="shareable"
                        hidePairings
                        samePersona={samePersona}
                        partnerName={partner1Name}
                      />
                      <div className="share-modal__logo">
                        <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
                      </div>
                    </>
                  );
                } else {
                  console.log('👤 Rendering Partner2 ResultCard:', partner2Result.name);
                  return (
                    <>
                      <ResultCard
                        key="partner2"
                        result={partner2Result}
                        variant="shareable"
                        hidePairings
                        samePersona={samePersona}
                        partnerName={partner2Name}
                      />
                      <div className="share-modal__logo">
                        <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
                      </div>
                    </>
                  );
                }
              })()}
            </div>

            {/* Navigation */}
            <div className="share-modal__navigation" onClick={(e) => e.stopPropagation()}>
              <button
                className="share-modal__nav-btn share-modal__nav-btn--prev"
                onClick={(e) => { e.stopPropagation(); handleShareCardSwipe('right'); }}
                disabled={shareCardIndex === 0}
                aria-label="Previous card"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Card indicators */}
              <div className="share-modal__indicators">
                <button
                  className={`share-modal__indicator ${shareCardIndex === 0 ? 'share-modal__indicator--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setShareCardIndex(0); }}
                  aria-label="Compatibility card"
                />
                <button
                  className={`share-modal__indicator ${shareCardIndex === 1 ? 'share-modal__indicator--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setShareCardIndex(1); }}
                  aria-label={`${partner1Name}'s card`}
                />
                <button
                  className={`share-modal__indicator ${shareCardIndex === 2 ? 'share-modal__indicator--active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setShareCardIndex(2); }}
                  aria-label={`${partner2Name}'s card`}
                />
              </div>

              <button
                className="share-modal__nav-btn share-modal__nav-btn--next"
                onClick={(e) => { e.stopPropagation(); handleShareCardSwipe('left'); }}
                disabled={shareCardIndex === 2}
                aria-label="Next card"
              >
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <div className="share-modal__actions" onClick={(e) => e.stopPropagation()}>
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

            <button onClick={() => setShowShareModal(false)} className="share-modal__close" aria-label="Close">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
