import React, { useState, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '../ui/Button';

interface AudioRecorderProps {
  isRecording: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  isDisabled?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  isRecording,
  onStartRecording,
  onStopRecording,
  isDisabled = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleToggleRecording = useCallback(() => {
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  }, [isRecording, onStartRecording, onStopRecording]);

  return (
    <div className="flex flex-col items-center space-y-4">
      <div
        className={`relative transition-all duration-200 ${
          isHovered ? 'scale-105' : 'scale-100'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Button
          onClick={handleToggleRecording}
          disabled={isDisabled}
          variant={isRecording ? 'secondary' : 'primary'}
          size="lg"
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isRecording
              ? 'bg-gray-500 hover:bg-slate-600 animate-pulse'
              : 'bg-slate-500 hover:bg-slate-600'
            }
          `}
        >
          {isRecording ? (
            <Square className="w-6 h-6 text-white" />
          ) : (
            <Mic className="w-6 h-6 text-white" />
          )}
        </Button>

        {isRecording && (
          <div className="absolute inset-0 rounded-full bg-gray-400 animate-ping opacity-75" />
        )}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-700">
          {isDisabled && !isRecording ? (
            'Veuillez patienter...'
          ) : isRecording ? (
            'Enregistrement en cours...'
          ) : (
            'Cliquez pour parler'
          )}
        </p>
        {isDisabled && !isRecording && (
          <p className="text-xs text-gray-500 mt-1">
            L'IA est en train de parler
          </p>
        )}
        {isRecording && !isDisabled && (
          <p className="text-xs text-gray-500 mt-1">
            Appuyez pour arrêter l'enregistrement
          </p>
        )}
      </div>
    </div>
  );
};
