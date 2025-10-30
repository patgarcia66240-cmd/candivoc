// src/hooks/useMicLevel.ts
import { useEffect, useState, useRef } from "react";

export function useMicLevel(isActive: boolean) {
  const [level, setLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

  useEffect(() => {
    let raf: number;

    async function init() {
      if (!isActive) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 1024;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.fftSize);
      audioCtxRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      sourceRef.current = source;

      const update = () => {
        if (!analyserRef.current || !dataArrayRef.current) return;
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        // RMS (root mean square) amplitude
        let sum = 0;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const value = (dataArrayRef.current[i] - 128) / 128;
          sum += value * value;
        }
        const rms = Math.sqrt(sum / dataArrayRef.current.length);

        // adoucissement et limite
        setLevel((prev) => prev * 0.8 + rms * 1.2);
        raf = requestAnimationFrame(update);
      };
      update();
    }

    init();

    return () => {
      cancelAnimationFrame(raf);
      audioCtxRef.current?.close();
      sourceRef.current?.disconnect();
      analyserRef.current = null;
      dataArrayRef.current = null;
    };
  }, [isActive]);

  return level; // entre 0 et ~0.8
}
