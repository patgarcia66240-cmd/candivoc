import { useState, useEffect, useRef, useCallback } from 'react';

interface UseVoiceLevelOptions {
  enabled?: boolean;
  onUpdate?: (level: number) => void;
}

export const useVoiceLevel = ({ enabled = true, onUpdate }: UseVoiceLevelOptions = {}) => {
  const [volumeLevel, setVolumeLevel] = useState(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startListening = useCallback(async () => {
    if (!enabled) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyserRef.current = analyser;

      const updateVolume = () => {
        if (!analyserRef.current) return;

        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }

        const average = sum / dataArray.length;
        const normalizedLevel = Math.min(100, (average / 128) * 100);

        setVolumeLevel(normalizedLevel);
        onUpdate?.(normalizedLevel);

        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (error) {
      console.error('Error accessing microphone for volume detection:', error);
      // Simulation si pas accès au micro
      const simulateVolume = () => {
        const randomLevel = Math.random() * 30 + (enabled ? 0 : 0);
        setVolumeLevel(randomLevel);
        onUpdate?.(randomLevel);

        if (enabled) {
          animationFrameRef.current = requestAnimationFrame(simulateVolume);
        }
      };

      if (enabled) {
        simulateVolume();
      }
    }
  }, [enabled, onUpdate]);

  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (analyserRef.current) {
      analyserRef.current = null;
    }

    setVolumeLevel(0);
  }, []);

  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }

    return () => {
      stopListening();
    };
  }, [enabled, startListening, stopListening]);

  return {
    volumeLevel,
    startListening,
    stopListening
  };
};