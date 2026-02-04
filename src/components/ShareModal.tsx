import { useRef, useCallback } from 'react';
import { Result } from '../data/results';
import ResultCard from './ResultCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: Result;
}

export default function ShareModal({ isOpen, onClose, result }: ShareModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

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
      link.download = `lovestruck-${result.id}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Failed to generate image:', error);
      alert('Failed to download image. Please try again.');
    }
  }, [result.id]);

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
        <div ref={cardRef} className="share-modal__card-wrapper">
          <ResultCard result={result} variant="large" showShareable />
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
      </div>
    </div>
  );
}
