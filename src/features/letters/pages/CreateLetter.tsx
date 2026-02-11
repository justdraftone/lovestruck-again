import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';
import { trackEvent } from '../../../lib/analytics';

const STICKERS = [
  { src: '/assets/illos/heart-red.svg', label: 'Red heart' },
  { src: '/assets/illos/heart-gold.svg', label: 'Gold heart' },
  { src: '/assets/illos/heart-ball.svg', label: 'Heart ball' },
];

export default function CreateLetter() {
  const navigate = useNavigate();
  const { createLetter } = useLetterStore();
  const [recipientName, setRecipientName] = useState('');
  const [senderName, setSenderName] = useState('');
  const [content, setContent] = useState('');

  // Image state
  const [image, setImage] = useState<string | undefined>();
  const [imagePosition, setImagePosition] = useState({ x: 200, y: 200 });
  const [imageSize, setImageSize] = useState({ width: 200, height: 200 });
  const [imageRotation, setImageRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [rotateStart, setRotateStart] = useState({ angle: 0, x: 0, y: 0 });

  // Sticker state
  const [sticker, setSticker] = useState<string | undefined>();
  const [stickerPosition, setStickerPosition] = useState({ x: 320, y: 80 });
  const [stickerSize, setStickerSize] = useState({ width: 100, height: 100 });
  const [stickerRotation, setStickerRotation] = useState(0);
  const [isStickerDragging, setIsStickerDragging] = useState(false);
  const [isStickerResizing, setIsStickerResizing] = useState(false);
  const [isStickerRotating, setIsStickerRotating] = useState(false);
  const [stickerDragOffset, setStickerDragOffset] = useState({ x: 0, y: 0 });
  const [stickerResizeStart, setStickerResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [stickerRotateStart, setStickerRotateStart] = useState({ angle: 0, x: 0, y: 0 });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Image handlers ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    setImagePosition({ x: 200, y: 200 });
    setImageSize({ width: 200, height: 200 });
    setImageRotation(0);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleImageTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(true);
    setDragOffset({ x: touch.clientX - imagePosition.x, y: touch.clientY - imagePosition.y });
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); setIsResizing(true);
    setResizeStart({ width: imageSize.width, height: imageSize.height, x: e.clientX, y: e.clientY });
  };

  const handleResizeTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(false); setIsResizing(true);
    setResizeStart({ width: imageSize.width, height: imageSize.height, x: touch.clientX, y: touch.clientY });
  };

  const handleRotateMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsDragging(false); setIsRotating(true);
    const centerX = imagePosition.x + imageSize.width / 2;
    const centerY = imagePosition.y + imageSize.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    setRotateStart({ angle: angle - imageRotation, x: centerX, y: centerY });
  };

  const handleRotateTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    setIsDragging(false); setIsRotating(true);
    const centerX = imagePosition.x + imageSize.width / 2;
    const centerY = imagePosition.y + imageSize.height / 2;
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
    setRotateStart({ angle: angle - imageRotation, x: centerX, y: centerY });
  };

  // --- Sticker handlers ---
  const handleStickerSelect = (src: string) => {
    setSticker(src);
    setStickerPosition({ x: 320, y: 80 });
    setStickerSize({ width: 100, height: 100 });
    setStickerRotation(0);
  };

  const handleRemoveSticker = () => { setSticker(undefined); };

  const handleStickerMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsStickerDragging(true);
    setStickerDragOffset({ x: e.clientX - stickerPosition.x, y: e.clientY - stickerPosition.y });
  };

  const handleStickerTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    setIsStickerDragging(true);
    setStickerDragOffset({ x: touch.clientX - stickerPosition.x, y: touch.clientY - stickerPosition.y });
  };

  const handleStickerResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsStickerDragging(false); setIsStickerResizing(true);
    setStickerResizeStart({ width: stickerSize.width, height: stickerSize.height, x: e.clientX, y: e.clientY });
  };

  const handleStickerResizeTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    setIsStickerDragging(false); setIsStickerResizing(true);
    setStickerResizeStart({ width: stickerSize.width, height: stickerSize.height, x: touch.clientX, y: touch.clientY });
  };

  const handleStickerRotateMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsStickerDragging(false); setIsStickerRotating(true);
    const centerX = stickerPosition.x + stickerSize.width / 2;
    const centerY = stickerPosition.y + stickerSize.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * 180 / Math.PI;
    setStickerRotateStart({ angle: angle - stickerRotation, x: centerX, y: centerY });
  };

  const handleStickerRotateTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); e.stopPropagation();
    const touch = e.touches[0];
    setIsStickerDragging(false); setIsStickerRotating(true);
    const centerX = stickerPosition.x + stickerSize.width / 2;
    const centerY = stickerPosition.y + stickerSize.height / 2;
    const angle = Math.atan2(touch.clientY - centerY, touch.clientX - centerX) * 180 / Math.PI;
    setStickerRotateStart({ angle: angle - stickerRotation, x: centerX, y: centerY });
  };

  // --- Shared move/up handlers ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setImagePosition({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y });
    } else if (isResizing) {
      const delta = Math.max(e.clientX - resizeStart.x, e.clientY - resizeStart.y);
      setImageSize({ width: Math.max(50, resizeStart.width + delta), height: Math.max(50, resizeStart.height + delta) });
    } else if (isRotating) {
      const angle = Math.atan2(e.clientY - rotateStart.y, e.clientX - rotateStart.x) * 180 / Math.PI;
      setImageRotation(angle - rotateStart.angle);
    } else if (isStickerDragging) {
      setStickerPosition({ x: e.clientX - stickerDragOffset.x, y: e.clientY - stickerDragOffset.y });
    } else if (isStickerResizing) {
      const delta = Math.max(e.clientX - stickerResizeStart.x, e.clientY - stickerResizeStart.y);
      setStickerSize({ width: Math.max(40, stickerResizeStart.width + delta), height: Math.max(40, stickerResizeStart.height + delta) });
    } else if (isStickerRotating) {
      const angle = Math.atan2(e.clientY - stickerRotateStart.y, e.clientX - stickerRotateStart.x) * 180 / Math.PI;
      setStickerRotation(angle - stickerRotateStart.angle);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging || isResizing || isRotating || isStickerDragging || isStickerResizing || isStickerRotating) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    if (isDragging) {
      setImagePosition({ x: touch.clientX - dragOffset.x, y: touch.clientY - dragOffset.y });
    } else if (isResizing) {
      const delta = Math.max(touch.clientX - resizeStart.x, touch.clientY - resizeStart.y);
      setImageSize({ width: Math.max(50, resizeStart.width + delta), height: Math.max(50, resizeStart.height + delta) });
    } else if (isRotating) {
      const angle = Math.atan2(touch.clientY - rotateStart.y, touch.clientX - rotateStart.x) * 180 / Math.PI;
      setImageRotation(angle - rotateStart.angle);
    } else if (isStickerDragging) {
      setStickerPosition({ x: touch.clientX - stickerDragOffset.x, y: touch.clientY - stickerDragOffset.y });
    } else if (isStickerResizing) {
      const delta = Math.max(touch.clientX - stickerResizeStart.x, touch.clientY - stickerResizeStart.y);
      setStickerSize({ width: Math.max(40, stickerResizeStart.width + delta), height: Math.max(40, stickerResizeStart.height + delta) });
    } else if (isStickerRotating) {
      const angle = Math.atan2(touch.clientY - stickerRotateStart.y, touch.clientX - stickerRotateStart.x) * 180 / Math.PI;
      setStickerRotation(angle - stickerRotateStart.angle);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false); setIsResizing(false); setIsRotating(false);
    setIsStickerDragging(false); setIsStickerResizing(false); setIsStickerRotating(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false); setIsResizing(false); setIsRotating(false);
    setIsStickerDragging(false); setIsStickerResizing(false); setIsStickerRotating(false);
  };

  const handleDone = () => {
    if (!content.trim()) return;
    const imageData = image ? { src: image, position: imagePosition, size: imageSize, rotation: imageRotation } : undefined;
    const stickerData = sticker ? { src: sticker, position: stickerPosition, size: stickerSize, rotation: stickerRotation } : undefined;
    const letterId = createLetter(content.trim(), recipientName.trim(), senderName.trim(), imageData, stickerData);
    trackEvent('letter_create', { metadata: { hasImage: !!image, hasSticker: !!sticker, letterId } });
    navigate(`/letters/send/${letterId}`);
  };

  return (
    <div className="page gradient-love">
      <div className="letter-create">
        <div className="letter-create__header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <div className="letter-create__actions">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn btn--primary btn-homepage letter-create__action-btn"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={handleDone}
              className="btn btn--primary btn-homepage letter-create__done-btn"
              disabled={!content.trim()}
            >
              Done
            </button>
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />

        <div className="letter-create__body">
          <div className="letter-create__card" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <div className="letter-create__content">
              <h2 className="letter-create__greeting">
                Dear{' '}
                <input type="text" className="letter-create__line-input" placeholder="name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                ,
              </h2>
              <textarea
                className="letter-create__textarea"
                placeholder="Write your beautiful letter here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={8}
              />
              <p className="letter-create__signature">
                Love,{' '}
                <input type="text" className="letter-create__line-input" placeholder="your name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
              </p>

              {image && (
                <div
                  className="letter-create__image-preview"
                  style={{ position: 'absolute', left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `${imageSize.width}px`, height: `${imageSize.height}px`, transform: `rotate(${imageRotation}deg)`, cursor: isDragging ? 'grabbing' : 'grab' }}
                  onMouseDown={handleImageMouseDown}
                  onTouchStart={handleImageTouchStart}
                >
                  <img src={image} alt="Attached" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <div className="letter-create__resize-handle" onMouseDown={handleResizeMouseDown} onTouchStart={handleResizeTouchStart} style={{ cursor: 'nwse-resize' }} />
                  <div className="letter-create__rotate-handle" onMouseDown={handleRotateMouseDown} onTouchStart={handleRotateTouchStart} style={{ cursor: 'grab' }}>
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <button onClick={handleRemoveImage} className="letter-create__image-remove" aria-label="Remove image">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}

              {sticker && (
                <div
                  className="letter-create__sticker-preview"
                  style={{ position: 'absolute', left: `${stickerPosition.x}px`, top: `${stickerPosition.y}px`, width: `${stickerSize.width}px`, height: `${stickerSize.height}px`, transform: `rotate(${stickerRotation}deg)`, cursor: isStickerDragging ? 'grabbing' : 'grab' }}
                  onMouseDown={handleStickerMouseDown}
                  onTouchStart={handleStickerTouchStart}
                >
                  <img src={sticker} alt="Sticker" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                  <div className="letter-create__resize-handle" onMouseDown={handleStickerResizeMouseDown} onTouchStart={handleStickerResizeTouchStart} style={{ cursor: 'nwse-resize' }} />
                  <div className="letter-create__rotate-handle" onMouseDown={handleStickerRotateMouseDown} onTouchStart={handleStickerRotateTouchStart} style={{ cursor: 'grab' }}>
                    <svg width="16" height="16" fill="none" stroke="white" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <button onClick={handleRemoveSticker} className="letter-create__image-remove" aria-label="Remove sticker">
                    <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="letter-create__sticker-picker">
            <h3 className="letter-create__sticker-title">choose a sticker</h3>
            <div className="letter-create__sticker-grid">
              {STICKERS.map((s) => (
                <button
                  key={s.src}
                  className={`letter-create__sticker-option${sticker === s.src ? ' letter-create__sticker-option--active' : ''}`}
                  onClick={() => handleStickerSelect(s.src)}
                  aria-label={s.label}
                >
                  <img src={s.src} alt={s.label} />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="highlight-glow"></div>
    </div>
  );
}
