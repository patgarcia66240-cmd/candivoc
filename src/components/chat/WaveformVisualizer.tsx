import React, { useEffect, useRef, useMemo } from "react";

interface WaveformVisualizerProps {
  isRecording: boolean;
  color?: string;
  speed?: number;
  lineWidth?: number;
  height?: number;
  layers?: number;
}

/**
 * 🎙️ WaveformVisualizer
 * Visualise la voix avec des sinusoïdes animées.
 */
export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  color = "#ff7a00",
  speed = 1.0,
  lineWidth = 2,
  height = 72,
  layers = 3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  // Simule un niveau audio avec une animation aléatoire
  const level = useRef(0);

  // Stabiliser les options pour éviter les changements de dépendances
  const options = useMemo(() => ({
    color,
    speed,
    lineWidth,
    height,
    layers,
  }), [color, speed, lineWidth, height, layers]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = options.height * dpr;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resize();

    let phase = 0;
    let smoothLevel = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = options.height;

      ctx.clearRect(0, 0, w, h);

      if (!isRecording) {
        // ligne neutre si non actif
        ctx.strokeStyle = "#d1d5db";
        ctx.lineWidth = options.lineWidth;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        return;
      }

      // Simule un niveau audio aléatoire quand on enregistre
      if (Math.random() > 0.7) {
        level.current = Math.random() * 0.8;
      }

      // Amplitude lissée
      smoothLevel = smoothLevel * 0.8 + level.current * 0.2;
      const amp = Math.min(1, smoothLevel * 3);

      phase += 0.03 * options.speed;

      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineWidth = options.lineWidth;

      // dégradé horizontal
      const grad = ctx.createLinearGradient(0, 0, w, 0);
      grad.addColorStop(0, options.color);
      grad.addColorStop(0.5, options.color + "cc");
      grad.addColorStop(1, options.color);
      ctx.strokeStyle = grad;

      // plusieurs sinusoïdes superposées
      for (let layer = 0; layer < options.layers; layer++) {
        const progress = layer / Math.max(1, options.layers - 1);
        const localAmp = (h * 0.4) * amp * (1 - progress * 0.4);
        const freq = 1.5 + progress * 1.5;
        const alpha = 0.6 * (1 - progress * 0.6);

        ctx.globalAlpha = alpha;
        ctx.beginPath();

        for (let x = 0; x <= w; x++) {
          const t = (x / w) * Math.PI * 2 * freq + phase + progress * Math.PI / 2;
          const y =
            h / 2 +
            Math.sin(t) * localAmp * 0.8 +
            Math.sin(t * 0.5 + phase) * localAmp * 0.2;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, [isRecording, options]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full rounded-lg border border-gray-200 bg-white/70 backdrop-blur"
      style={{ height: options.height }}
    />
  );
};
