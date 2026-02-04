import { useEffect, useRef } from 'react';

export default function NoiseOverlay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const tileSize = 256;
    const numFrames = 8;
    const frames: ImageData[] = [];

    // Pre-generate noise frames
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = tileSize;
    tempCanvas.height = tileSize;
    const tempCtx = tempCanvas.getContext('2d')!;

    for (let f = 0; f < numFrames; f++) {
      const imageData = tempCtx.createImageData(tileSize, tileSize);
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value;
        data[i + 1] = value;
        data[i + 2] = value;
        data[i + 3] = 50;
      }
      frames.push(imageData);
    }

    let currentFrame = 0;
    let intervalId: ReturnType<typeof setInterval>;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render();
    };

    const render = () => {
      const { width, height } = canvas;
      const frame = frames[currentFrame % numFrames];

      tempCtx.putImageData(frame, 0, 0);

      const pattern = ctx.createPattern(tempCanvas, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, width, height);
      }

      currentFrame++;
    };

    resize();
    window.addEventListener('resize', resize);

    // Animate at ~10fps for a subtle grain shift
    intervalId = setInterval(render, 100);

    return () => {
      window.removeEventListener('resize', resize);
      clearInterval(intervalId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="noise-overlay-canvas"
      aria-hidden="true"
    />
  );
}
