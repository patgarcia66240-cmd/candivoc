import React, { useState, useCallback } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '../ui/Button';
import { audioService } from '../../services/audio/audioService';

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
    console.log("🔘 AudioRecorder clicked - isRecording:", isRecording, "isDisabled:", isDisabled);

    if (isRecording) {
      console.log("🚨 Emergency stop via click!");
      // Forcer l'arrêt même si le bouton est désactivé
      try {
        onStopRecording();
      } catch (error) {
        console.error("❌ Error in normal onStopRecording, forcing emergency stop:", error);
        // En cas d'erreur, forcer quand même l'arrêt des services audio
        try {
          // Forcer l'arrêt des services audio
        audioService.stopSpeechRecognition();
        audioService.abortSpeechRecognition();
        } catch (e) {
          console.error("Emergency stop failed completely:", e);
        }
      }
    } else if (!isDisabled) {
      console.log("▶️ Calling onStartRecording...");
      onStartRecording();
    } else {
      console.log("⚠️ Button is disabled, ignoring click");
    }
  }, [isRecording, isDisabled, onStartRecording, onStopRecording]);

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
          disabled={isDisabled && !isRecording} // Toujours cliquable pendant l'enregistrement
          variant={isRecording ? 'secondary' : 'primary'}
          size="lg"
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isRecording
              ? 'bg-red-500 hover:bg-red-600 animate-pulse cursor-pointer' // Rouge pour l'arrêt d'urgence
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
          {isRecording ? (
            'Enregistrement en cours...'
          ) : (
            'Cliquez pour parler'
          )}
        </p>
        {isRecording && (
          <p className="text-xs text-red-600 mt-1 font-medium">
            🚨 Cliquez pour arrêter
          </p>
        )}
        {isRecording && (
          <p className="text-xs text-blue-600 mt-1 font-medium">
            💡 Barre d'espace : arrêt d'urgence
          </p>
        )}
      </div>
    </div>
  );
};
