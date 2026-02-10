import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function CouplesModeSelect() {
  const navigate = useNavigate();

  // Debug controls
  const [showDebug, setShowDebug] = useState(true);
  const [containerMaxWidth, setContainerMaxWidth] = useState(129);
  const [containerPadding, setContainerPadding] = useState(0);
  const [modeCardWidth, setModeCardWidth] = useState(127);
  const [modeCardMarginTop, setModeCardMarginTop] = useState(0);

  // Back button debug controls
  const [backBtnPadding, setBackBtnPadding] = useState(12);
  const [backBtnPaddingX, setBackBtnPaddingX] = useState(26);
  const [backBtnBorderRadius, setBackBtnBorderRadius] = useState(20);
  const [backBtnFontSize, setBackBtnFontSize] = useState(1);
  const [backBtnMarginBottom, setBackBtnMarginBottom] = useState(-84);
  const [backBtnMarginTop, setBackBtnMarginTop] = useState(69);
  const [backBtnMarginLeft, setBackBtnMarginLeft] = useState(139);
  const [backBtnMarginRight, setBackBtnMarginRight] = useState(-65);

  const copyCSS = () => {
    const css = `
@media (max-width: 768px) {
  .container--couples-mode-select {
    max-width: ${containerMaxWidth}%;
    padding: 0 ${containerPadding}px;
  }

  .mode-card {
    width: ${modeCardWidth}%;
    margin-top: ${modeCardMarginTop}px;
  }

  .header__couples-quiz .back-btn {
    padding: ${backBtnPadding}px ${backBtnPaddingX}px;
    border-radius: ${backBtnBorderRadius}px;
    font-size: ${backBtnFontSize}rem;
    margin-top: ${backBtnMarginTop}px;
    margin-bottom: ${backBtnMarginBottom}px;
    margin-left: ${backBtnMarginLeft}px;
    margin-right: ${backBtnMarginRight}px;
  }
}`;
    navigator.clipboard.writeText(css);
    alert('CSS copied to clipboard!');
  };

  return (
    <div className="page page--centered gradient-love">
      <style>{`
        @media (max-width: 768px) {
          .container--couples-mode-select {
            max-width: ${containerMaxWidth}% !important;
            padding: 0 ${containerPadding}px !important;
          }

          .mode-card {
            width: ${modeCardWidth}% !important;
            margin-top: ${modeCardMarginTop}px !important;
          }

          .header__couples-quiz .back-btn {
            padding: ${backBtnPadding}px ${backBtnPaddingX}px !important;
            border-radius: ${backBtnBorderRadius}px !important;
            font-size: ${backBtnFontSize}rem !important;
            margin-top: ${backBtnMarginTop}px !important;
            margin-bottom: ${backBtnMarginBottom}px !important;
            margin-left: ${backBtnMarginLeft}px !important;
            margin-right: ${backBtnMarginRight}px !important;
          }
        }
      `}</style>

      <div className="container container--couples-mode-select">

        <div className="header header__couples-quiz">
          <img src="../../public/assets/illos/d1-x-loveorlies.svg" alt="" onClick={() => navigate('/')} style={{ cursor: 'pointer' }} />
          <button onClick={() => navigate('/')} className="back-btn">
            Back
          </button>
        </div>

        <div className="btn-group btn-group--couples-mode-select">
          <button onClick={() => navigate('/couples/together')} className="mode-card">
            <div className="mode-card__inner">
              <img src="/assets/illos/play-together.svg" alt="Play Together" className="mode-card__icon" />
              <div>
                <h3 className="mode-card__title">Play Together</h3>
                <p className="mode-card__desc">Share one device, take turns answering</p>
              </div>
            </div>
          </button>

          <div onClick={() => navigate('/couples/remote')} className="mode-card mode-card--remotely">
            <div className="mode-card__inner">
              <img src="/assets/illos/play-remotely.svg" alt="Play Remotely" className="mode-card__icon" />
              <div>
                <h3 className="mode-card__title">Play Remotely</h3>
                <p className="mode-card__desc">Share a link, play from separate devices</p>
                {/* <p className="mode-card__badge">Coming soon!</p> */}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      <div className='highlight-glow highlight-glow--results'></div>

      {showDebug && (
        <div style={{
          position: 'fixed',
          bottom: 20,
          left: 20,
          right: 20,
          background: 'rgba(0,0,0,0.9)',
          padding: '20px',
          borderRadius: '12px',
          zIndex: 10000,
          maxHeight: '70vh',
          overflow: 'auto',
          color: 'white',
          fontSize: '14px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0 }}>Couples Mode Debug</h3>
            <button onClick={() => setShowDebug(false)} style={{ background: '#ff4444', border: 'none', padding: '5px 10px', borderRadius: '6px', color: 'white', cursor: 'pointer' }}>
              Hide
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Container Max Width: {containerMaxWidth}%</label>
            <input type="range" min="80" max="150" value={containerMaxWidth} onChange={(e) => setContainerMaxWidth(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Container Padding: {containerPadding}px</label>
            <input type="range" min="0" max="64" value={containerPadding} onChange={(e) => setContainerPadding(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Mode Card Width: {modeCardWidth}%</label>
            <input type="range" min="80" max="150" value={modeCardWidth} onChange={(e) => setModeCardWidth(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Mode Card Margin Top: {modeCardMarginTop}px</label>
            <input type="range" min="-200" max="200" value={modeCardMarginTop} onChange={(e) => setModeCardMarginTop(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #555' }} />
          <h4 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>Back Button</h4>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Padding Y: {backBtnPadding}px</label>
            <input type="range" min="0" max="100" value={backBtnPadding} onChange={(e) => setBackBtnPadding(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Padding X: {backBtnPaddingX}px</label>
            <input type="range" min="0" max="200" value={backBtnPaddingX} onChange={(e) => setBackBtnPaddingX(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Border Radius: {backBtnBorderRadius}px</label>
            <input type="range" min="0" max="100" value={backBtnBorderRadius} onChange={(e) => setBackBtnBorderRadius(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Font Size: {backBtnFontSize}rem</label>
            <input type="range" min="0.5" max="5" step="0.1" value={backBtnFontSize} onChange={(e) => setBackBtnFontSize(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Margin Top: {backBtnMarginTop}px</label>
            <input type="range" min="-300" max="300" value={backBtnMarginTop} onChange={(e) => setBackBtnMarginTop(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Margin Bottom: {backBtnMarginBottom}px</label>
            <input type="range" min="-300" max="300" value={backBtnMarginBottom} onChange={(e) => setBackBtnMarginBottom(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Margin Left: {backBtnMarginLeft}px</label>
            <input type="range" min="-500" max="500" value={backBtnMarginLeft} onChange={(e) => setBackBtnMarginLeft(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Margin Right: {backBtnMarginRight}px</label>
            <input type="range" min="-500" max="500" value={backBtnMarginRight} onChange={(e) => setBackBtnMarginRight(Number(e.target.value))} style={{ width: '100%' }} />
          </div>

          <button onClick={copyCSS} style={{ width: '100%', padding: '12px', background: '#4CAF50', border: 'none', borderRadius: '8px', color: 'white', cursor: 'pointer', fontSize: '16px', fontWeight: 'bold' }}>
            Copy CSS
          </button>
        </div>
      )}

      {!showDebug && (
        <button onClick={() => setShowDebug(true)} style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          background: 'rgba(0,0,0,0.7)',
          border: 'none',
          padding: '10px 15px',
          borderRadius: '8px',
          color: 'white',
          cursor: 'pointer',
          zIndex: 10000,
          fontSize: '14px'
        }}>
          Show Debug
        </button>
      )}
    </div>
  );
}
