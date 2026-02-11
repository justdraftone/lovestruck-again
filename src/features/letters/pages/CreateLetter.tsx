import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';
import { trackEvent } from '../../../lib/analytics';

const STICKERS = [
  { src: '/assets/illos/heart-red.svg', label: 'Red heart' },
  { src: '/assets/illos/heart-gold.svg', label: 'Gold heart' },
  { src: '/assets/illos/heart-ball.svg', label: 'Heart ball' },
  { src: '/assets/results/heart-fire.svg', label: 'Heart fire' },
  { src: '/assets/results/heart-pizza.svg', label: 'Heart pizza' },
];

type Corner = 'tl' | 'tr' | 'bl' | 'br';

interface StickerItem {
  id: string;
  src: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
}

interface ResizeState {
  corner: Corner;
  width: number; height: number;
  posX: number; posY: number;
  mouseX: number; mouseY: number;
}

interface RotateState {
  offset: number; // rotateStart = initial_angle + initial_rotation
  cx: number; cy: number;
}

const CORNER_CURSORS: Record<Corner, string> = {
  tl: 'nwse-resize', tr: 'nesw-resize',
  bl: 'nesw-resize', br: 'nwse-resize',
};

function applyCornerResize(rs: ResizeState, mouseX: number, mouseY: number) {
  const dX = mouseX - rs.mouseX;
  const dY = mouseY - rs.mouseY;
  let w = rs.width, h = rs.height, x = rs.posX, y = rs.posY;
  if (rs.corner === 'br') { w += dX; h += dY; }
  else if (rs.corner === 'bl') { w -= dX; x += dX; h += dY; }
  else if (rs.corner === 'tr') { w += dX; h -= dY; y += dY; }
  else if (rs.corner === 'tl') { w -= dX; x += dX; h -= dY; y += dY; }
  w = Math.max(40, w); h = Math.max(40, h);
  return { size: { width: w, height: h }, position: { x, y } };
}

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
  const [imageAction, setImageAction] = useState<'drag' | 'resize' | 'rotate' | null>(null);
  const [imageDragOffset, setImageDragOffset] = useState({ x: 0, y: 0 });
  const [imageResizeState, setImageResizeState] = useState<ResizeState | null>(null);
  const [imageRotateState, setImageRotateState] = useState<RotateState | null>(null);

  // Stickers array state
  const [stickers, setStickers] = useState<StickerItem[]>([]);
  const [activeStickerIndex, setActiveStickerIndex] = useState<number | null>(null);
  const [stickerAction, setStickerAction] = useState<'drag' | 'resize' | 'rotate' | null>(null);
  const [stickerDragOffset, setStickerDragOffset] = useState({ x: 0, y: 0 });
  const [stickerResizeState, setStickerResizeState] = useState<ResizeState | null>(null);
  const [stickerRotateState, setStickerRotateState] = useState<RotateState | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSticker = (index: number, updates: Partial<StickerItem>) =>
    setStickers(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s));

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
    setImage(undefined); setImageAction(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleImageMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageAction('drag');
    setImageDragOffset({ x: e.clientX - imagePosition.x, y: e.clientY - imagePosition.y });
  };

  const handleImageCornerDown = (e: React.MouseEvent, corner: Corner) => {
    e.preventDefault(); e.stopPropagation();
    setImageAction('resize');
    setImageResizeState({ corner, width: imageSize.width, height: imageSize.height, posX: imagePosition.x, posY: imagePosition.y, mouseX: e.clientX, mouseY: e.clientY });
  };

  const handleImageRotateDown = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    const cx = imagePosition.x + imageSize.width / 2;
    const cy = imagePosition.y + imageSize.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    setImageAction('rotate');
    setImageRotateState({ offset: angle + imageRotation, cx, cy });
  };

  // --- Sticker handlers ---
  const handleStickerSelect = (src: string) => {
    const off = stickers.length * 24;
    setStickers(prev => [...prev, { id: `${Date.now()}-${Math.random()}`, src, position: { x: 160 + off, y: 160 + off }, size: { width: 100, height: 100 }, rotation: 0 }]);
    setActiveStickerIndex(stickers.length);
  };

  const handleRemoveSticker = (index: number) => {
    setStickers(prev => prev.filter((_, i) => i !== index));
    setActiveStickerIndex(null); setStickerAction(null);
  };

  const handleStickerMouseDown = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    setActiveStickerIndex(index); setStickerAction('drag');
    setStickerDragOffset({ x: e.clientX - stickers[index].position.x, y: e.clientY - stickers[index].position.y });
  };

  const handleStickerCornerDown = (e: React.MouseEvent, index: number, corner: Corner) => {
    e.preventDefault(); e.stopPropagation();
    const s = stickers[index];
    setActiveStickerIndex(index); setStickerAction('resize');
    setStickerResizeState({ corner, width: s.size.width, height: s.size.height, posX: s.position.x, posY: s.position.y, mouseX: e.clientX, mouseY: e.clientY });
  };

  const handleStickerRotateDown = (e: React.MouseEvent, index: number) => {
    e.preventDefault(); e.stopPropagation();
    const s = stickers[index];
    const cx = s.position.x + s.size.width / 2;
    const cy = s.position.y + s.size.height / 2;
    const angle = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI;
    setActiveStickerIndex(index); setStickerAction('rotate');
    setStickerRotateState({ offset: angle + s.rotation, cx, cy });
  };

  // --- Shared move/up handlers ---
  const handleMouseMove = (e: React.MouseEvent) => {
    if (imageAction === 'drag') {
      setImagePosition({ x: e.clientX - imageDragOffset.x, y: e.clientY - imageDragOffset.y });
    } else if (imageAction === 'resize' && imageResizeState) {
      const { size, position } = applyCornerResize(imageResizeState, e.clientX, e.clientY);
      setImageSize(size); setImagePosition(position);
    } else if (imageAction === 'rotate' && imageRotateState) {
      const angle = Math.atan2(e.clientY - imageRotateState.cy, e.clientX - imageRotateState.cx) * 180 / Math.PI;
      setImageRotation(imageRotateState.offset - angle);
    } else if (activeStickerIndex !== null) {
      if (stickerAction === 'drag') {
        updateSticker(activeStickerIndex, { position: { x: e.clientX - stickerDragOffset.x, y: e.clientY - stickerDragOffset.y } });
      } else if (stickerAction === 'resize' && stickerResizeState) {
        const { size, position } = applyCornerResize(stickerResizeState, e.clientX, e.clientY);
        updateSticker(activeStickerIndex, { size, position });
      } else if (stickerAction === 'rotate' && stickerRotateState) {
        const angle = Math.atan2(e.clientY - stickerRotateState.cy, e.clientX - stickerRotateState.cx) * 180 / Math.PI;
        updateSticker(activeStickerIndex, { rotation: stickerRotateState.offset - angle });
      }
    }
  };

  const handleMouseUp = () => {
    setImageAction(null);
    setStickerAction(null);
  };

  const handleDone = () => {
    if (!content.trim()) return;
    const imageData = image ? { src: image, position: imagePosition, size: imageSize, rotation: imageRotation } : undefined;
    const stickerDatas = stickers.length > 0
      ? stickers.map(s => ({ src: s.src, position: s.position, size: s.size, rotation: s.rotation }))
      : undefined;
    const letterId = createLetter(content.trim(), recipientName.trim(), senderName.trim(), imageData, stickerDatas);
    trackEvent('letter_create', { metadata: { hasImage: !!image, stickerCount: stickers.length, letterId } });
    navigate(`/letters/send/${letterId}`);
  };

  const renderCornerHandles = (
    onCorner: (e: React.MouseEvent, c: Corner) => void,
    onRotate: (e: React.MouseEvent) => void,
    onRemove: () => void
  ) => (
    <>
      {(['tl', 'tr', 'bl', 'br'] as Corner[]).map(c => (
        <div
          key={c}
          className={`letter-create__corner-handle letter-create__corner-handle--${c}`}
          onMouseDown={(e) => onCorner(e, c)}
          style={{ cursor: CORNER_CURSORS[c] }}
        />
      ))}
      <div className="letter-create__rotate-handle" onMouseDown={onRotate}>
        <svg width="14" height="14" fill="none" stroke="white" viewBox="0 0 24 24" style={{ pointerEvents: 'none' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <button className="letter-create__image-remove" onClick={onRemove} aria-label="Remove">
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </>
  );

  return (
    <div className="page gradient-love">
      <div className="letter-create">
        <div className="letter-create__header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <div className="letter-create__actions">
            <button onClick={() => fileInputRef.current?.click()} className="btn btn--primary btn-homepage letter-create__action-btn">
              <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button onClick={handleDone} className="btn btn--primary btn-homepage letter-create__done-btn" disabled={!content.trim()}>
              Done
            </button>
          </div>
        </div>

        <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" style={{ display: 'none' }} />

        <div className="letter-create__body">
          <div
            className="letter-create__card"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div className="letter-create__content">
              <h2 className="letter-create__greeting">
                Dear{' '}
                <input type="text" className="letter-create__line-input" placeholder="name" value={recipientName} onChange={(e) => setRecipientName(e.target.value)} />
                ,
              </h2>
              <textarea className="letter-create__textarea" placeholder="Write your beautiful letter here..." value={content} onChange={(e) => setContent(e.target.value)} rows={8} />
              <p className="letter-create__signature">
                Love,{' '}
                <input type="text" className="letter-create__line-input" placeholder="your name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
              </p>

              {image && (
                <div
                  className="letter-create__image-preview"
                  style={{ position: 'absolute', left: `${imagePosition.x}px`, top: `${imagePosition.y}px`, width: `${imageSize.width}px`, height: `${imageSize.height}px`, transform: `rotate(${imageRotation}deg)`, cursor: imageAction === 'drag' ? 'grabbing' : 'grab' }}
                  onMouseDown={handleImageMouseDown}
                >
                  <img src={image} alt="Attached" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {renderCornerHandles(
                    (e, c) => handleImageCornerDown(e, c),
                    handleImageRotateDown,
                    handleRemoveImage
                  )}
                </div>
              )}

              {stickers.map((s, index) => (
                <div
                  key={s.id}
                  className="letter-create__sticker-preview"
                  style={{ position: 'absolute', left: `${s.position.x}px`, top: `${s.position.y}px`, width: `${s.size.width}px`, height: `${s.size.height}px`, transform: `rotate(${s.rotation}deg)`, cursor: stickerAction === 'drag' && activeStickerIndex === index ? 'grabbing' : 'grab', zIndex: activeStickerIndex === index ? 10 : 5 }}
                  onMouseDown={(e) => handleStickerMouseDown(e, index)}
                >
                  <img src={s.src} alt="Sticker" draggable={false} style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }} />
                  {renderCornerHandles(
                    (e, c) => handleStickerCornerDown(e, index, c),
                    (e) => handleStickerRotateDown(e, index),
                    () => handleRemoveSticker(index)
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="letter-create__sticker-picker">
            <h3 className="letter-create__sticker-title">choose a sticker</h3>
            <div className="letter-create__sticker-grid">
              {STICKERS.map((s) => (
                <button key={s.src} className="letter-create__sticker-option" onClick={() => handleStickerSelect(s.src)} aria-label={s.label}>
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
