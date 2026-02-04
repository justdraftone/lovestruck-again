import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLetterStore } from '../store/letterStore';

export default function CreateLetter() {
  const navigate = useNavigate();
  const { createLetter } = useLetterStore();
  const [content, setContent] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImage(undefined);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDone = () => {
    if (!content.trim()) return;
    const letterId = createLetter(content.trim(), image);
    navigate(`/letters/send/${letterId}`);
  };

  return (
    <div className="page gradient-love">
      <div className="letter-create">
        <div className="letter-create__header">
          <img src="/assets/illos/d1-x-loveorlies.svg" alt="draftone x love or lies" />
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

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          style={{ display: 'none' }}
        />

        <div className="letter-create__card">
          <div className="letter-create__content">
            <h2 className="letter-create__greeting">Dear xxxx,</h2>
            <textarea
              className="letter-create__textarea"
              placeholder="Write your beautiful letter here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={8}
            />

            {image && (
              <div className="letter-create__image-preview">
                <img src={image} alt="Attached" />
                <button
                  onClick={handleRemoveImage}
                  className="letter-create__image-remove"
                  aria-label="Remove image"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="letter-create__decoration letter-create__decoration--left">
        <img src="/assets/illos/polaroid.svg" alt="" />
      </div>
      <div className="letter-create__decoration letter-create__decoration--right">
        <img src="/assets/illos/letters-floating-img.svg" alt="" />
      </div>

      <div className="highlight-glow"></div>
    </div>
  );
}
