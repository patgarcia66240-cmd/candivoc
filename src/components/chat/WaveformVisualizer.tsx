import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  isRecording: boolean;
  audioData?: Uint8Array;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  isRecording,
  audioData
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (!isRecording) {
        // Ligne plate quand pas d'enregistrement
        ctx.strokeStyle = '#d1d5db';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height / 2);
        ctx.lineTo(canvas.width, canvas.height / 2);
        ctx.stroke();
        return;
      }

      // Animation simple quand on enregistre
      ctx.strokeStyle = '#3b3d3eff';
      ctx.lineWidth = 3;
      ctx.beginPath();

      const bars = 40;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < bars; i++) {
        const height = Math.random() * (canvas.height * 0.99) + (canvas.height * 0.01);
        const x = i * barWidth + barWidth / 2;

        ctx.moveTo(x, canvas.height / 2 - height / 2);
        ctx.lineTo(x, canvas.height / 2 + height / 2);
      }

      ctx.stroke();
    };

    const animate = () => {
      draw();
      if (isRecording) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRecording, audioData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className="w-full h-16 bg-gray-50 rounded-lg border border-gray-200"
    />
  );
};
